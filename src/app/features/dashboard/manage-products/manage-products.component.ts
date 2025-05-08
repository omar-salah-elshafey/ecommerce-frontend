import { Component, HostListener, inject, OnInit } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth/auth.service';
import { combineLatest } from 'rxjs';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

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
    MatProgressSpinnerModule,
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

  // imageChangedEvents: any[] = [];
  // croppedImages: string[] = [];
  // currentImageIndex: number | null = null;

  private currentPage: number = 1;
  private pageSize: number = 20;
  isLoading: boolean = false;
  private hasMore: boolean = true;
  private isAdminOrSuperAdmin: boolean = false;
  private isPartner: boolean = false;

  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  public authService = inject(AuthService);

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
    this.products = [];
    this.currentPage = 1;
    this.hasMore = true;
    combineLatest([
      this.authService.isAdmin$,
      this.authService.isSuperAdmin$,
      this.authService.isPartner$,
    ]).subscribe(([isAdmin, isSuperAdmin, isPartner]) => {
      this.isAdminOrSuperAdmin = isAdmin || isSuperAdmin;
      this.isPartner = isPartner;

      if (this.isAdminOrSuperAdmin) {
        this.loadProducts();
      } else if (this.isPartner) {
        this.loadSellerProducts();
      }
    });
  }

  loadProducts(): void {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    this.productService
      .getAllProducts(this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.products = [...this.products, ...res.items];
          this.currentPage++;
          this.hasMore = res.items.length === this.pageSize;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading products:', err);
          this.isLoading = false;
        },
      });
  }

  loadSellerProducts(): void {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    this.productService
      .getCurrentSellerProducts(this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.products = [...this.products, ...res.items];
          this.currentPage++;
          this.hasMore = res.items.length === this.pageSize;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading products:', err);
          this.isLoading = false;
        },
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
    this.imagePreviews = [];
    this.existingImageUrls = [];
    this.imagesToDelete = [];
  }

  cancelAddProduct(): void {
    this.addingNewProduct = false;
    this.resetFormState();
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
    // this.imageChangedEvents = [];
    // this.croppedImages = [];
    this.productForm.reset();
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
      this.generateImagePreviews();
      this.productForm.get('images')?.updateValueAndValidity();
    }
  }

  // onFileSelected(event: any): void {
  //   const files: FileList = event.target.files;
  //   if (files && files.length > 0) {
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       const isValid = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
  //       if (!isValid) continue;

  //       this.imageChangedEvents.push(event); // Use real event
  //       this.croppedImages.push('');
  //       this.selectedFiles.push(file);
  //     }
  //     this.generateImagePreviews();
  //   }
  // }

  // onFileSelected(event: any): void {
  //   const files = event.target.files;
  //   if (files && files.length > 0) {
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       // Create a fake event for each file
  //       const fakeEvent = { target: { files: [file] } };
  //       this.imageChangedEvents.push(fakeEvent);
  //       this.croppedImages.push('');
  //       this.selectedFiles.push(file);
  //     }
  //     this.generateImagePreviews();
  //   }
  // }

  // onImageCropped(event: ImageCroppedEvent, index: number): void {
  //   console.log('Image cropped:', event.base64);
  //   if (event.base64) {
  //     this.croppedImages[index] = event.base64;
  //   }
  // }

  // applyCrop(index: number): void {
  //   const img = new Image();
  //   img.src = this.croppedImages[index];

  //   img.onload = () => {
  //     const canvas = document.createElement('canvas');
  //     const MAX_WIDTH = 1200;
  //     const scaleSize = MAX_WIDTH / img.width;
  //     canvas.width = MAX_WIDTH;
  //     canvas.height = img.height * scaleSize;

  //     const ctx = canvas.getContext('2d');
  //     ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

  //     canvas.toBlob(
  //       (initialBlob) => {
  //         if (!initialBlob) return;

  //         const originalSizeKB = initialBlob.size / 1024;
  //         let targetQuality = 1.0;

  //         if (originalSizeKB > 800) targetQuality = 0.6;
  //         else if (originalSizeKB > 600) targetQuality = 0.7;
  //         else if (originalSizeKB > 400) targetQuality = 0.8;

  //         canvas.toBlob(
  //           (finalBlob) => {
  //             if (!finalBlob) return;

  //             const compressedFile = new File(
  //               [finalBlob],
  //               `image-${index}.jpg`,
  //               {
  //                 type: 'image/jpeg',
  //               }
  //             );

  //             this.selectedFiles[index] = compressedFile;
  //             this.imagePreviews[index] = URL.createObjectURL(compressedFile);
  //             this.imageChangedEvents.splice(index, 1);
  //             this.croppedImages.splice(index, 1);
  //           },
  //           'image/jpeg',
  //           targetQuality
  //         );
  //       },
  //       'image/jpeg',
  //       1.0
  //     );
  //   };
  // }

  // cancelCrop(index: number): void {
  //   this.imageChangedEvents.splice(index, 1);
  //   this.croppedImages.splice(index, 1);
  //   this.selectedFiles.splice(index, 1);
  //   this.imagePreviews.splice(index, 1);
  // }

  saveNewProduct(): void {
    const fileErrors = this.fileArrayValidator(this.selectedFiles);
    if (fileErrors) {
      this.snackBar.open(
        'Please fix image errors: ' + JSON.stringify(fileErrors),
        'إغلاق',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
      return;
    }

    if (this.productForm.invalid) {
      this.snackBar.open('برجاء إدخال قيم صالحة.', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    this.isLoading = true;
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
        this.snackBar.open('تم إضافة المنتج بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.products.unshift(product);
        this.isLoading = false;
        this.cancelAddProduct();
      },
      error: (err) => {
        console.error('Error adding product:', err);
        this.isLoading = false;
        this.snackBar.open('خطأ أثناء إضافة المنتج', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  saveUpdatedProduct(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('برجاء إدخال قيم صالحة.', 'إغلاق', {
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
      this.snackBar.open('يجب إضافة صورة واحدة على الأقل.', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    this.isLoading = true;
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
          this.snackBar.open('تم تحديث المنتج بنجاح', 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          const index = this.products.findIndex(
            (p) => p.id === updatedProduct.id
          );
          this.products[index] = updatedProduct;
          this.isLoading = false;
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.isLoading = false;
          this.snackBar.open('خطأ أثناء تحديث المنتج', 'إغلاق', {
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

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (windowHeight + scrollTop >= documentHeight - 100 && this.hasMore) {
      this.loadProducts();
    }
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

  // private generateImagePreviews(): void {
  //   this.imagePreviews = [];

  //   for (let i = 0; i < this.selectedFiles.length; i++) {
  //     if (this.croppedImages[i]) {
  //       this.imagePreviews[i] = this.croppedImages[i]; // Use cropped version
  //     } else {
  //       this.imagePreviews[i] = URL.createObjectURL(this.selectedFiles[i]); // Fallback
  //     }
  //   }
  // }
}
