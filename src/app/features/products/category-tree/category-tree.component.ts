import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CategoryDto } from '../../../core/models/category';

@Component({
  selector: 'app-category-tree',
  imports: [CommonModule, MatCheckboxModule],
  templateUrl: './category-tree.component.html',
  styleUrl: './category-tree.component.scss',
})
export class CategoryTreeComponent {
  @Input() category!: CategoryDto;
  @Input() selectedCategoryIds: string[] = [];

  @Output() categorySelectionChange = new EventEmitter<{
    categoryId: string;
    selected: boolean;
  }>();

  isSelected = false;

  onCheckboxChange(event: any) {
    this.categorySelectionChange.emit({
      categoryId: this.category.id,
      selected: event.checked,
    });
  }

  childSelectionChanged(event: { categoryId: string; selected: boolean }) {
    this.categorySelectionChange.emit(event);
  }
}
