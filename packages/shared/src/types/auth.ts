export interface User {
  id: string;
  email: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type SignupInput = {
  email: string;
  password: string;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
};
