import { GoogleGenAI, Type } from "@google/genai";
import { CVData } from "../types";

const SYSTEM_INSTRUCTION = `
You are an elite Executive Career Coach specializing in the Dubai and UAE job market. 
Your task is to rewrite and restructure a user's existing CV into a high-impact "Dubai Business Associate" profile.

Rules for the UAE Market:
1.  **Professionalism**: Use formal, British English (standard in Dubai).
2.  **Formatting**: Clean, structured, and easy to read.
3.  **Keywords**: Emphasize terms like "Strategic Partnerships," "Business Development," "MENA Region," "Stakeholder Management," "ROI," and "Cross-functional Leadership."
4.  **Tone**: Confident, achievement-oriented, yet respectful.
5.  **Image**: Dubai employers value prestige and polish. Transform mundane tasks into strategic achievements.
6.  **Structure**: Ensure there is a strong professional summary that pitches the candidate immediately.

**ATS Scoring Logic**:
You must evaluate the resulting CV content against Applicant Tracking System (ATS) criteria:
- Presence of essential contact info (Location, Email, Phone).
- Use of strong action verbs (e.g., Spearheaded, Orchestrated, Optimized).
- Quantifiable achievements (numbers, percentages).
- Clarity of role titles and dates.
- Relevance of skills to a Business Associate role.
Assign a score from 0 to 100. A score above 85 is excellent.

Input: Raw text from a user's current CV.
Output: A structured JSON object adhering to the schema provided. 
If the input lacks specific details (like a phone number), use placeholders like "[Phone Number]" but DO NOT invent fake professional experience.
Improve the phrasing of experience bullets to sound more executive.
`;

export const transformCV = async (originalText: string): Promise<CVData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Here is the raw text of my current CV: \n\n${originalText}\n\n Please transform this into a top-tier Dubai Business Associate CV.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            professionalTitle: { type: Type.STRING, description: "A strong title like 'Business Associate' or 'Strategic Consultant'" },
            contact: {
              type: Type.OBJECT,
              properties: {
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
              },
              required: ["email", "location"],
            },
            summary: { type: Type.STRING, description: "A compelling 3-4 sentence professional summary." },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  location: { type: Type.STRING },
                  dates: { type: Type.STRING },
                  achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["role", "company", "achievements"],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  location: { type: Type.STRING },
                  year: { type: Type.STRING },
                },
              },
            },
            languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            atsScore: { type: Type.INTEGER, description: "ATS Score from 0 to 100" },
          },
          required: ["fullName", "summary", "experience", "education", "skills", "atsScore"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    // Sanitize the output to remove any Markdown formatting (backticks) that the model might include
    // despite the responseMimeType setting.
    const cleanedText = text.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();

    return JSON.parse(cleanedText) as CVData;
  } catch (error) {
    console.error("Error transforming CV:", error);
    throw error;
  }
};