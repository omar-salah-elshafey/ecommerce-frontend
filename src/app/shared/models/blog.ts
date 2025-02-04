export interface Blog {
  id: number;
  title: string;
  content: string;
  author: string;
  publishDate: Date;
  imageUrl?: string;
  videoUrl?: string;
  readTime: number;
}
