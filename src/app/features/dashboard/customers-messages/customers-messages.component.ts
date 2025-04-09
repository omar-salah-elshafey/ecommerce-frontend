import { Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { MessageDto } from '../../../core/models/contact-us';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactUsService } from '../../../core/services/contact-us/contact-us.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-customers-messages',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCardModule,
  ],
  templateUrl: './customers-messages.component.html',
  styleUrl: './customers-messages.component.scss',
})
export class CustomersMessagesComponent {
  messages: MessageDto[] = [];
  private currentPage: number = 1;
  private pageSize: number = 20;
  private hasMore: boolean = true;
  isLoading: boolean = false;

  displayedColumns: string[] = [
    'name',
    'email',
    'message',
    'messageDate',
    'isRead',
    'actions',
  ];

  @ViewChild('messageDialogTemplate') messageDialogTemplate!: TemplateRef<any>;
  public dialogRef?: MatDialogRef<any>;

  constructor(
    private snackBar: MatSnackBar,
    private contactUsService: ContactUsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    this.contactUsService
      .getAllMessages(this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.messages = [...this.messages, ...res.items];
          this.currentPage++;
          this.hasMore = res.items.length === this.pageSize;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          this.isLoading = false;
        },
      });
  }

  openMessageDialog(message: MessageDto): void {
    this.dialogRef = this.dialog.open(this.messageDialogTemplate, {
      width: '500px',
      data: message,
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.markAsRead(message);
    });
  }

  markAsRead(message: MessageDto) {
    if (message.isRead) return;

    this.contactUsService.markRead(message.id).subscribe({
      next: () => {
        message.isRead = true;
        this.snackBar.open('تم تعليم الرسالة كمقروءة', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        console.error('Error marking message as read:', error);
        this.snackBar.open('خطأ في تعليم الرسالة', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  deleteMessage(messageId: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    this.contactUsService.deleteMessage(messageId).subscribe({
      next: () => {
        this.messages = this.messages.filter((msg) => msg.id !== messageId);
        this.snackBar.open('تم حذف الرسالة بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        console.error('Error deleting message:', error);
        this.snackBar.open('خطأ في حذف الرسالة', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (
      window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100 &&
      this.hasMore &&
      !this.isLoading
    ) {
      this.loadMessages();
    }
  }
}
