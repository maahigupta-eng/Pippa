import type { FileRole, UploadedFile } from "../shared/types";

export const MAX_FILE_MB = 15;
export const MAX_TOTAL_MB = 25;
export const ACCEPT = ".pdf,.docx,.xlsx,.xls,.xlsm,.csv,.txt,.md,.png,.jpg,.jpeg,.webp";

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = () => reject(new Error(`Couldn't read ${file.name}.`));
    r.readAsDataURL(file);
  });

/**
 * Turn a browser File into something the Worker can send to the model.
 * PDFs and images go as-is (the model reads scans and tables directly).
 * Word and Excel are converted to text here, so nothing heavy runs on the server.
 */
export async function readFile(file: File, role: FileRole): Promise<UploadedFile> {
  if (file.size > MAX_FILE_MB * 1024 * 1024) throw new Error(`${file.name} is over ${MAX_FILE_MB} MB. Split it or paste the key sections.`);
  const name = file.name;
  const ext = name.split(".").pop()?.toLowerCase() || "";

  if (ext === "pdf") return { name, role, kind: "pdf", mediaType: "application/pdf", data: await toBase64(file) };

  if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
    const mediaType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    return { name, role, kind: "image", mediaType, data: await toBase64(file) };
  }

  if (["csv", "txt", "md"].includes(ext)) return { name, role, kind: "text", mediaType: "text/plain", data: await file.text() };

  if (["xlsx", "xls", "xlsm"].includes(ext)) {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const parts = wb.SheetNames.map((s) => `--- Sheet: ${s} ---\n${XLSX.utils.sheet_to_csv(wb.Sheets[s], { blankrows: false })}`);
    return { name, role, kind: "text", mediaType: "text/plain", data: parts.join("\n\n") };
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { name, role, kind: "text", mediaType: "text/plain", data: value };
  }

  throw new Error(`Pippa can't read .${ext} files yet. Paste the text into the box instead.`);
}

export function totalSizeMB(files: UploadedFile[]): number {
  // base64 is ~4/3 of the original size; text is roughly 1 byte per char.
  const bytes = files.reduce((n, f) => n + (f.kind === "text" ? f.data.length : (f.data.length * 3) / 4), 0);
  return bytes / (1024 * 1024);
}
