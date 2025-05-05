import { Component, HostListener, OnInit } from '@angular/core';
import { UserProfileService } from '../../../core/services/userProfile/user-profile.service';
import {
  ChangeUserRoleDto,
  DeleteProfile,
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
import { AuthService } from '../../../core/services/auth/auth.service';

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

  editingUserId: string | null = null;
  selectedRole: Role | null = null;

  changeRoleMode: boolean = false;

  updateProfileMode: boolean = false;
  updateProfileForm!: FormGroup;

  maritalStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];

  constructor(
    private userService: UserProfileService,
    private cookieService: CookieService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    public authService: AuthService
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
      // maritalStatus: ['', Validators.required],
      // hasChildren: [false, Validators.required],
      // childrenCount: [0, Validators.required],
    });

    // this.updateProfileForm
    //   .get('maritalStatus')
    //   ?.valueChanges.subscribe(this.handleMaritalStatusChange.bind(this));

    // this.updateProfileForm
    //   .get('hasChildren')
    //   ?.valueChanges.subscribe(this.handleHasChildrenChange.bind(this));
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

  onDeleteAccount(userId: string) {
    if (!confirm('هل أنت متأكد من حذف الحساب')) return;

    const userData: DeleteProfile = {
      userId: userId,
    };
    this.isLoading = true;
    this.userService.deleteProfile(userData).subscribe({
      next: () => {
        this.snackBar.open('تم حذف الملف الشخصي', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.isLoading = false;
        this.users = this.users.filter((user) => user.userId !== userId);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.snackBar.open('حدث خطأ أثناء الحذف', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.isLoading = false;
      },
    });
  }

  startEditRole(user: UserDto) {
    this.resetEditState();
    this.editingUserId = user.userId;
    this.changeRoleMode = true;
    switch (user.role.toLowerCase()) {
      case 'user':
        this.selectedRole = Role.User;
        break;
      case 'admin':
        this.selectedRole = Role.Admin;
        break;
      case 'superadmin':
        this.selectedRole = Role.SuperAdmin;
        break;
      case 'partner':
        this.selectedRole = Role.Partner;
        break;
      default:
        this.selectedRole = null;
        console.warn(`Unknown role: ${user.role}`);
    }
  }

  saveRoleChange(userId: string) {
    if (this.selectedRole === null) {
      this.snackBar.open('يرجى اختيار صلاحية!', 'إغلاق', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return;
    }

    const userData: ChangeUserRoleDto = {
      userId: userId,
      role: this.selectedRole,
    };
    this.isLoading = true;
    this.userService.changeUserRole(userData).subscribe({
      next: (response) => {
        const user = this.users.find((u) => u.userId === userId);
        if (user) {
          user.role = this.mapRoleToString(this.selectedRole);
          this.users = [...this.users];
        }
        this.snackBar.open('تم تغيير الصلاحية بنجاح', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.isLoading = false;
        this.resetEditState();
      },
      error: (err) => {
        this.snackBar.open(err.error!.error, 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.isLoading = false;
        console.error('Error changing user role:', err);
      },
    });
  }

  startEditProfile(user: UserDto) {
    this.resetEditState();
    this.editingUserId = user.userId;
    this.updateProfileMode = true;

    this.updateProfileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      // maritalStatus: this.translateMaritalStatus(user.maritalStatus),
      // hasChildren: user.hasChildren,
      // childrenCount: user.childrenCount,
    });

    // this.handleMaritalStatusChange(user.maritalStatus);
    // this.handleHasChildrenChange(user.hasChildren);
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
      // maritalStatus: this.getMaritalStatusEnum(
      //   this.updateProfileForm.value.maritalStatus
      // ),
      // hasChildren: this.updateProfileForm.value.hasChildren,
      // childrenCount: this.updateProfileForm.value.childrenCount,
    };
    this.isLoading = true;

    this.userService.updateProfile(userName, userData).subscribe({
      next: (response) => {
        const userIndex = this.users.findIndex((u) => u.userId === userName);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...response };
        }

        this.snackBar.open('تم تحديث البيانات بنجاح', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.isLoading = false;
        this.resetEditState();
      },
      error: (error) => {
        this.snackBar.open(error.error!.error, 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.isLoading = false;
        console.error('Error updating profile:', error);
      },
    });
  }

  resetEditState(): void {
    this.editingUserId = null;
    this.changeRoleMode = false;
    this.updateProfileMode = false;
    this.selectedRole = null;
    this.updateProfileForm.reset();
  }

  private mapRoleToString(role: Role | null): string {
    switch (role) {
      case Role.User:
        return 'user';
      case Role.Admin:
        return 'admin';
      case Role.SuperAdmin:
        return 'superadmin';
      case Role.Partner:
        return 'partner';
      default:
        throw new Error(`Unknown role: ${role}`);
    }
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

  translateRole(role: string): string {
    const translations: { [key: string]: string } = {
      user: 'عميل',
      admin: 'مسؤول',
      superadmin: 'مسؤول عام',
      partner: 'شريك نجاح',
    };
    return translations[role.toLowerCase()] || role;
  }

  // handleMaritalStatusChange(maritalStatus: string) {
  //   const hasChildrenControl = this.updateProfileForm.get('hasChildren');
  //   const childrenCountControl = this.updateProfileForm.get('childrenCount');

  //   if (maritalStatus.toLowerCase() === 'single') {
  //     hasChildrenControl?.setValue(false);
  //     hasChildrenControl?.disable();
  //     childrenCountControl?.setValue(0);
  //     childrenCountControl?.disable();
  //   } else {
  //     hasChildrenControl?.enable();
  //     this.handleHasChildrenChange(hasChildrenControl?.value);
  //   }
  // }

  // handleHasChildrenChange(hasChildren: boolean) {
  //   const childrenCountControl = this.updateProfileForm.get('childrenCount');
  //   if (hasChildren) {
  //     childrenCountControl?.setValidators([
  //       Validators.required,
  //       Validators.min(1),
  //     ]);
  //     childrenCountControl?.enable();
  //   } else {
  //     childrenCountControl?.setValidators([Validators.required]);
  //     childrenCountControl?.setValue(0);
  //     childrenCountControl?.disable();
  //   }
  //   childrenCountControl?.updateValueAndValidity();
  // }

  // translateMaritalStatus(status: string): string {
  //   const translations: { [key: string]: string } = {
  //     single: 'أعزب',
  //     married: 'متزوج',
  //     divorced: 'مطلق',
  //     widowed: 'أرمل',
  //   };
  //   return translations[status.toLowerCase()] || status;
  // }

  // private getMaritalStatusEnum(value: string): MaritalStatus {
  //   switch (value) {
  //     case 'أعزب':
  //       return MaritalStatus.Single;
  //     case 'متزوج':
  //       return MaritalStatus.Married;
  //     case 'مطلق':
  //       return MaritalStatus.Divorced;
  //     case 'أرمل':
  //       return MaritalStatus.Widowed;
  //     default:
  //       return MaritalStatus.Single;
  //   }
  // }
}
