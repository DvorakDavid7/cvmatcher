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
