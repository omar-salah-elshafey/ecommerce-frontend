import { Component, OnInit } from '@angular/core';
import {
  GovernorateDto,
  UpdateGovernorateDto,
} from '../../../core/models/address';
import { OrdersService } from '../../../core/services/orders/orders.service';
import { AddressService } from '../../../core/services/address-service/address.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-manage-governorates',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './manage-governorates.component.html',
  styleUrl: './manage-governorates.component.scss',
})
export class ManageGovernoratesComponent implements OnInit {
  governorates: GovernorateDto[] = [];
  isLoading = true;
  addingNewGovernorate = false;
  newGovernorateName = '';
  editingGovernorateId: string | null = null;
  updatedName = '';

  constructor(
    private ordersService: OrdersService,
    private addressService: AddressService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadGovernorates();
  }

  loadGovernorates(): void {
    this.isLoading = true;
    this.ordersService.getGovernorates().subscribe({
      next: (data) => {
        this.governorates = data;
        console.log('Governorates:', this.governorates);

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  startAddingGovernorate(): void {
    this.addingNewGovernorate = true;
    this.newGovernorateName = '';
  }

  cancelAddGovernorate(): void {
    this.addingNewGovernorate = false;
    this.newGovernorateName = '';
  }

  saveNewGovernorate(): void {
    if (!this.newGovernorateName.trim()) return;
    console.log('Adding new governorate:', this.newGovernorateName);
    this.isLoading = true;

    this.addressService.addGovernorate(this.newGovernorateName).subscribe({
      next: (gov) => {
        this.snackBar.open('تم إضافة الفئة بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.governorates.push(gov);
        this.cancelAddGovernorate();
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

  startEditingGovernorate(gov: GovernorateDto): void {
    this.editingGovernorateId = gov.id;
    this.updatedName = gov.name;
  }

  cancelEdit(): void {
    this.editingGovernorateId = null;
    this.updatedName = '';
  }

  saveUpdatedGovernorate(): void {
    if (!this.editingGovernorateId || !this.updatedName.trim()) return;

    this.isLoading = true;
    const updateData: UpdateGovernorateDto = { name: this.updatedName };

    this.addressService
      .updateGovernorate(this.editingGovernorateId, updateData)
      .subscribe({
        next: (updatedGov) => {
          const index = this.governorates.findIndex(
            (g) => g.id === updatedGov.id
          );
          if (index > -1) {
            this.governorates[index] = updatedGov;
          }
          this.snackBar.open('تم تحديث المحافظة بنجاح', 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.cancelEdit();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating governorate:', error);
          this.snackBar.open(
            error.error?.error || 'حدث خطأ أثناء التحديث',
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

  deleteGovernorate(id: string): void {
    const confirmation = confirm(
      'هل أنت متأكد من رغبتك في حذف هذه المحافظة؟، لا يمكن التراجع عن هذا الإجراء.'
    );
    if (!confirmation) return;

    this.isLoading = true;
    this.addressService.deleteGovernorate(id).subscribe({
      next: () => {
        this.governorates = this.governorates.filter((g) => g.id !== id);
        this.snackBar.open('تم حذف المحافظة بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting governorate:', error);
        this.snackBar.open(
          error.error?.error || 'حدث خطأ أثناء الحذف',
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
}
