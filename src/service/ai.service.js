import { GoogleGenAI } from "@google/genai";
import "dotenv/config"
const ai = new GoogleGenAI({});


export const generateQuestionAnswers = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are an IP university academic content generator.

Rules:
- Output ONLY valid JSON
- No explanations or markdown
- Follow this schema strictly:

{
  "questions": [
    {
      "questionText": string,
      "questionType": "Long_Answers",
      "weightage": number,
      "isAiGenerated": true,
      "answers": [
        {
          "answerText": string,
          "isAiGenerated": true
        }
      ]
    }
  ]
}
`
          }
        ]
      },
      {
        parts: [{ text: prompt }]
      }
    ]
  })
  return response.text;

}
export const generateTest = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are an academic test generator for IPU (Guru Gobind Singh Indraprastha University).

Your task is to generate HIGH-QUALITY, EXAM-READY questions strictly following these rules:

1. Generate questions ONLY in valid JSON format.
2. Do NOT include explanations, markdown, comments, or extra text.
3. The output must be an ARRAY of question objects.

Each question object MUST follow this exact structure:

{
  "questionText": "string (clear, academic, exam-level)",
  "questionType": "Multiple_Choice | Long_Answers | True/False | Fill_In_The_Blanks",
  "totalMarks": number,
  "answers": [
    {
      "answerText": "string",
      "isCorrect": boolean
    }
  ],
  "isAiGenerated": true
}

Rules per question type:

• Multiple_Choice:
  - Minimum 4 answer options
  - At least ONE answer must have "isCorrect": true
  - totalMarks between 1–5

• True/False:
  - Exactly 2 answers: "True" and "False"
  - Only ONE answer is correct
  - totalMarks = 1

• Long_Answers:
  - Only ONE answer object
  - "isCorrect" must be true
  - Answer should be a concise model answer
  - totalMarks between 5–10

• Fill_In_The_Blanks:
  - Answer text must contain only the correct word or phrase
  - totalMarks between 1–3

General Rules:
- Questions must be relevant to IPU university syllabus
- Maintain academic tone (no casual language)
- Avoid repeated or vague questions
- Do NOT invent subjects or marks outside academic norms
- Ensure JSON is directly usable in a backend API without modification
`
          }
        ]
      },
      {
        parts: [{ text: prompt }]
      }
    ]
  })
  return response.text;
}

export const validateAiTest = async (studentAnswer, modelAnswer, totalMarks) => {
  try {

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        responseMimeType: "application/json",
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an linent academic evaluator.
Task: Grade the student's written answer by comparing it to the model answer.

Evaluation Criteria:
1. Focus on SEMANTIC MEANING and core concepts.
2. Ignore minor grammatical errors or different wording.
3. If the student captures the essential point (e.g., mentioning 2NF and non-prime attributes for 3NF), award full or partial marks.

Parameters:
- Model Answer: "${modelAnswer}"
- Student Answer: "${studentAnswer}"
- Max Marks: ${totalMarks}

Return ONLY a JSON object: {"marksObtained": number}`
            }
          ]
        }
      ]
    });


    let rawText = response.text;
    
    if (rawText.includes("```")) {
      rawText = rawText.replace(/```json|```/gi, "").trim();
    }

    return JSON.parse(rawText);

  } catch (err) {
    console.error("❌ Evaluation Error:", err);
    return { marksObtained: 0, error: "AI failed to evaluate" };
  }
};