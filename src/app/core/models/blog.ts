export interface PostDto {
  id: string;
  title: string;
  content: string;
  publishDate: Date;
  imageUrl?: string;
  videoUrl?: string;
  readTime: number;
}

export interface CreatePostDto {
  title: string;
  content: string;
  imageUrl?: File;
  videoUrl?: File;
  readTime: number;
}

export interface UpdatePostDto {
  title: string;
  content: string;
  imageUrl?: File;
  videoUrl?: File;
  readTime: number;
  deleteImage?: boolean;
  deleteVideo?: boolean;
}
