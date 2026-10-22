import PDFDocument from "pdfkit";
import type { TailoredResumeContent } from "../types/resume.types";

export const generateAtsResumePdf = async (
  resume: TailoredResumeContent,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 36, bottom: 36, left: 42, right: 42 },
        info: {
          Title: `${resume.personal_info.name || "Candidate"} - ${resume.target_role || "Resume"}`,
          Author: resume.personal_info.name || "Candidate",
          Subject: "ATS-Optimized Professional Resume",
          Keywords: resume.highlighted_keywords?.join(", ") || "",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      const primaryColor = "#111827";
      const secondaryColor = "#374151";
      const accentColor = "#1f2937";
      const dividerColor = "#d1d5db";

      const pageWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;

      const name = resume.personal_info.name || "";
      if (name) {
        doc
          .font("Helvetica-Bold")
          .fontSize(20)
          .fillColor(primaryColor)
          .text(name, {
            align: "center",
          });
        doc.moveDown(0.2);
      }

      const contactParts = [
        resume.personal_info.email,
        resume.personal_info.phone,
        resume.personal_info.location,
        resume.personal_info.linkedin,
        resume.personal_info.github,
        resume.personal_info.portfolio,
      ].filter(Boolean);

      if (contactParts.length > 0) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(secondaryColor)
          .text(contactParts.join("   |   "), {
            align: "center",
          });
      }

      doc.moveDown(0.5);

      const leftMargin = doc.page.margins.left;

      const renderSectionHeading = (title: string) => {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 65) {
          doc.addPage();
        }

        doc.moveDown(0.45);
        doc.x = leftMargin;

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(accentColor)
          .text(title.toUpperCase(), leftMargin, doc.y, {
            characterSpacing: 1,
          });

        doc.moveDown(0.12);

        doc
          .strokeColor(dividerColor)
          .lineWidth(0.75)
          .moveTo(leftMargin, doc.y)
          .lineTo(leftMargin + pageWidth, doc.y)
          .stroke();

        doc.moveDown(0.3);
        doc.x = leftMargin;
      };

      if (resume.professional_summary) {
        renderSectionHeading("Professional Summary");
        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(primaryColor)
          .text(resume.professional_summary, leftMargin, doc.y, {
            width: pageWidth,
            align: "justify",
            lineGap: 2,
          });
        doc.x = leftMargin;
      }

      // Dynamic skills matrix supporting tech stacks and any professional domain
      const sm = resume.skills_matrix as Record<string, string[] | undefined>;
      const skillsCategories: Array<{ label: string; skills: string[] }> = [];

      if (sm && typeof sm === "object") {
        const categoryLabels: Record<string, string> = {
          languages: "Languages",
          frameworks: "Frameworks & Libraries",
          databases: "Databases & Storage",
          cloud_devops: "Cloud & DevOps",
          tools: "Tools & Technologies",
          core_competencies: "Core Competencies",
          skills: "Key Skills",
        };

        for (const [key, val] of Object.entries(sm)) {
          if (Array.isArray(val) && val.length > 0) {
            const label =
              categoryLabels[key] ||
              key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            skillsCategories.push({ label, skills: val });
          }
        }
      }

      if (skillsCategories.length > 0) {
        renderSectionHeading("Skills & Competencies");
        skillsCategories.forEach(({ label, skills }) => {
          doc.x = leftMargin;
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(primaryColor)
            .text(`${label}: `, leftMargin, doc.y, { continued: true })
            .font("Helvetica")
            .fillColor(secondaryColor)
            .text(skills.join(", "), {
              width: pageWidth,
              lineGap: 2,
            });
          doc.x = leftMargin;
        });
      }

      if (resume.experience && resume.experience.length > 0) {
        renderSectionHeading("Professional Experience");

        resume.experience.forEach((exp, index) => {
          if (index > 0) doc.moveDown(0.35);

          const roleY = doc.y;
          const dateWidth = 140;
          const titleWidth = pageWidth - dateWidth - 10;

          doc
            .font("Helvetica-Bold")
            .fontSize(9.5)
            .fillColor(primaryColor)
            .text(exp.role || "", leftMargin, roleY, {
              width: titleWidth,
            });
          const roleEndY = doc.y;

          const datesText = [exp.start_date, exp.end_date || "Present"]
            .filter(Boolean)
            .join(" - ");

          if (datesText) {
            doc
              .font("Helvetica-Bold")
              .fontSize(9)
              .fillColor(secondaryColor)
              .text(datesText, leftMargin + pageWidth - dateWidth, roleY, {
                width: dateWidth,
                align: "right",
              });
          }
          const datesEndY = doc.y;

          doc.x = leftMargin;
          doc.y = Math.max(roleEndY, datesEndY) + 1.5;

          const companyLocation = [exp.company, exp.location]
            .filter(Boolean)
            .join(" • ");
          if (companyLocation) {
            doc
              .font("Helvetica-Oblique")
              .fontSize(9)
              .fillColor(secondaryColor)
              .text(companyLocation, leftMargin, doc.y, {
                width: pageWidth,
              });
          }

          doc.moveDown(0.2);
          doc.x = leftMargin;

          if (exp.bullet_points && Array.isArray(exp.bullet_points)) {
            exp.bullet_points.forEach((bullet) => {
              doc
                .font("Helvetica")
                .fontSize(9)
                .fillColor(primaryColor)
                .text(`•  ${bullet}`, leftMargin + 8, doc.y, {
                  width: pageWidth - 8,
                  align: "left",
                  lineGap: 2,
                });
            });
          }
          doc.x = leftMargin;
        });
      }

      if (resume.projects && resume.projects.length > 0) {
        renderSectionHeading("Key Projects");

        resume.projects.forEach((proj, idx) => {
          if (idx > 0) doc.moveDown(0.3);

          doc.x = leftMargin;
          const projHeader = proj.name;
          const techStack = proj.technologies?.length
            ? ` | ${proj.technologies.join(", ")}`
            : "";

          doc
            .font("Helvetica-Bold")
            .fontSize(9.5)
            .fillColor(primaryColor)
            .text(projHeader, leftMargin, doc.y, { continued: true })
            .font("Helvetica-Oblique")
            .fontSize(8.5)
            .fillColor(secondaryColor)
            .text(techStack);

          doc.x = leftMargin;

          if (proj.description) {
            doc
              .font("Helvetica")
              .fontSize(9)
              .fillColor(primaryColor)
              .text(proj.description, leftMargin, doc.y, {
                width: pageWidth,
                lineGap: 1.5,
              });
            doc.x = leftMargin;
          }

          if (proj.bullet_points && Array.isArray(proj.bullet_points)) {
            proj.bullet_points.forEach((bullet) => {
              doc
                .font("Helvetica")
                .fontSize(9)
                .fillColor(primaryColor)
                .text(`•  ${bullet}`, leftMargin + 8, doc.y, {
                  width: pageWidth - 8,
                  align: "left",
                  lineGap: 1.5,
                });
            });
          }
          doc.x = leftMargin;
        });
      }

      if (resume.education && resume.education.length > 0) {
        renderSectionHeading("Education");

        resume.education.forEach((edu) => {
          const eduStartY = doc.y;
          const dateWidth = 110;
          const degreeWidth = pageWidth - dateWidth - 10;

          const degreeLine = [edu.degree, edu.field_of_study]
            .filter(Boolean)
            .join(" in ");

          doc
            .font("Helvetica-Bold")
            .fontSize(9.5)
            .fillColor(primaryColor)
            .text(degreeLine || "Degree", leftMargin, eduStartY, {
              width: degreeWidth,
            });
          const degreeEndY = doc.y;

          if (edu.graduation_year) {
            doc
              .font("Helvetica")
              .fontSize(9)
              .fillColor(secondaryColor)
              .text(
                edu.graduation_year,
                leftMargin + pageWidth - dateWidth,
                eduStartY,
                {
                  width: dateWidth,
                  align: "right",
                },
              );
          }
          const datesEndY = doc.y;

          doc.x = leftMargin;
          doc.y = Math.max(degreeEndY, datesEndY) + 1.5;

          if (edu.institution) {
            doc
              .font("Helvetica-Oblique")
              .fontSize(9)
              .fillColor(secondaryColor)
              .text(edu.institution, leftMargin, doc.y, {
                width: pageWidth,
              });
          }
          doc.moveDown(0.2);
          doc.x = leftMargin;
        });
      }

      if (resume.certifications && resume.certifications.length > 0) {
        renderSectionHeading("Certifications & Credentials");
        resume.certifications.forEach((cert) => {
          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(primaryColor)
            .text(`•  ${cert}`, leftMargin + 8, doc.y, {
              width: pageWidth - 8,
              lineGap: 1.5,
            });
        });
        doc.x = leftMargin;
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
