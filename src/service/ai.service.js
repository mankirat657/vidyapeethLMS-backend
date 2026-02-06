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
                parts : [{text : prompt}]
            }
        ]
    })
    return response.text;

}