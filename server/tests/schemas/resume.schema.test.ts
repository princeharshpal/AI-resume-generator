import { describe, it, expect } from "vitest";
import {
  resumeAnalyseSchema,
  generateResumeSchema,
  downloadResumeSchema,
} from "../../src/schemas/resume.schema";

describe("Resume Schemas", () => {
  describe("resumeAnalyseSchema", () => {
    it("should accept valid analyse payload", () => {
      const valid = {
        file_name: "resumes/user123.pdf",
        job_title: "Full Stack Engineer",
        job_description: "We are looking for a Node.js and React developer.",
      };
      const result = resumeAnalyseSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject when required fields are missing", () => {
      expect(resumeAnalyseSchema.safeParse({ job_title: "Dev" }).success).toBe(false);
    });
  });

  describe("generateResumeSchema", () => {
    it("should accept valid generate payload and default added_skills to []", () => {
      const payload = {
        file_name: "file.pdf",
        job_title: "Software Engineer",
        job_description: "Build robust backend microservices.",
      };
      const result = generateResumeSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.added_skills).toEqual([]);
      }
    });

    it("should preserve custom added_skills list", () => {
      const payload = {
        file_name: "file.pdf",
        job_title: "Software Engineer",
        job_description: "Build robust backend microservices.",
        added_skills: ["Docker", "Kubernetes"],
      };
      const result = generateResumeSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.added_skills).toEqual(["Docker", "Kubernetes"]);
      }
    });
  });

  describe("downloadResumeSchema", () => {
    it("should provide sensible defaults for optional fields", () => {
      const payload = {
        job_title: "Product Manager",
      };
      const result = downloadResumeSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.company_name).toBe("Target Company");
        expect(result.data.match_score).toBe(90);
        expect(result.data.matching_skills).toEqual([]);
      }
    });
  });
});

