import { generateLinkedInBooleanSearch } from "@/utils/openAiUtils";
import { extractTextFromPDF } from "@/utils/pdfUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const jobDescriptionFile = formData.get("jobDescription") as File;
    if (!jobDescriptionFile) {
      return NextResponse.json({ error: "No job description file received" }, { status: 400 });
    }

    const jobDescriptionText = await extractTextFromPDF(Buffer.from(await jobDescriptionFile.arrayBuffer()));
    const linkedInSearch = await generateLinkedInBooleanSearch(jobDescriptionText);

    return NextResponse.json({
      message: "LinkedIn search generated successfully",
      search: linkedInSearch,
    });
  } catch (error) {
    console.error("LinkedIn search generation error:", error);
    return NextResponse.json({ error: "Failed to generate LinkedIn search" }, { status: 500 });
  }
}