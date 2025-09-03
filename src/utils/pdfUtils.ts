import pdf from "pdf-parse";

export async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  try {
    const data = await pdf(fileBuffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}
