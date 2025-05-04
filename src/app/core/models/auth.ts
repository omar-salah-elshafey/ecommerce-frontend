export interface RegistrationDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  gender: Gender;
  // maritalStatus: MaritalStatus;
  // hasChildren: boolean;
  // childrenCount: number;
  password: string;
  confirmPassword: string;
}

export enum Gender {
  Male = 1,
  Female,
}

export enum Role {
  User = 1,
  Admin,
  SuperAdmin,
  Partner,
}

export enum MaritalStatus {
  Single = 1,
  Married,
  Divorced,
  Widowed,
}

export interface AuthResponseModel {
  email: string;
  role: string;
  accessToken: string;
  expiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresOn: Date;
  isConfirmed: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}
