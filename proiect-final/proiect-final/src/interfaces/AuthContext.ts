import type { User } from "firebase/auth";

export interface IUser {
  email: string;
  id: string;
  firstname: string;
  lastname: string;
  age: string;
  isAdmin: boolean;
  isActive?: boolean;
  createdAt?: number;
  lastLoginAt?: number;
  Owner: boolean;
}

export interface IAuthContext {
  user: User | null;
  users?: IUser[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
}
