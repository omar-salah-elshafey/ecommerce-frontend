import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BlogsService } from '../../core/services/mock-data/blogs.service';
import { Blog } from '../../shared/models/blog';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  Observable,
  switchMap,
} from 'rxjs';
import { fadeIn } from '../../shared/animations/animations';
import { RouterModule } from '@angular/router';

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
  private blogsService = inject(BlogsService);

  // State management
  searchQuery = '';
  selectedCategories: string[] = [];
  loading = true;

  // Observables
  filteredBlogs$!: Observable<Blog[]>;

  // Subjects
  private searchSubject = new BehaviorSubject<string>('');
  private categoriesSubject = new BehaviorSubject<string[]>([]);

  ngOnInit() {
    this.filteredBlogs$ = combineLatest([
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()),
      this.categoriesSubject,
    ]).pipe(
      switchMap(([query, categories]) => this.blogsService.searchBlogs(query))
    );

    this.blogsService.getBlogs().subscribe(() => (this.loading = false));
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  onCategoryChange(category: string, checked: boolean) {
    this.selectedCategories = checked
      ? [...this.selectedCategories, category]
      : this.selectedCategories.filter((c) => c !== category);
    this.categoriesSubject.next(this.selectedCategories);
  }
}
