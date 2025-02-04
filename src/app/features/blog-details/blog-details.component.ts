import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BlogsService } from '../../core/services/mock-data/blogs.service';
import { Blog } from '../../shared/models/blog';
import { Observable, switchMap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss'],
})
export class BlogDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private blogsService = inject(BlogsService);

  blog$!: Observable<Blog | undefined>;

  ngOnInit() {
    this.blog$ = this.route.params.pipe(
      switchMap((params) => this.blogsService.getBlogById(+params['id']))
    );
  }
}
