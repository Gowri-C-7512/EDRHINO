export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  board: string;
  profile: string;
  otp: number;
  otp_expiry: Date;
  is_verify: boolean;
  is_active: boolean;
  refresh_token: string;
  access_token: string;
  last_login: Date;
  createdAt: Date;
  updatedAt: Date;
}