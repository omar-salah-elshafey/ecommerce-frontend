import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { MessageDto, SendMessageDto } from '../../models/contact-us';
import { PaginatedResponse } from '../../models/pagination';

@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  private readonly apiUrl = `${environment.apiUrl}/api/Contact`;

  constructor(private http: HttpClient) {}

  sendMessage(message: SendMessageDto): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/messages/send-message`, message)
      .pipe(
        catchError((error) => {
          console.error('Error occurred while sending the message:', error);
          return throwError(() => error);
        })
      );
  }

  getAllMessages(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<MessageDto>> {
    return this.http
      .get<PaginatedResponse<MessageDto>>(`${this.apiUrl}/get-messages`, {
        params: {
          PageNumber: pageNumber.toString(),
          PageSize: pageSize.toString(),
        },
      })
      .pipe();
  }

  getMessageById(id: string): Observable<MessageDto> {
    return this.http.get<MessageDto>(`${this.apiUrl}/get-message/${id}`).pipe();
  }

  markRead(id: string): Observable<MessageDto> {
    return this.http
      .put<MessageDto>(`${this.apiUrl}/mark-read/${id}`, {})
      .pipe();
  }

  deleteMessage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe();
  }
}
