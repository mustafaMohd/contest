

export class LoginPayload {
  name: string;
  email: string;
  password: string; // Raw password, will hash into PasswordHash
  role?: string;
}
