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
  videoUrl?: File;
}

export interface UpdatePostDto {
  title: string;
  content: string;
  imageUrl?: File;
  videoUrl?: File;

  deleteImage?: boolean;
  deleteVideo?: boolean;
}
