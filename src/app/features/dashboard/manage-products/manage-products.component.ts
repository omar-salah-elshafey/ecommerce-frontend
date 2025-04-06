import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CreateProductDto,
  ProductDto,
  UpdateProductDto,
} from '../../../core/models/product';
import { ProductService } from '../../../core/services/product/product.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../../core/services/category/category.service';
import { CategoryDto, FlatCategory } from '../../../core/models/category';
import { MatSelectModule } from '@angular/material/select';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

@Component({
  selector: 'app-manage-products',
  imports: [
    RouterModule,
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.scss',
})
export class ManageProductsComponent implements OnInit {
  products: ProductDto[] = [];
  addingNewProduct: boolean = false;
  productForm: FormGroup;
  selectedFiles: File[] = [];

  categories: CategoryDto[] = [];
  flatCategories: FlatCategory[] = [];
  imagePreviews: string[] = [];

  editingProduct: ProductDto | null = null;
  existingImageUrls: string[] = [];
  imagesToDelete: string[] = [];

  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.required],
      price: [1, [Validators.required, Validators.min(1)]],
      stock: [1, [Validators.required, Validators.min(1)]],
      maxOrderQuantity: [1, [Validators.required, Validators.min(1)]],
      sku: ['', [Validators.maxLength(50)]],
      isFeatured: [false],
      categoryId: ['', Validators.required],
      images: [null, [this.fileArrayValidator.bind(this)]],
    });
    this.getAllCategories();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts(1, 20).subscribe((res) => {
      this.products = res.items;
    });
  }

  startAddingProduct(): void {
    this.addingNewProduct = true;
    this.editingProduct = null;
    this.productForm.reset({
      price: 1,
      stock: 1,
      maxOrderQuantity: 1,
      isFeatured: false,
    });
    this.selectedFiles = [];
  }

  cancelAddProduct(): void {
    this.addingNewProduct = false;
  }

  startEditingProduct(product: ProductDto): void {
    this.editingProduct = product;
    this.addingNewProduct = false;
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.imagesToDelete = [];
    this.existingImageUrls = product.images.map((img) => img.imageUrl);

    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      maxOrderQuantity: product.maxOrderQuantity,
      sku: product.sku || '',
      isFeatured: product.isFeatured,
      categoryId: product.categoryId,
    });
  }

  cancelEdit(): void {
    this.editingProduct = null;
    this.resetFormState();
  }

  private resetFormState(): void {
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.existingImageUrls = [];
    this.imagesToDelete = [];
    this.productForm.reset();
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
      this.generateImagePreviews();
      this.productForm.get('images')?.updateValueAndValidity();
    }
  }

  saveNewProduct(): void {
    const fileErrors = this.fileArrayValidator(this.selectedFiles);
    if (fileErrors) {
      this.snackBar.open(
        'Please fix image errors: ' + JSON.stringify(fileErrors),
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
      return;
    }

    if (this.productForm.invalid) {
      this.snackBar.open('Please fix the errors in the form.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    const formValue = this.productForm.value;
    const newProductDto: CreateProductDto = {
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      stock: formValue.stock,
      maxOrderQuantity: formValue.maxOrderQuantity,
      sku: formValue.sku,
      isFeatured: formValue.isFeatured,
      categoryId: formValue.categoryId,
      images: this.selectedFiles,
    };

    this.productService.addProduct(newProductDto).subscribe({
      next: (product) => {
        this.snackBar.open('Product added successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.products.push(product);
        this.cancelAddProduct();
      },
      error: (err) => {
        console.error('Error adding product:', err);
        this.snackBar.open('Error adding product', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  saveUpdatedProduct(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Please fix the errors in the form.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    if (!this.editingProduct) return;

    if (
      this.existingImageUrls.length === 0 &&
      this.selectedFiles.length === 0
    ) {
      this.snackBar.open('At least one image is required.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    const formValue = this.productForm.value;
    const updateProductDto: UpdateProductDto = {
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      stock: formValue.stock,
      maxOrderQuantity: formValue.maxOrderQuantity,
      isFeatured: formValue.isFeatured,
      categoryId: formValue.categoryId,
      imagesToDelete: this.imagesToDelete,
      newImages: this.selectedFiles,
    };

    this.productService
      .updateProduct(this.editingProduct.id, updateProductDto)
      .subscribe({
        next: (updatedProduct) => {
          this.snackBar.open('Product updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          const index = this.products.findIndex(
            (p) => p.id === updatedProduct.id
          );
          this.products[index] = updatedProduct;
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.snackBar.open('Error updating product', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });
  }

  fileArrayValidator(control: any): { [key: string]: any } | null {
    const files: File[] = this.selectedFiles;
    const totalImages = files.length + this.existingImageUrls.length;

    if (
      (!this.editingProduct && (!files || files.length === 0)) ||
      (this.editingProduct && totalImages === 0)
    ) {
      return { required: 'At least one image is required.' };
    }
    if (totalImages > 6) {
      return { maxFiles: 'Maximum 6 images allowed.' };
    }
    for (let file of files) {
      const extension = file.name
        .substring(file.name.lastIndexOf('.'))
        .toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
          fileType: 'Invalid file type. Allowed types: .jpg, .jpeg, .png.',
        };
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        return { fileMime: 'Invalid MIME type.' };
      }
    }
    return null;
  }

  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.products = this.products.filter((p) => p.id !== productId);
        },
        error: (err) => console.error(err),
      });
    }
  }

  getAllCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.flatCategories = this.flattenCategories(categories);
      },
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.productForm.get('images')?.updateValueAndValidity();
  }

  removeExistingImage(index: number): void {
    const imageId = this.editingProduct?.images[index].id;
    if (imageId) {
      this.imagesToDelete.push(imageId);
    }
    this.existingImageUrls.splice(index, 1);
    this.productForm.get('images')?.updateValueAndValidity();
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

  private generateImagePreviews(): void {
    this.imagePreviews = [];
    this.selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}
