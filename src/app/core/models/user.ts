import { MaritalStatus, Role } from './auth';

export interface UserDto {
  firstName: string;
  lastName: string;
  userId: string;
  email: string;
  role: string;
  gender: string;
  maritalStatus: string;
  hasChildren: boolean;
  childrenCount: number;
}

export interface UpdateUserDto {
  firstName: string;
  lastName: string;
}

export interface DeleteProfile {
  userId: string;
  refreshToken?: string;
  password?: string;
}

export interface ChangeUserRoleDto {
  userId: string;
  role: Role;
}
