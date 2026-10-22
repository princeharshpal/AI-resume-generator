import api from "./api";
import type {
  UploadResumeResponse,
  AnalyseResumePayload,
  AnalyseResumeResponse,
  GenerateResumePayload,
  GenerateResumeResponse,
  DownloadResumePayload,
  DownloadResumeResponse,
  ResumeHistoryResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
} from "@/types";

const uploadResumeToGoogle = async (
  file: File,
): Promise<UploadResumeResponse> => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await api.post<UploadResumeResponse>("/upload", formData);

  return response.data;
};

const analyseResumeApi = async (
  payload: AnalyseResumePayload,
): Promise<AnalyseResumeResponse> => {
  const response = await api.post<AnalyseResumeResponse>(
    "/resume/analyse",
    payload,
  );

  return response.data;
};

const generateTailoredResumeApi = async (
  payload: GenerateResumePayload,
): Promise<GenerateResumeResponse> => {
  const response = await api.post<GenerateResumeResponse>(
    "/resume/generate",
    payload,
  );

  return response.data;
};

const downloadAndSaveResumeApi = async (
  payload: DownloadResumePayload,
): Promise<DownloadResumeResponse> => {
  const response = await api.post<DownloadResumeResponse>(
    "/resume/download",
    payload,
  );

  return response.data;
};

const getResumeHistoryApi = async (): Promise<ResumeHistoryResponse> => {
  const response = await api.get<ResumeHistoryResponse>("/resume/history");
  return response.data;
};

const deleteResumeHistoryApi = async (
  id: number,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/resume/${id}`,
  );
  return response.data;
};

const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/users/login", payload);
  return response.data;
};

const registerApi = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/users/register", payload);
  return response.data;
};

const refreshTokenApi = async (
  payload?: RefreshTokenPayload,
  config?: { skipErrorToast?: boolean },
): Promise<RefreshTokenResponse> => {
  const response = await api.post<RefreshTokenResponse>(
    "/users/refresh-token",
    payload || {},
    { skipErrorToast: true, ...config },
  );
  return response.data;
};

const logoutApi = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>(
    "/users/logout",
    {},
    { skipErrorToast: true },
  );
  return response.data;
};

export {
  uploadResumeToGoogle,
  analyseResumeApi,
  generateTailoredResumeApi,
  downloadAndSaveResumeApi,
  getResumeHistoryApi,
  deleteResumeHistoryApi,
  loginApi,
  registerApi,
  refreshTokenApi,
  logoutApi,
};
