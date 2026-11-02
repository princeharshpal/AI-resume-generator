import { describe, it, expect } from "vitest";
import { generateAtsResumePdf } from "../../src/utils/pdfGenerator";
import type { TailoredResumeContent } from "../../src/types/resume.types";

describe("pdfGenerator Utility", () => {
  it("should generate a valid PDF Buffer from resume content", async () => {
    const resumeData: TailoredResumeContent = {
      personal_info: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1 555-0100",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/johndoe",
        github: "github.com/johndoe",
      },
      target_role: "Senior Software Engineer",
      professional_summary:
        "Experienced software engineer with expertise in TypeScript and Node.js.",
      skills_matrix: {
        languages: ["TypeScript", "JavaScript", "Python"],
        frameworks: ["React", "Express", "Next.js"],
        databases: ["PostgreSQL", "Redis"],
        tools: ["Docker", "Git", "Vitest"],
      },
      experience: [
        {
          company: "Tech Corp",
          role: "Software Engineer",
          location: "San Francisco, CA",
          start_date: "2021",
          end_date: "Present",
          bullet_points: [
            "Built scalable microservices handling 10M requests daily.",
            "Designed and implemented automated CI/CD pipelines.",
          ],
        },
      ],
      education: [
        {
          institution: "University of Technology",
          degree: "B.S. Computer Science",
          field_of_study: "Computer Science",
          graduation_year: "2021",
        },
      ],
      projects: [
        {
          name: "Smart Resume Optimizer",
          technologies: ["Node.js", "Express", "TypeScript"],
          description: "Full-stack AI-powered resume enhancement platform.",
          bullet_points: [
            "Engineered an automated ATS parsing and scoring engine.",
          ],
        },
      ],
      projected_match_score: 95,
      highlighted_keywords: ["TypeScript", "PostgreSQL", "CI/CD"],
      applied_added_skills: ["Docker", "Kubernetes"],
    };

    const pdfBuffer = await generateAtsResumePdf(resumeData);

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    // PDF files start with the magic header "%PDF"
    expect(pdfBuffer.subarray(0, 4).toString()).toBe("%PDF");
  });
});
