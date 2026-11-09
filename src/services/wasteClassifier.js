
import { loadTensorflowModel } from "react-native-fast-tflite";
import * as ImageManipulator from "expo-image-manipulator";
import jpeg from "jpeg-js";
import { toByteArray } from "base64-js";

const MODEL = require("../../assets/models/wastewatcher_quantized.tflite");
const CLASS_NAMES = require("../../assets/models/class_names.json");

let modelPromise = null;

async function getModel() {
  if (!modelPromise) {
    modelPromise = loadTensorflowModel(MODEL, []);
  }

  try {
    return await modelPromise;
  } catch (error) {
    modelPromise = null;
    throw error;
  }
}

async function prepareImage(imageUri) {
  const resized = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 224, height: 224 } }],
    {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!resized.base64) {
    throw new Error("Unable to convert the image.");
  }

  const jpegBytes = toByteArray(resized.base64);

  const decoded = jpeg.decode(jpegBytes, {
    useTArray: true,
    formatAsRGBA: true,
  });

  if (decoded.width !== 224 || decoded.height !== 224) {
    throw new Error("Image resizing failed.");
  }

  const rgb = new Float32Array(224 * 224 * 3);

  for (let pixel = 0; pixel < 224 * 224; pixel++) {
    const sourceIndex = pixel * 4;
    const targetIndex = pixel * 3;

    rgb[targetIndex] = decoded.data[sourceIndex];
    rgb[targetIndex + 1] = decoded.data[sourceIndex + 1];
    rgb[targetIndex + 2] = decoded.data[sourceIndex + 2];
  }

  return rgb;
}

export async function classifyWaste(imageUri) {
  if (!imageUri) {
    throw new Error("No image was provided.");
  }

  const model = await getModel();
  const imagePixels = await prepareImage(imageUri);

  const inputBuffer = imagePixels.buffer.slice(
    imagePixels.byteOffset,
    imagePixels.byteOffset + imagePixels.byteLength
  );

  const outputs = await model.run([inputBuffer]);

  if (!outputs || !outputs[0]) {
    throw new Error("The AI model returned no predictions.");
  }

  const probabilities = new Float32Array(outputs[0]);

  if (probabilities.length !== CLASS_NAMES.length) {
    throw new Error(
      `Expected ${CLASS_NAMES.length} predictions, received ${probabilities.length}.`
    );
  }

  let bestIndex = 0;

  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[bestIndex]) {
      bestIndex = i;
    }
  }

  return {
    className: CLASS_NAMES[bestIndex],
    confidence: probabilities[bestIndex],
    classIndex: bestIndex,
  };
}
