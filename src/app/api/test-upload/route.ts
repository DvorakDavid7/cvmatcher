import { compareResumesWithJobDescription } from "@/utils/openAiUtils";
import { extractTextFromPDF } from "@/utils/pdfUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get job description file
    const jobDescriptionFile = formData.get("jobDescription") as File;
    if (!jobDescriptionFile) {
      return NextResponse.json({ error: "No job description file received" }, { status: 400 });
    }

    // Get CV files
    const cvFiles: File[] = [];
    let fileIndex = 0;
    while (true) {
      const cvFile = formData.get(`cvFiles[${fileIndex}]`) as File;
      if (!cvFile) break;
      cvFiles.push(cvFile);
      console.log(`CV ${fileIndex + 1}: ${cvFile.name} - Size: ${cvFile.size} bytes`);
      fileIndex++;
    }

    const jobDescriptionText = await extractTextFromPDF(Buffer.from(await jobDescriptionFile.arrayBuffer()));
    const resumeTexts = await Promise.all(
      cvFiles.map(async (file) => extractTextFromPDF(Buffer.from(await file.arrayBuffer()))),
    );

    const result = await compareResumesWithJobDescription(jobDescriptionText, resumeTexts);

    return NextResponse.json({
      message: "Files received successfully",
      result,
    });
  } catch (error) {
    console.error("Upload test error:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
