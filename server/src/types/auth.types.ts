import type { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  created_at?: Date;
}

export interface TokenPayload extends JwtPayload {
  user_id: number;
  email: string;
  name: string;
}
