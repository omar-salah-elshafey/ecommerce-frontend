import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject, of } from 'rxjs';
import { fadeIn } from '../../shared/animations/animations';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../core/services/blog/blog.service';
import { CreatePostDto, PostDto } from '../../core/models/blog';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss'],
  animations: [fadeIn],
})
export class BlogsComponent implements OnInit {
  private blogService = inject(BlogService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  public authService = inject(AuthService);

  blogs: PostDto[] = [];
  loading: boolean = true;
  currentPage: number = 1;
  pageSize: number = 2;
  totalItems: number = 0;
  totalPages: number = 0;
  hasMore: boolean = true;

  postForm!: FormGroup;
  posting = false;

  imageFile?: File;
  videoFile?: File;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  imagePreviewUrl?: string;
  videoPreviewUrl?: string;

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadPosts();
  }

  initializeForm(): void {
    this.postForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
      content: [
        '',
        [
          Validators.required,
          Validators.maxLength(2000),
          Validators.minLength(10),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
      readTime: [1, [Validators.required, Validators.min(1)]],
    });
  }

  loadPosts(): void {
    this.loading = true;
    this.blogService.getAllPosts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.blogs = [...this.blogs, ...response.items];
        this.totalItems = response.totalItems;
        this.totalPages = Math.ceil(response.totalItems / response.pageSize);
        this.currentPage++;
        this.hasMore = this.currentPage <= this.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading blog posts:', error);
        this.loading = false;
        return of(null);
      },
    });
  }

  onCreatePost(): void {
    if (this.postForm.invalid) {
      this.snackBar.open('برجاء إدخال قيم صالحة.', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    this.posting = true;
    this.postForm.disable();
    const postDto: CreatePostDto = {
      title: this.postForm.value.title.trim(),
      content: this.postForm.value.content.trim(),
      readTime: this.postForm.value.readTime,
      imageUrl: this.imageFile,
      videoUrl: this.videoFile,
    };
    this.blogService.createPost(postDto).subscribe({
      next: (response) => {
        this.blogs.unshift(response);
        this.snackBar.open('تم النشر بنجاح.', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.resetFileInputs();
        this.postForm.reset();
        this.posting = false;
        this.postForm.enable();
        this.postForm.get('readTime')?.setValue(1);
      },
      error: (err) => {
        console.error('Error creating post:', err);
        this.snackBar.open('حدث خطا، برجاء المحاولة لاحقاً.', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.posting = false;
        this.postForm.enable();
      },
    });
  }

  removeFile(type: 'image' | 'video') {
    if (type === 'image') {
      this.imageFile = undefined;
      this.imagePreviewUrl = undefined;
    } else {
      this.videoFile = undefined;
      this.videoPreviewUrl = undefined;
    }
  }

  resetFileInputs(): void {
    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }
    if (this.videoInput) {
      this.videoInput.nativeElement.value = '';
    }
    this.imageFile = undefined;
    this.videoFile = undefined;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (windowHeight + scrollTop >= documentHeight - 400 && this.hasMore) {
      this.loadPosts();
    }
  }

  onFileSelected(event: Event, fileType: 'image' | 'video') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log(`${fileType} selected:`, file);
      if (fileType === 'image') {
        this.imageFile = file;
        this.generateImagePreview(file);
      } else if (fileType === 'video') {
        this.videoFile = file;
        this.generateVideoPreview(file);
      }
    }
  }

  increaseReadTime() {
    const current = this.postForm.get('readTime')?.value || 1;
    this.postForm.get('readTime')?.setValue(current + 1);
  }

  decreaseReadTime() {
    const current = this.postForm.get('readTime')?.value || 1;
    if (current > 1) {
      this.postForm.get('readTime')?.setValue(current - 1);
    }
  }

  generateImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  generateVideoPreview(file: File) {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);

    video.onloadeddata = () => {
      video.currentTime = 0;
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.videoPreviewUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(video.src);
      }, 100);
    };
  }
}
