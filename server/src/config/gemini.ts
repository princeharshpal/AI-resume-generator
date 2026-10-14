import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface GoogleFileRef {
  uri?: string;
  mimeType?: string;
  name?: string;
}

// const analyseResumeFromGemini = async (
//   fileRef: GoogleFileRef,
//   jobTitle: string,
//   jobDescription: string,
// ) =>
//   await ai.models.generateContent({
//     const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"],

//     contents: [
//       {
//         fileData: {
//           fileUri: fileRef.uri,
//           mimeType: fileRef.mimeType || "application/pdf",
//         },
//       },
//       `Target Role/Job Title: ${jobTitle}

// Job Description:
// ${jobDescription}`,
//     ],
//     config: {
//       systemInstruction: `You are a Senior Technical Recruiter and an advanced ATS (Applicant Tracking System) parser.
// Analyze the provided resume against the given Job Title and Job Description thoroughly.
// Be strict, objective, and realistic in scoring. Identify exact matching skills, critical missing skills/tools, and provide clear recommendations.`,
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.OBJECT,
//         properties: {
//           match_score: {
//             type: Type.INTEGER,
//             description: "Overall ATS compatibility score between 0 and 100",
//           },
//           role_fit_level: {
//             type: Type.STRING,
//             description: "E.g., High, Moderate, or Low fit",
//           },
//           matching_skills: {
//             type: Type.ARRAY,
//             items: { type: Type.STRING },
//             description: "Skills and keywords found in both resume and JD",
//           },
//           missing_skills: {
//             type: Type.ARRAY,
//             items: { type: Type.STRING },
//             description:
//               "Important skills, tech stack, or requirements present in JD but absent in resume",
//           },
//           critique_summary: {
//             type: Type.STRING,
//             description:
//               "Direct critique highlighting key strengths and major gaps",
//           },
//           actionable_recommendations: {
//             type: Type.ARRAY,
//             items: { type: Type.STRING },
//             description:
//               "Concrete bullet points on how to tailor the resume for this JD",
//           },
//         },
//         required: [
//           "match_score",
//           "role_fit_level",
//           "matching_skills",
//           "missing_skills",
//           "critique_summary",
//           "actionable_recommendations",
//         ],
//       },
//     },

//     for (const model of candidateModels) {
//     try {
//       console.log(`Analyzing resume with model: ${model}...`);
//       return await ai.models.generateContent({
//         model,
//         contents,
//         config,
//       });
//     } catch (error: any) {
//       const isOverloaded =
//         error?.message?.includes("503") ||
//         error?.message?.includes("high demand") ||
//         error?.status === "UNAVAILABLE";

//       if (isOverloaded && model !== candidateModels[candidateModels.length - 1]) {
//         console.warn(`Model ${model} is overloaded (503). Switching to fallback model...`);
//         continue;
//       }
//       throw error;
//     }
//   }
//   });

const analyseResumeFromGemini = async (
  fileRef: GoogleFileRef,
  jobTitle: string,
  jobDescription: string,
) => {
  const candidateModels = [
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-1.5-flash",
  ];

  const contents = [
    {
      fileData: {
        fileUri: fileRef.uri || "",
        mimeType: fileRef.mimeType || "application/pdf",
      },
    },
    `Target Role/Job Title: ${jobTitle}
      
Job Description:
${jobDescription}`,
  ];

  const config = {
    systemInstruction: `You are a Senior Technical Recruiter and an advanced ATS (Applicant Tracking System) parser. 
Analyze the provided resume against the given Job Title and Job Description thoroughly.
Be strict, objective, and realistic in scoring. Identify exact matching skills, critical missing skills/tools, and provide clear recommendations.`,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        match_score: {
          type: Type.INTEGER,
          description: "Overall ATS compatibility score between 0 and 100",
        },
        role_fit_level: {
          type: Type.STRING,
          description: "E.g., High, Moderate, or Low fit",
        },
        matching_skills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Skills and keywords found in both resume and JD",
        },
        missing_skills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "Important skills, tech stack, or requirements present in JD but absent in resume",
        },
        critique_summary: {
          type: Type.STRING,
          description:
            "Direct critique highlighting key strengths and major gaps",
        },
        actionable_recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "Concrete bullet points on how to tailor the resume for this JD",
        },
      },
      required: [
        "match_score",
        "role_fit_level",
        "matching_skills",
        "missing_skills",
        "critique_summary",
        "actionable_recommendations",
      ],
    },
  };

  for (const model of candidateModels) {
    try {
      console.log(`Analyzing resume with model: ${model}...`);
      return await ai.models.generateContent({
        model,
        contents,
        config,
      });
    } catch (error: any) {
      const isOverloaded =
        error?.message?.includes("503") ||
        error?.message?.includes("high demand") ||
        error?.status === "UNAVAILABLE";

      if (
        isOverloaded &&
        model !== candidateModels[candidateModels.length - 1]
      ) {
        console.warn(
          `Model ${model} is overloaded (503). Switching to fallback model...`,
        );
        continue;
      }
      throw error;
    }
  }
};

export { ai, analyseResumeFromGemini };
