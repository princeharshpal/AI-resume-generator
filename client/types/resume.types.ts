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
