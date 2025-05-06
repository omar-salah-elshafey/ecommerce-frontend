export interface PostDto {
  id: string;
  title: string;
  content: string;
  publishDate: Date;
  imageUrl?: string;
  videoUrl?: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
  imageUrl?: File;
  videoUrl?: string;
}

export interface UpdatePostDto {
  title: string;
  content: string;
  imageUrl?: File;
  videoUrl?: string;

  deleteImage?: boolean;
  deleteVideo?: boolean;
}
