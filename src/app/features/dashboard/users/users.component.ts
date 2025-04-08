import { Component, HostListener, OnInit } from '@angular/core';
import { UserProfileService } from '../../../core/services/userProfile/user-profile.service';
import {
  ChangeUserRoleDto,
  UpdateUserDto,
  UserDto,
} from '../../../core/models/user';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaritalStatus, Role } from '../../../core/models/auth';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  users: UserDto[] = [];
  private currentPage: number = 1;
  private pageSize: number = 20;
  private hasMore: boolean = true;
  isLoading: boolean = false;

  editingUserName: string | null = null;
  selectedRole: Role | null = null;

  changeRoleMode: boolean = false;

  updateProfileMode: boolean = false;
  updateProfileForm!: FormGroup;

  maritalStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];

  constructor(
    private userService: UserProfileService,
    private cookieService: CookieService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {
    this.updateProfileForm = this.formBuilder.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      maritalStatus: ['', Validators.required],
      hasChildren: [false, Validators.required],
      childrenCount: [0, Validators.required],
    });

    this.updateProfileForm
      .get('maritalStatus')
      ?.valueChanges.subscribe(this.handleMaritalStatusChange.bind(this));

    this.updateProfileForm
      .get('hasChildren')
      ?.valueChanges.subscribe(this.handleHasChildrenChange.bind(this));
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    this.userService.getAllUsers(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.users = [...this.users, ...res.items];
        this.currentPage++;
        this.hasMore = res.items.length === this.pageSize;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      },
    });
  }

  onDeleteAccount(userName: string) {
    if (!confirm('هل أنت متأكد من حذف الحساب')) return;

    const userData = {
      userName: userName,
      refreshToken: this.cookieService.get('refreshToken'),
    };
    this.userService.deleteProfile(userData).subscribe({
      next: () => {
        this.snackBar.open('تم حذف الملف الشخصي', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
    });
  }

  startEditRole(user: UserDto) {
    this.resetEditState();
    this.editingUserName = user.userName;
    this.changeRoleMode = true;
    this.selectedRole =
      user.role.toLowerCase() === 'user' ? Role.User : Role.Admin;
  }

  saveRoleChange(userName: string) {
    if (this.selectedRole === null) return;

    const userData: ChangeUserRoleDto = {
      userName: userName,
      role: this.selectedRole,
    };
    this.userService.changeUserRole(userData).subscribe({
      next: () => {
        const user = this.users.find((u) => u.userName === userName);
        if (user)
          user.role = this.selectedRole === Role.User ? 'user' : 'admin';
        this.snackBar.open('تم تغيير الصلاحية بنجاح', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.resetEditState();
      },
      error: (err) => {
        this.snackBar.open('خطأ في تغيير الصلاحية', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        console.error('Error changing user role:', err);
      },
    });
  }

  startEditProfile(user: UserDto) {
    this.resetEditState();
    this.editingUserName = user.userName;
    this.updateProfileMode = true;

    this.updateProfileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      maritalStatus: this.translateMaritalStatus(user.maritalStatus),
      hasChildren: user.hasChildren,
      childrenCount: user.childrenCount,
    });

    this.handleMaritalStatusChange(user.maritalStatus);
    this.handleHasChildrenChange(user.hasChildren);
  }

  saveProfileChanges(userName: string) {
    if (this.updateProfileForm.invalid) {
      this.snackBar.open('يرجى تصحيح الأخطاء قبل الإرسال', 'إغلاق', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return;
    }

    const userData: UpdateUserDto = {
      firstName: this.updateProfileForm.value.firstName,
      lastName: this.updateProfileForm.value.lastName,
      maritalStatus: this.getMaritalStatusEnum(
        this.updateProfileForm.value.maritalStatus
      ),
      hasChildren: this.updateProfileForm.value.hasChildren,
      childrenCount: this.updateProfileForm.value.childrenCount,
    };

    this.userService.updateProfile(userName, userData).subscribe({
      next: (response) => {
        const userIndex = this.users.findIndex((u) => u.userName === userName);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...response };
        }

        this.snackBar.open('تم تحديث البيانات بنجاح', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.resetEditState();
      },
      error: (error) => {
        this.snackBar.open(error.error!.error, 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        console.error('Error updating profile:', error);
      },
    });
  }

  resetEditState(): void {
    this.editingUserName = null;
    this.changeRoleMode = false;
    this.updateProfileMode = false;
    this.selectedRole = null;
    this.updateProfileForm.reset();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (windowHeight + scrollTop >= documentHeight - 100) {
      this.loadUsers();
    }
  }

  handleMaritalStatusChange(maritalStatus: string) {
    const hasChildrenControl = this.updateProfileForm.get('hasChildren');
    const childrenCountControl = this.updateProfileForm.get('childrenCount');

    if (maritalStatus.toLowerCase() === 'single') {
      hasChildrenControl?.setValue(false);
      hasChildrenControl?.disable();
      childrenCountControl?.setValue(0);
      childrenCountControl?.disable();
    } else {
      hasChildrenControl?.enable();
      this.handleHasChildrenChange(hasChildrenControl?.value);
    }
  }

  handleHasChildrenChange(hasChildren: boolean) {
    const childrenCountControl = this.updateProfileForm.get('childrenCount');
    if (hasChildren) {
      childrenCountControl?.setValidators([
        Validators.required,
        Validators.min(1),
      ]);
      childrenCountControl?.enable();
    } else {
      childrenCountControl?.setValidators([Validators.required]);
      childrenCountControl?.setValue(0);
      childrenCountControl?.disable();
    }
    childrenCountControl?.updateValueAndValidity();
  }

  translateRole(role: string): string {
    const translations: { [key: string]: string } = {
      user: 'عميل',
      admin: 'مسؤول',
    };
    return translations[role.toLowerCase()] || role;
  }

  translateMaritalStatus(status: string): string {
    const translations: { [key: string]: string } = {
      single: 'أعزب',
      married: 'متزوج',
      divorced: 'مطلق',
      widowed: 'أرمل',
    };
    return translations[status.toLowerCase()] || status;
  }

  private getMaritalStatusEnum(value: string): MaritalStatus {
    switch (value) {
      case 'أعزب':
        return MaritalStatus.Single;
      case 'متزوج':
        return MaritalStatus.Married;
      case 'مطلق':
        return MaritalStatus.Divorced;
      case 'أرمل':
        return MaritalStatus.Widowed;
      default:
        return MaritalStatus.Single;
    }
  }
}
