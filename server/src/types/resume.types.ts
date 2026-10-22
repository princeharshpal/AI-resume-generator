export interface TailoredResumeContent {
  personal_info: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  target_role: string;
  professional_summary: string;
  skills_matrix: {
    languages?: string[];
    frameworks?: string[];
    databases?: string[];
    cloud_devops?: string[];
    tools?: string[];
    core_competencies?: string[];
    [key: string]: string[] | undefined;
  };
  experience: Array<{
    role: string;
    company: string;
    location?: string;
    start_date: string;
    end_date: string;
    bullet_points: string[];
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    bullet_points: string[];
    link?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study?: string;
    graduation_year?: string;
  }>;
  certifications?: string[];
  projected_match_score: number;
  highlighted_keywords: string[];
  applied_added_skills: string[];
}

export interface ResumeHistoryRecord {
  id: number;
  user_id: number;
  job_title: string;
  company_name: string;
  job_description: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  added_skills: string[];
  resume_content: TailoredResumeContent;
  pdf_url: string;
  cloudinary_public_id: string;
  created_at: string;
  updated_at: string;
}
