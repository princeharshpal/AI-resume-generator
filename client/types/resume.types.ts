export interface UploadResumeData {
  file_name: string;
  file_uri: string;
  display_name: string;
}

export interface UploadResumeResponse {
  success: boolean;
  message: string;
  data: UploadResumeData;
}

export interface ResumeAnalysisResult {
  match_score: number;
  role_fit_level: string;
  matching_skills: string[];
  missing_skills: string[];
  critique_summary: string;
  actionable_recommendations: string[];
}

export interface AnalyseResumePayload {
  file_name: string;
  job_title: string;
  job_description: string;
}

export interface AnalyseResumeResponse {
  success: boolean;
  message: string;
  data: ResumeAnalysisResult;
}

export interface RadialChartProps {
  score?: number;
  statusText?: string;
  subscores?: {
    keywords: number;
    experience: number;
    formatting: number;
  };
}

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

export interface GenerateResumePayload {
  file_name: string;
  job_title: string;
  job_description: string;
  added_skills?: string[];
}

export interface GenerateResumeResponse {
  success: boolean;
  message: string;
  data: TailoredResumeContent;
}

export interface DownloadResumePayload {
  file_name?: string;
  job_title: string;
  company_name?: string;
  job_description?: string;
  match_score?: number;
  matching_skills?: string[];
  missing_skills?: string[];
  added_skills?: string[];
  resume_content?: TailoredResumeContent;
}

export interface DownloadResumeResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    pdf_url: string;
    cloudinary_public_id: string;
    job_title: string;
    match_score: number;
    created_at: string;
    record: ResumeHistoryItem;
  };
}

export interface ResumeHistoryItem {
  id: number;
  user_id: number;
  job_title: string;
  company_name: string;
  job_description?: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  added_skills: string[];
  pdf_url: string;
  created_at: string;
}

export interface ResumeHistoryResponse {
  success: boolean;
  message: string;
  data: ResumeHistoryItem[];
}
