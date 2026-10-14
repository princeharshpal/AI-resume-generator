import api from "./api";
import type {
  UploadResumeResponse,
  AnalyseResumePayload,
  AnalyseResumeResponse,
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
): Promise<RefreshTokenResponse> => {
  const response = await api.post<RefreshTokenResponse>(
    "/users/refresh-token",
    payload || {},
  );
  return response.data;
};

export {
  uploadResumeToGoogle,
  analyseResumeApi,
  loginApi,
  registerApi,
  refreshTokenApi,
};
