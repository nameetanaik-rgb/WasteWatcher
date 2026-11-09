import os

ORIGINAL = r"D:\WasteWatcher\dataset"

expected_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".webp", ".gif")

for class_name in sorted(os.listdir(ORIGINAL)):
    class_path = os.path.join(ORIGINAL, class_name)

    if not os.path.isdir(class_path):
        continue

    files = [
        f for f in os.listdir(class_path)
        if f.lower().endswith(expected_extensions)
    ]

    print(f"{class_name}: {len(files)} files")

print("\nComparison count completed.")