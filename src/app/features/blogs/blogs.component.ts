import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BlogsService } from '../../core/services/mock-data/blogs.service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { fadeIn } from '../../shared/animations/animations';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../core/services/blog/blog.service';
import { PostDto } from '../../core/models/blog';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss'],
  animations: [fadeIn],
})
export class BlogsComponent implements OnInit {
  private blogService = inject(BlogService);
  private fb = inject(FormBuilder);

  blogs: PostDto[] = [];
  loading: boolean = true;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  hasMore: boolean = true;

  postForm!: FormGroup;
  posting = false;

  imageFile?: File;
  videoFile?: File;

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.blogService
      .getAllPosts(this.currentPage, this.pageSize)
      .pipe(
        tap((response) => {
          this.blogs = [...this.blogs, ...response.items];
          this.totalItems = response.totalItems;
          this.totalPages = Math.ceil(response.totalItems / response.pageSize);
          this.currentPage++;
          this.hasMore = this.currentPage <= this.totalPages;
          this.loading = false;
          console.log('posts: ', response);
        }),
        catchError((error) => {
          console.error('Error loading blog posts:', error);
          this.loading = false;
          return of(null);
        })
      )
      .subscribe();
  }

  loadMore(): void {
    if (this.hasMore && !this.loading) {
      this.loadPosts();
    }
  }

  onFileSelected(event: Event, fileType: 'image' | 'video') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (fileType === 'image') {
        this.imageFile = input.files[0];
      } else if (fileType === 'video') {
        this.videoFile = input.files[0];
      }
    }
  }
  removeFile(type: 'image' | 'video') {
    if (type === 'image') {
      this.imageFile = undefined;
    } else {
      this.videoFile = undefined;
    }
  }
  initializeForm(): void {
    this.postForm = this.fb.group({
      content: [
        '',
        [
          Validators.required,
          Validators.maxLength(5000),
          Validators.minLength(3),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
    });
  }

  onCreatePost(): void {
    if (this.postForm.invalid) {
      return;
    }
    this.posting = true;
    this.postForm.disable();
    const postDto = {
      content: this.postForm.value.content.trim(),
      imageFile: this.imageFile,
      videoFile: this.videoFile,
    };
    // this.postService.addPost(postDto).subscribe({
    //   next: (response) => {
    //     this.posts.unshift(response);
    //     this.toastr.success('Post created successfully!', 'Success');
    //     this.imageFile = undefined;
    //     this.videoFile = undefined;
    //     this.postForm.reset();
    //     this.posting = false;
    //     this.postForm.enable();
    //   },
    //   error: (err) => {
    //     console.error('Error creating post:', err);
    //     this.toastr.error('Error creating post.', 'Error');
    //     this.posting = false;
    //     this.postForm.enable();
    //   },
    // });
  }
}
