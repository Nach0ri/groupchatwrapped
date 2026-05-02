import JSZip from "jszip";

export async function readChatFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) {
    return await file.text();
  }
  if (name.endsWith(".zip")) {
    const buf = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const candidate =
      zip.file("_chat.txt") ??
      zip.file(/_chat\.txt$/i)[0] ??
      zip.file(/\.txt$/i)[0];
    if (!candidate) {
      throw new Error("No _chat.txt found inside zip.");
    }
    return await candidate.async("string");
  }
  throw new Error("Unsupported file type. Drop a .txt or .zip from WhatsApp.");
}
