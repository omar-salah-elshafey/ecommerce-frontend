export interface PostDto {
  id: string;
  title: string;
  content: string;
  publishDate: Date;
  imageUrl?: string;
  videoUrl?: string;
  readTime: number;
}
