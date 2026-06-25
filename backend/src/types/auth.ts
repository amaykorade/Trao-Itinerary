import { IUser } from '../models/User';

export interface AuthTokenPayload {
  userId: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export function toSafeUser(user: IUser): SafeUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}
