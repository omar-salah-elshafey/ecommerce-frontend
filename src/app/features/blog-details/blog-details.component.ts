import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, switchMap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BlogService } from '../../core/services/blog/blog.service';
import { PostDto, UpdatePostDto } from '../../core/models/blog';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SafeUrlPipe } from '../../shared/pipes/safeUrl-pipe/safe-url.pipe';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    SafeUrlPipe,
    ImageCropperComponent,
  ],
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss'],
})
export class BlogDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  blog!: PostDto;
  loading: boolean = true;
  isEditing: boolean = false;
  editForm!: FormGroup;
  updating: boolean = false;

  imageFile?: File;
  videoFile?: File;
  imagePreviewUrl?: string;
  videoPreviewUrl?: string;
  deleteImage: boolean = false;
  deleteVideo: boolean = false;
  private readonly youtubeUrlRegex = new RegExp(
    '^(https?:\\/\\/)?(www\\.)?(youtube\\.com\\/(watch\\?v=|shorts\\/|live\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})(\\?.*)?$',
    'i'
  );

  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  ngOnInit() {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.blogService.getPostById(postId).subscribe({
        next: (post) => {
          this.blog = post;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching blog post:', err);
          this.loading = false;
          this.router.navigate(['/not-found']);
        },
      });
    }
    this.initializeForm();
  }

  initializeForm() {
    this.editForm = this.fb.group({
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

  startEditing() {
    this.isEditing = true;
    this.editForm.patchValue({
      title: this.blog.title,
      content: this.blog.content,
      videoUrl: this.blog.videoUrl,
    });
    this.imagePreviewUrl = this.blog.imageUrl;
    this.videoPreviewUrl = this.blog.videoUrl;
    this.deleteImage = false;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
  }

  uploadCroppedImage(): void {
    const img = new Image();
    img.src = this.croppedImage!;
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

  cancelCropping() {
    this.imageChangedEvent = null;
    this.croppedImage = null;
  }

  cancelEditing() {
    this.isEditing = false;
    this.resetFileInputs();
    this.editForm.reset();

    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.imageFile = undefined;
    this.imagePreviewUrl = this.blog.imageUrl; // restore original image
    this.deleteImage = false;
  }

  deleteBlog() {
    if (confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
      this.loading = true;
      this.blogService.deletePost(this.blog.id).subscribe({
        next: () => {
          this.router.navigate(['/content']);
        },
        error: (err) => {
          console.error('Error deleting blog post:', err);
          this.loading = false;
        },
      });
    }
  }

  onUpdatePost() {
    if (this.editForm.invalid) {
      this.snackBar.open('برجاء إدخال قيم صالحة.', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    const videoUrl = this.editForm.value.videoUrl?.trim();
    if (videoUrl && !this.isValidYouTubeUrl(videoUrl)) {
      this.snackBar.open('برجاء إدخال رابط يوتيوب صالح.', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    this.updating = true;
    this.editForm.disable();

    const postDto: UpdatePostDto = {
      title: this.editForm.value.title.trim(),
      content: this.editForm.value.content.trim(),
      imageUrl: this.imageFile,
      videoUrl: videoUrl || null,
      deleteImage: this.deleteImage,
      deleteVideo: this.deleteVideo,
    };

    this.blogService.updatePost(this.blog.id, postDto).subscribe({
      next: (updatedPost) => {
        this.blog = updatedPost;
        this.snackBar.open('تم حفظ التغييرات بنجاح.', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isEditing = false;
        this.updating = false;
        this.editForm.enable();
        this.resetFileInputs();
      },
      error: (err) => {
        console.error('Error updating post:', err);
        this.snackBar.open('حدث خطأ، برجاء المحاولة لاحقاً.', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.updating = false;
        this.editForm.enable();
      },
    });
  }

  onFileSelected(event: Event, fileType: 'image' | 'video') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (fileType === 'image') {
        // this.imageFile = file;
        // this.deleteImage = false;

        this.imageChangedEvent = event;
        this.imageFile = undefined;
        this.imagePreviewUrl = undefined;
        this.deleteImage = false;
        this.generateImagePreview(file);
      } else if (fileType === 'video') {
        this.videoFile = file;
        this.deleteVideo = false;
        this.generateVideoPreview(file);
      }
    }
  }

  removeFile(type: 'image' | 'video') {
    if (type === 'image') {
      this.imageFile = undefined;
      this.imagePreviewUrl = undefined;
      this.deleteImage = true;
    } else {
      this.videoFile = undefined;
      this.videoPreviewUrl = undefined;
      this.deleteVideo = true;
    }
  }

  resetFileInputs() {
    if (this.imageInput) this.imageInput.nativeElement.value = '';
    if (this.videoInput) this.videoInput.nativeElement.value = '';
    this.imageFile = undefined;
    this.videoFile = undefined;
    this.imagePreviewUrl = undefined;
    this.videoPreviewUrl = undefined;
    this.deleteImage = false;
    this.deleteVideo = false;
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
