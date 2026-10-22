export interface User {
  id?: number;
  name: string;
  email: string;
  avatar?: string;
  created_at?: string;
}

export type UserData = User;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken?: string;
  user: User;
}

export interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface RefreshTokenPayload {
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  user?: User;
}

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (emailOrUser?: string | User, name?: string) => void;
  setAuthenticatedUser: (user: User) => void;
  logout: () => void | Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (callback?: () => void) => void;
  closeAuthModal: () => void;
}
