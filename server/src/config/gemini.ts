import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface GoogleFileRef {
  uri?: string;
  mimeType?: string;
  name?: string;
}

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
    systemInstruction:
      process.env.ANALYSE_PROMPT ||
      `You are a Senior Technical Recruiter and an advanced ATS (Applicant Tracking System) parser. 
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

const generateTailoredResumeFromGemini = async (
  fileRef: GoogleFileRef,
  jobTitle: string,
  jobDescription: string,
  addedSkills: string[] = [],
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
    `Target Role / Target Job Title: ${jobTitle || "Candidate's Target Profession"}
      
Job Description:
${jobDescription || "Standard industry job requirements for target role."}

User Selected Added Skills to Incorporate into Resume:
${addedSkills.length > 0 ? addedSkills.join(", ") : "None specified"}

STRICT EXTRACTION & FIDELITY RULES:
1. ABSOLUTE TRUTHFULNESS: The candidate's real name, email, phone, location, companies, job titles, employment dates, projects, universities, and degrees MUST be accurately extracted from the attached resume document. DO NOT hallucinate or insert any fictional persona, placeholder names, fictional employers, or fake degrees.
2. PRESERVE ORIGINAL CAREER IDENTITY & FORMAT: Retain the candidate's authentic career domain, chronology, and accomplishments without altering their genuine job titles or company names.
3. INCORPORATING USER-SELECTED ADDED SKILLS:
   - Include the user-selected added skills (${addedSkills.length > 0 ? addedSkills.join(", ") : "none"}) into the appropriate skills matrix category (e.g. languages, frameworks, tools, or core_competencies).
   - Seamlessly and contextually incorporate these added skills into appropriate existing experience or project bullet points where relevant, without altering company names, employment dates, or template formatting.
4. ATS REFINEMENT: Enhance the professional summary and bullet points to emphasize relevant achievements and keywords matching the target role, while keeping all core facts 100% genuine to the candidate's resume.
5. If the candidate is from a non-software or non-engineering field, place their professional skills into core_competencies or tools. Do not force non-software backgrounds into artificial tech stacks.
6. If a field (e.g. phone, linkedin, portfolio, certifications, projects) is missing in the uploaded resume, leave it blank or omit it. DO NOT invent fake data.`,
  ];

  const config = {
    systemInstruction:
      process.env.GENERATE_RESUME_PROMPT ||
      `You are an Executive Technical Resume Writer and ATS Optimization Engine.
Your purpose is to parse the candidate's uploaded resume with 100% factual accuracy, preserve their authentic career identity, chronology, and qualifications, and optimize their resume for ATS compliance while naturally incorporating only the specific added skills they requested.
Under no circumstances should you replace their real background with generic templates, fictional software roles, or placeholder information.`,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        personal_info: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            linkedin: { type: Type.STRING },
            github: { type: Type.STRING },
            portfolio: { type: Type.STRING },
          },
          required: ["name"],
        },
        target_role: { type: Type.STRING },
        professional_summary: { type: Type.STRING },
        skills_matrix: {
          type: Type.OBJECT,
          properties: {
            languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
            databases: { type: Type.ARRAY, items: { type: Type.STRING } },
            cloud_devops: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
            core_competencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "Core domain competencies, business capabilities, or methodologies",
            },
          },
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              start_date: { type: Type.STRING },
              end_date: { type: Type.STRING },
              bullet_points: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              "role",
              "company",
              "start_date",
              "end_date",
              "bullet_points",
            ],
          },
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              technologies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              bullet_points: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              link: { type: Type.STRING },
            },
            required: ["name", "description", "technologies", "bullet_points"],
          },
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              institution: { type: Type.STRING },
              degree: { type: Type.STRING },
              field_of_study: { type: Type.STRING },
              graduation_year: { type: Type.STRING },
            },
            required: ["institution", "degree"],
          },
        },
        certifications: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        projected_match_score: { type: Type.INTEGER },
        highlighted_keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        applied_added_skills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: [
        "personal_info",
        "target_role",
        "professional_summary",
        "skills_matrix",
        "experience",
        "education",
        "projected_match_score",
        "highlighted_keywords",
        "applied_added_skills",
      ],
    },
  };

  for (const model of candidateModels) {
    try {
      console.log(`Generating tailored resume with model: ${model}...`);
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

export { ai, analyseResumeFromGemini, generateTailoredResumeFromGemini };
