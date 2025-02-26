import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { PaginatedResponse } from '../../models/pagination';
import { PostDto } from '../../models/blog';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}/api/BlogPosts`;
  constructor(private http: HttpClient) {}

  getAllPosts(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<PostDto>> {
    return this.http
      .get<PaginatedResponse<PostDto>>(`${this.apiUrl}/posts`, {
        params: {
          PageNumber: pageNumber.toString(),
          PageSize: pageSize.toString(),
        },
      })
      .pipe(
        tap((posts) => {
          posts.items.forEach((item) => {
            if (item.imageUrl) item.imageUrl = this.getFullUrl(item.imageUrl);
            if (item.videoUrl) item.videoUrl = this.getFullUrl(item.videoUrl);
          });
        })
      );
  }

  getPostById(id: string): Observable<PostDto> {
    return this.http.get<PostDto>(`${this.apiUrl}/posts/${id}`).pipe(
      tap((post) => {
        if (post.imageUrl) post.imageUrl = this.getFullUrl(post.imageUrl);
        if (post.videoUrl) post.videoUrl = this.getFullUrl(post.videoUrl);
      })
    );
  }

  private getFullUrl(url: string): string {
    return `${environment.apiUrl}${url}`;
  }
}
