import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { PaginatedResponse } from '../../models/pagination';
import { CreatePostDto, PostDto, UpdatePostDto } from '../../models/blog';

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
            this.getFullUrl(item);
          });
        })
      );
  }

  getPostById(id: string): Observable<PostDto> {
    return this.http.get<PostDto>(`${this.apiUrl}/posts/${id}`).pipe(
      tap((post) => {
        this.getFullUrl(post);
      })
    );
  }

  createPost(postDto: CreatePostDto): Observable<HttpEvent<PostDto>> {
    const formData = new FormData();
    formData.append('title', postDto.title);
    formData.append('content', postDto.content);
    if (postDto.imageUrl) formData.append('imageUrl', postDto.imageUrl);
    if (postDto.videoUrl) formData.append('videoUrl', postDto.videoUrl);
    return this.http
      .post<PostDto>(`${this.apiUrl}/create-post`, formData, {
        reportProgress: true, // Enable progress reporting
        observe: 'events', // Observe all HTTP events
      })
      .pipe(
        catchError((error) => {
          console.error('Error occurred while creating the post:', error);
          return throwError(() => error);
        })
      );
  }

  updatePost(id: string, postDto: UpdatePostDto): Observable<PostDto> {
    const formData = new FormData();
    formData.append('title', postDto.title);
    formData.append('content', postDto.content);
    if (postDto.imageUrl) formData.append('imageUrl', postDto.imageUrl);
    if (postDto.videoUrl) formData.append('videoUrl', postDto.videoUrl);
    if (postDto.deleteImage) formData.append('deleteImage', 'true');
    if (postDto.deleteVideo) formData.append('deleteVideo', 'true');
    return this.http
      .put<PostDto>(`${this.apiUrl}/update-post/${id}`, formData)
      .pipe(
        tap((post) => {
          this.getFullUrl(post);
        }),
        catchError((error) => {
          console.error('Error occurred while creating the post:', error);
          return throwError(() => error);
        })
      );
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-post/${id}`).pipe(
      catchError((error) => {
        console.error('Error Deleting the Post', error);
        return throwError(() => error);
      })
    );
  }

  private getFullUrl(post: PostDto): PostDto {
    if (post.imageUrl) post.imageUrl = `${environment.apiUrl}${post.imageUrl}`;
    if (post.videoUrl) post.videoUrl = `${environment.apiUrl}${post.videoUrl}`;
    return post;
  }
}
