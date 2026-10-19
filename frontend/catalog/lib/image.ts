// Phone photos are often 5-10 MB; nobody needs that on the Street. Large
// images are scaled down in the browser before upload, which makes the
// upload (and the mock backend's data URLs) quick. Anything that can't be
// decoded here (old browsers, tests, odd formats) is sent unchanged.
const MAX_SIDE = 1600;
const MIN_BYTES = 400 * 1024;
const KEEP_AS_IS = ["image/gif", "image/svg+xml"];

export async function shrinkImage(file: File): Promise<File> {
  if (
    file.size < MIN_BYTES ||
    !file.type.startsWith("image/") ||
    KEEP_AS_IS.includes(file.type) ||
    typeof createImageBitmap !== "function" ||
    typeof document === "undefined"
  ) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    // PNGs may be transparent; everything else becomes a JPEG.
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
    if (!blob || blob.size >= file.size) return file;

    const name = type === "image/jpeg" ? file.name.replace(/\.[^.]*$/, "") + ".jpg" : file.name;
    return new File([blob], name, { type, lastModified: file.lastModified });
  } catch {
    return file;
  }
}
