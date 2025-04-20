import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  AddCityDto,
  CityDto,
  GovernorateDto,
} from '../../../core/models/address';
import { OrdersService } from '../../../core/services/orders/orders.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddressService } from '../../../core/services/address-service/address.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-manage-cities',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './manage-cities.component.html',
  styleUrl: './manage-cities.component.scss',
})
export class ManageCitiesComponent implements OnInit {
  governorates: GovernorateDto[] = [];
  selectedGovernorate: GovernorateDto | null = null;
  cities: CityDto[] = [];
  isLoading = true;
  addingNewCity = false;
  newCityName = '';
  editingCityId: string | null = null;
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
        this.isLoading = false;
        if (data.length > 0) {
          this.selectGovernorate(data[0]); // Select the first governorate by default
        }
      },
      error: (err) => {
        console.error('Error loading governorates:', err);
        this.snackBar.open('حدث خطأ أثناء تحميل المحافظات', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isLoading = false;
      },
    });
  }
  selectGovernorate(gov: GovernorateDto): void {
    this.selectedGovernorate = gov;
    this.cities = gov.cities || [];
  }
  startAddingCity(): void {
    this.addingNewCity = true;
    this.newCityName = '';
  }

  cancelAddCity(): void {
    this.addingNewCity = false;
    this.newCityName = '';
  }

  saveNewCity(): void {
    if (!this.newCityName.trim() || !this.selectedGovernorate) return;
    this.isLoading = true;
    const addCityDto: AddCityDto = {
      governorateId: this.selectedGovernorate.id,
      name: this.newCityName,
    };

    this.addressService.addCity(addCityDto).subscribe({
      next: (city) => {
        this.cities.push(city);
        this.selectedGovernorate!.cities = this.cities; // Update the governorate's cities
        this.snackBar.open('تم إضافة المدينة بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.cancelAddCity();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error adding city:', error);
        this.snackBar.open(
          error.error?.error || 'حدث خطأ أثناء إضافة المدينة',
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
  startEditingCity(city: CityDto): void {
    this.editingCityId = city.id;
    this.updatedName = city.name;
  }

  cancelEdit(): void {
    this.editingCityId = null;
    this.updatedName = '';
  }

  saveUpdatedCity(): void {
    if (
      !this.editingCityId ||
      !this.updatedName.trim() ||
      !this.selectedGovernorate
    )
      return;
    this.isLoading = true;
    const updateCityDto: AddCityDto = {
      governorateId: this.selectedGovernorate.id,
      name: this.updatedName,
    };

    this.addressService
      .updateCity(this.editingCityId, updateCityDto)
      .subscribe({
        next: (updatedCity) => {
          const index = this.cities.findIndex((c) => c.id === updatedCity.id);
          if (index > -1) {
            this.cities[index] = updatedCity;
            this.selectedGovernorate!.cities = this.cities; // Update the governorate's cities
          }
          this.snackBar.open('تم تحديث المدينة بنجاح', 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.cancelEdit();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating city:', error);
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
  deleteCity(id: string): void {
    const confirmation = confirm(
      'هل أنت متأكد من رغبتك في حذف هذه المدينة؟، لا يمكن التراجع عن هذا الإجراء.'
    );
    if (!confirmation) return;

    this.isLoading = true;
    this.addressService.deleteCity(id).subscribe({
      next: () => {
        this.cities = this.cities.filter((c) => c.id !== id);
        this.selectedGovernorate!.cities = this.cities; // Update the governorate's cities
        this.snackBar.open('تم حذف المدينة بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting city:', error);
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
