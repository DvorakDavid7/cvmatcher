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

    console.log("=== UPLOADED FILES ===");
    console.log(`Job Description: ${jobDescriptionFile.name} - Size: ${jobDescriptionFile.size} bytes`);

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

    for (const file of cvFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const text = await extractTextFromPDF(Buffer.from(arrayBuffer));
      console.log(`Extracted text from ${file.name}: ${text.slice(0, 100)}...`);
    }

    console.log(`Total CV files received: ${cvFiles.length}`);
    console.log("=====================");

    return NextResponse.json({
      message: "Files received successfully",
      jobDescription: {
        name: jobDescriptionFile.name,
        size: jobDescriptionFile.size,
        type: jobDescriptionFile.type,
      },
      cvFiles: cvFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      totalFiles: cvFiles.length + 1,
    });
  } catch (error) {
    console.error("Upload test error:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
