export interface SendMessageDto {
  fullName: string;
  email: string;
  message: string;
}

export interface MessageDto {
  id: string;
  name: string;
  email: string;
  message: string;
  messageDate: Date;
  isRead: boolean;
}
