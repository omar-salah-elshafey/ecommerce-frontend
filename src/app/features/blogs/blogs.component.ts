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
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SafeUrlPipe } from '../../shared/pipes/safeUrl-pipe/safe-url.pipe';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

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
    MatProgressBarModule,
    SafeUrlPipe,
    ImageCropperComponent,
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
  pageSize: number = 20;
  totalItems: number = 0;
  totalPages: number = 0;
  hasMore: boolean = true;

  postForm!: FormGroup;
  posting = false;
  uploadProgress: number = 0;

  imageFile?: File;
  videoFile?: File;
  videoURL?: string;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  imagePreviewUrl?: string;
  videoPreviewUrl?: string;
  private readonly youtubeUrlRegex = new RegExp(
    '^(https?:\\/\\/)?(www\\.)?(youtube\\.com\\/(watch\\?v=|shorts\\/|live\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{10,12})(\\?.*)?$',
    'i'
  );

  imageChangedEvent: any = '';
  croppedImage: any = '';

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
          Validators.minLength(1),
          Validators.maxLength(200),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
      content: [
        '',
        [
          Validators.required,
          Validators.maxLength(2000),
          Validators.minLength(1),
          Validators.pattern(/^(?!\s*$).+/),
        ],
      ],
      videoUrl: [''],
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

  onFileChange(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
  }

  cancelCropping(): void {
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.imageFile = undefined;
    this.imagePreviewUrl = undefined;
  }

  uploadCroppedImage(): void {
    const img = new Image();
    img.src = this.croppedImage;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const scaleSize = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scaleSize;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (initialBlob) => {
          if (!initialBlob) return;

          const originalSizeKB = initialBlob.size / 1024;

          // Set target quality based on size
          let targetQuality = 1.0;
          if (originalSizeKB > 800) targetQuality = 0.6;
          else if (originalSizeKB > 600) targetQuality = 0.7;
          else if (originalSizeKB > 400) targetQuality = 0.8;

          canvas.toBlob(
            (finalBlob) => {
              if (!finalBlob) return;

              this.imageFile = new File([finalBlob], 'compressed-image.jpg', {
                type: 'image/jpeg',
              });
              this.imagePreviewUrl = URL.createObjectURL(this.imageFile);
              this.imageChangedEvent = null;
            },
            'image/jpeg',
            targetQuality
          );
        },
        'image/jpeg',
        1.0
      );
    };
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

    const videoUrl = this.postForm.value.videoUrl?.trim();
    if (videoUrl && !this.isValidYouTubeUrl(videoUrl)) {
      this.snackBar.open('برجاء إدخال رابط يوتيوب صالح.', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    this.posting = true;
    this.uploadProgress = 0;
    this.postForm.disable();
    const postDto: CreatePostDto = {
      title: this.postForm.value.title.trim(),
      content: this.postForm.value.content.trim(),
      imageUrl: this.imageFile,
      videoUrl: videoUrl || null,
    };
    this.blogService.createPost(postDto).subscribe({
      next: (event: HttpEvent<PostDto>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          const post = event.body;
          if (post) {
            if (post.imageUrl)
              post.imageUrl = `${environment.apiUrl}${post.imageUrl}`;
            this.blogs.unshift(post);
            this.snackBar.open('تم النشر بنجاح.', 'إغلاق', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            this.resetFileInputs();
            this.postForm.reset();
            this.posting = false;
            this.uploadProgress = 0;
            this.postForm.enable();
          }
        }
      },
      error: (err) => {
        console.error('Error creating post:', err);
        this.snackBar.open('حدث خطأ، برجاء المحاولة لاحقاً.', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.posting = false;
        this.uploadProgress = 0;
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
      if (fileType === 'image') {
        // this.imageFile = file;
        // this.generateImagePreview(file);
        this.imageChangedEvent = event;
        this.imageFile = undefined;
        this.imagePreviewUrl = undefined;
      } else if (fileType === 'video') {
        this.videoFile = file;
        this.generateVideoPreview(file);
      }
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

  getEmbedVideoUrl(videoUrl: string): string {
    try {
      const url = new URL(videoUrl);
      if (
        url.hostname === 'www.youtube.com' ||
        url.hostname === 'youtube.com'
      ) {
        if (url.pathname.startsWith('/live/')) {
          const videoId = url.pathname.split('/live/')[1]?.split('/')[0];
          if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1`;
          }
        } else if (url.pathname === '/watch') {
          const videoId = url.searchParams.get('v');
          if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1`;
          }
        } else if (url.pathname.startsWith('/shorts/')) {
          const videoId = url.pathname.split('/shorts/')[1]?.split('/')[0];
          if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1`;
          }
        }
      }
      // For shortened URLs (e.g., youtu.be)
      if (url.hostname === 'youtu.be') {
        const videoId = url.pathname.substring(1);
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1`;
      }
      return videoUrl; // Fallback if URL can't be parsed
    } catch (e) {
      console.error('Invalid YouTube URL:', videoUrl);
      return videoUrl;
    }
  }

  private isValidYouTubeUrl(url: string): boolean {
    if (!url) return true; // Allow empty or null values

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    return this.youtubeUrlRegex.test(url);
  }
}
