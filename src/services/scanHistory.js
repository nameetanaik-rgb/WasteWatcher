
import * as FileSystem from "expo-file-system/legacy";
import * as Network from "expo-network";
import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";

const HISTORY_FILE = `${FileSystem.documentDirectory}scan_history.json`;
const IMAGES_DIRECTORY = `${FileSystem.documentDirectory}scan_history_images/`;
const BUCKET_NAME = "waste-scans";

let isSyncingPendingScans = false;

async function ensureStorage() {
  const directoryInfo = await FileSystem.getInfoAsync(IMAGES_DIRECTORY);

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIRECTORY, {
      intermediates: true,
    });
  }
}

async function readHistory() {
  try {
    const fileInfo = await FileSystem.getInfoAsync(HISTORY_FILE);

    if (!fileInfo.exists) return [];

    const content = await FileSystem.readAsStringAsync(HISTORY_FILE);
    const history = JSON.parse(content);

    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error("History read error:", error);
    return [];
  }
}

async function writeHistory(history) {
  await FileSystem.writeAsStringAsync(
    HISTORY_FILE,
    JSON.stringify(history)
  );
}

async function getSessionUser() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return data.session?.user ?? null;
}

function getContentType(extension) {
  const ext = extension.toLowerCase();

  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";

  return "image/jpeg";
}

async function updateLocalScan(scan) {
  const history = await readHistory();

  const updatedHistory = history.map((item) =>
    item.id === scan.id ? scan : item
  );

  await writeHistory(updatedHistory);
}

async function syncScanToCloud(scan, user) {
  const extension =
    scan.imageUri.split("?")[0].split(".").pop()?.toLowerCase() || "jpg";

  const imagePath = `${user.id}/${scan.id}.${extension}`;

  try {
    // Check if this scan already exists in Supabase.
    const { data: existingScan, error: lookupError } = await supabase
      .from("scan_history")
      .select("id")
      .eq("user_id", user.id)
      .eq("image_path", imagePath)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existingScan) {
      scan.cloudId = existingScan.id;
      scan.imagePath = imagePath;
      scan.cloudSyncStatus = "synced";

      await updateLocalScan(scan);

      console.log("Scan was already synced:", scan.id);
      return scan;
    }

    // Read the saved image as Base64.
    const base64 = await FileSystem.readAsStringAsync(scan.imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Upload using a stable path. Do not use upsert.
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(imagePath, decode(base64), {
        contentType: getContentType(extension),
        upsert: false,
      });

    // An existing image is okay; continue to the database check.
    if (
      uploadError &&
      uploadError.statusCode !== "409" &&
      !String(uploadError.message || "")
        .toLowerCase()
        .includes("already exists")
    ) {
      throw uploadError;
    }

    // Insert the scan record.
    const { data, error: insertError } = await supabase
      .from("scan_history")
      .insert({
        user_id: user.id,
        class_name: scan.className,
        confidence: scan.confidence,
        image_path: imagePath,
        scanned_at: scan.date,
      })
      .select("id")
      .single();

    if (insertError) {
      // Verify whether the database insert already succeeded.
      const { data: retryCheck, error: retryError } = await supabase
        .from("scan_history")
        .select("id")
        .eq("user_id", user.id)
        .eq("image_path", imagePath)
        .maybeSingle();

      if (retryError) throw retryError;
      if (!retryCheck) throw insertError;

      scan.cloudId = retryCheck.id;
    } else {
      scan.cloudId = data.id;
    }

    scan.imagePath = imagePath;
    scan.cloudSyncStatus = "synced";

    await updateLocalScan(scan);

    console.log("Scan successfully synced:", scan.id);

    return scan;
  } catch (error) {
    console.warn("Cloud sync failed. Scan remains pending:", error);

    scan.cloudSyncStatus = "pending";

    await updateLocalScan(scan);

    return scan;
  }
}

// Automatically retry pending scans.
export async function syncPendingScans() {
  if (isSyncingPendingScans) {
    console.log("Sync already running. Skipping duplicate request.");
    return;
  }

  isSyncingPendingScans = true;

  try {
    console.log("PENDING SYNC FUNCTION STARTED");

    // Confirm internet access.
    const networkState = await Network.getNetworkStateAsync();

    if (
      !networkState.isConnected ||
      networkState.isInternetReachable === false
    ) {
      console.log("No internet. Pending scans will wait.");
      return;
    }

    const user = await getSessionUser();

    if (!user) {
      console.log("No logged-in user. Skipping cloud sync.");
      return;
    }

    const history = await readHistory();

    console.log("LOCAL HISTORY BEFORE SYNC:", history);

    const pendingScans = history.filter(
      (scan) =>
        scan.cloudSyncStatus === "pending" &&
        !scan.cloudId &&
        !scan.isCloudOnly
    );

    console.log("Pending scans waiting for sync:", pendingScans.length);

    for (const scan of pendingScans) {
      await syncScanToCloud(scan, user);
    }

    console.log("Pending scan sync process finished.");
  } catch (error) {
    console.warn("Pending scan sync error:", error);
  } finally {
    isSyncingPendingScans = false;
  }
}

export async function getScanHistory() {
  const localHistory = await readHistory();

  try {
    const user = await getSessionUser();

    if (!user) return localHistory;

    const { data: cloudScans, error } = await supabase
      .from("scan_history")
      .select("*")
      .eq("user_id", user.id)
      .order("scanned_at", { ascending: false });

    if (error) throw error;

    const syncedCloudIds = new Set(
      localHistory.map((scan) => scan.cloudId).filter(Boolean)
    );

    const remoteHistory = await Promise.all(
      (cloudScans || [])
        .filter((scan) => !syncedCloudIds.has(scan.id))
        .map(async (scan) => {
          let imageUri = "";

          if (scan.image_path) {
            const { data, error: urlError } = await supabase.storage
              .from(BUCKET_NAME)
              .createSignedUrl(scan.image_path, 3600);

            if (!urlError) {
              imageUri = data?.signedUrl || "";
            }
          }

          return {
            id: `cloud-${scan.id}`,
            cloudId: scan.id,
            imagePath: scan.image_path,
            imageUri,
            className: scan.class_name,
            confidence: Number(scan.confidence),
            date: scan.scanned_at,
            isCloudOnly: true,
          };
        })
    );

    return [...localHistory, ...remoteHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  } catch (error) {
    console.warn("Could not load cloud history:", error);
    return localHistory;
  }
}

export async function saveScan(imageUri, prediction) {
  if (
    !imageUri ||
    !prediction?.className ||
    typeof prediction.confidence !== "number"
  ) {
    throw new Error("Invalid scan information.");
  }

  await ensureStorage();

  const id = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  const extension =
    imageUri.split("?")[0].split(".").pop()?.toLowerCase() || "jpg";

  const imagePath = `${IMAGES_DIRECTORY}${id}.${extension}`;

  await FileSystem.copyAsync({
    from: imageUri,
    to: imagePath,
  });

  const newScan = {
    id,
    imageUri: imagePath,
    className: prediction.className,
    confidence: prediction.confidence,
    date: new Date().toISOString(),
    cloudSyncStatus: "local",
  };

  // Always save locally first.
  const history = await readHistory();

  history.unshift(newScan);

  await writeHistory(history);

  try {
    const user = await getSessionUser();

    if (user) {
      await syncScanToCloud(newScan, user);
    }
  } catch (error) {
    console.warn("Cloud sync unavailable. Scan saved locally:", error);

    newScan.cloudSyncStatus = "pending";
    await updateLocalScan(newScan);
  }

  return newScan;
}

async function deleteCloudScan(cloudId, imagePath) {
  if (!cloudId) return;

  if (imagePath) {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([imagePath]);

    if (error) {
      console.warn("Cloud image deletion warning:", error);
    }
  }

  const { error } = await supabase
    .from("scan_history")
    .delete()
    .eq("id", cloudId);

  if (error) throw error;
}

export async function deleteScan(scanId) {
  const history = await readHistory();

  const scanToDelete = history.find((scan) => scan.id === scanId);

  if (scanToDelete?.cloudId) {
    await deleteCloudScan(
      scanToDelete.cloudId,
      scanToDelete.imagePath
    );
  }

  if (scanId.startsWith("cloud-")) {
    const cloudId = scanId.replace("cloud-", "");
    const user = await getSessionUser();

    if (user) {
      const { data, error } = await supabase
        .from("scan_history")
        .select("image_path")
        .eq("id", cloudId)
        .maybeSingle();

      if (error) throw error;

      await deleteCloudScan(cloudId, data?.image_path);
    }
  }

  if (scanToDelete?.imageUri && !scanToDelete.isCloudOnly) {
    try {
      await FileSystem.deleteAsync(scanToDelete.imageUri, {
        idempotent: true,
      });
    } catch (error) {
      console.warn("Could not delete local scan image:", error);
    }
  }

  const updatedHistory = history.filter((scan) => scan.id !== scanId);

  await writeHistory(updatedHistory);

  return updatedHistory;
}

export async function clearScanHistory() {
  const history = await readHistory();

  for (const scan of history) {
    if (scan.imageUri && !scan.isCloudOnly) {
      try {
        await FileSystem.deleteAsync(scan.imageUri, {
          idempotent: true,
        });
      } catch (error) {
        console.warn("Could not delete local scan image:", error);
      }
    }
  }

  try {
    const user = await getSessionUser();

    if (user) {
      const { data: cloudScans, error: fetchError } = await supabase
        .from("scan_history")
        .select("id, image_path")
        .eq("user_id", user.id);

      if (fetchError) throw fetchError;

      const imagePaths = (cloudScans || [])
        .map((scan) => scan.image_path)
        .filter(Boolean);

      if (imagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(imagePaths);

        if (storageError) throw storageError;
      }

      const { error: deleteError } = await supabase
        .from("scan_history")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
    }
  } catch (error) {
    console.error("Cloud history deletion failed:", error);
    throw error;
  }

  await writeHistory([]);

  return [];
}
