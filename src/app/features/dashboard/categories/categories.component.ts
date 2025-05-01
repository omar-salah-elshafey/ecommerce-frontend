import { Component, inject, OnInit } from '@angular/core';
import { CategoryService } from '../../../core/services/category/category.service';
import {
  AddCategoryDto,
  CategoryDto,
  FlatCategory,
  UpdateCategoryDto,
} from '../../../core/models/category';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-categories',
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  categories: CategoryDto[] = [];
  flatCategories: FlatCategory[] = [];
  editedCategoryId: string | null = null;
  isLoading = false;

  editData: { name: string; parentCategoryId: string | null } = {
    name: '',
    parentCategoryId: null,
  };

  addingNewCategory: boolean = false;
  newCategoryData: { name: string; parentCategoryId: string | null } = {
    name: '',
    parentCategoryId: null,
  };

  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.getAllCategories();
  }

  getAllCategories() {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.flatCategories = this.flattenCategories(categories);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.snackBar.open(error.error!.error, 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isLoading = false;
      },
    });
  }

  deleteCategory(category: CategoryDto) {
    if (!confirm('هل أنت متأكد من حذف العنصر')) return;
    this.isLoading = true;
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.snackBar.open('تم حذف الفئة بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isLoading = false;
        this.getAllCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.snackBar.open(error.error!.error, 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isLoading = false;
      },
    });
  }

  updateCategory(category: FlatCategory) {
    this.editedCategoryId = category.id;
    this.editData = {
      name: category.name,
      parentCategoryId: category.parentCategoryId ?? null,
    };
  }

  cancelEdit() {
    this.editedCategoryId = null;
    this.editData = { name: '', parentCategoryId: null };
  }

  startAddingCategory() {
    this.addingNewCategory = true;
    this.newCategoryData = { name: '', parentCategoryId: null };
  }

  cancelAddCategory() {
    this.addingNewCategory = false;
    this.newCategoryData = { name: '', parentCategoryId: null };
  }

  saveNewCategory() {
    const newCategoryDto: AddCategoryDto = {
      name: this.newCategoryData.name,
      parentCategoryId: this.newCategoryData.parentCategoryId || undefined,
    };
    this.isLoading = true;

    this.categoryService.addCategory(newCategoryDto).subscribe({
      next: () => {
        this.snackBar.open('تم إضافة الفئة بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.getAllCategories();
        this.cancelAddCategory();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error adding category:', error);
        this.snackBar.open(
          error.error?.error || 'حدث خطأ أثناء إضافة الفئة',
          'إغلاق',
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          }
        );
        this.isLoading = false;
      },
    });
  }

  saveCategoryUpdate(category: FlatCategory) {
    const updateDto: UpdateCategoryDto = {
      name: this.editData.name,
      parentCategoryId: this.editData.parentCategoryId || undefined,
      clearParentCategory: !this.editData.parentCategoryId,
    };

    this.isLoading = true;
    this.categoryService.updateCategory(category.id, updateDto).subscribe({
      next: (updatedCategory) => {
        this.snackBar.open('تم تحديث الفئة بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.getAllCategories();
        this.cancelEdit();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.snackBar.open(
          error.error?.error || 'حدث خطأ أثناء تحديث الفئة',
          'إغلاق',
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          }
        );
        this.isLoading = false;
      },
    });
  }

  private flattenCategories(
    categories: CategoryDto[],
    parentName: string = ''
  ): FlatCategory[] {
    let flatList: FlatCategory[] = [];
    categories.forEach((category) => {
      const flatCategory: FlatCategory = {
        id: category.id,
        name: category.name,
        parentCategoryName: category.parentCategoryName || '---',
        parentCategoryId: category.parentCategoryId || '---',
        hasChildren:
          (category.subCategories && category.subCategories.length > 0) ??
          false,
      };
      flatList.push(flatCategory);
      if (category.subCategories && category.subCategories.length > 0) {
        flatList = flatList.concat(
          this.flattenCategories(category.subCategories, category.name)
        );
      }
    });
    return flatList;
  }
}
