import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NewsLetterService {
  private readonly apiUrl = `${environment.apiUrl}/api/NewsletterSubscribers`;

  constructor(private http: HttpClient) {}

  subscribe(email: string) {
    return this.http.post(`${this.apiUrl}/subscribe/${email}`, {});
  }
}
