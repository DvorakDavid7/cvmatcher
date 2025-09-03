import OpenAI from "openai";
const client = new OpenAI();

export async function testOpenAi() {
  const response = await client.responses.create({
    model: "gpt-5",
    input: "Write a one-sentence bedtime story about a unicorn.",
  });
  console.log("OpenAI response:", response.output_text);
}

export async function compareResumesWithJobDescription(jobDescription: string, resumes: string[]): Promise<string> {
  const prompt = `
        You are an expert It HR consultant. Compare the following resumes with the job description
        and provide a score from 1 to 100 for each resume based on how well it matches the job description.
        Provide a brief explanation for each score.
        Return the results in JSON format with the following structure:
        [
            {
                "fullName": "John Doe",
                "score": 85,
                "explanation": "The candidate has relevant experience and skills."
            },
            ...
        ]
    
        Job Description:
        ${jobDescription}

        Resumes:
        ${resumes.map((resume, index) => `Resume ${index + 1}:\n${resume}`).join("\n\n")}
    `;

  const response = await client.responses.create({
    model: "gpt-5",
    input: prompt,
  });

  return response.output_text;
}

export async function generateLinkedInBooleanSearch(jobDescription: string): Promise<string> {
  const prompt = `
        You are an expert recruiter and LinkedIn search specialist. Based on the following job description, 
        generate a precise LinkedIn boolean search query that will help find qualified candidates.

        Instructions:
        - Focus on the most important qualifications and requirements
        - Keep the search practical and not overly complex
        - Return only the boolean search string, nothing else

        Job Description:
        ${jobDescription}
    `;

  const response = await client.responses.create({
    model: "gpt-5",
    input: prompt,
  });

  return response.output_text.replace(/```/g, '').replace(/linkedin/gi, '').replace(/boolean search:/gi, '').trim();
}
