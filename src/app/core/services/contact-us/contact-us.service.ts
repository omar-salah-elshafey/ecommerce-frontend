import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageDto, SendMessageDto } from '../../models/contact-us';

@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  private readonly apiUrl = `${environment.apiUrl}/api/Contact`;

  constructor(private http: HttpClient) {}

  sendMessage(message: SendMessageDto) {
    return this.http.post(`${this.apiUrl}/send-message`, message);
  }

  getMessages(): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.apiUrl}/messages`);
  }
}
