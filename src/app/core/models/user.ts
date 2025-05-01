import { MaritalStatus, Role } from './auth';

export interface UserDto {
  firstName: string;
  lastName: string;
  userName: string;
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
  userName: string;
  refreshToken: string;
}

export interface ChangeUserRoleDto {
  userName: string;
  role: Role;
}
