import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { fadeIn, staggerAnimation } from '../../shared/animations/animations';

@Component({
  selector: 'app-about-us',
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
  animations: [fadeIn, staggerAnimation],
})
export class AboutUsComponent {
  values = [
    {
      icon: 'verified_user',
      title: 'الجودة المضمونة',
    },
    {
      icon: 'local_shipping',
      title: 'شحن سريع',
    },
    {
      icon: 'support_agent',
      title: 'دعم فني',
    },
  ];

  team = [
    { name: 'محمد رضا', role: 'المالك', icon: 'person' },
    { name: 'م. محمد طاهر', role: 'المدير التنفيذي', icon: 'person' },
    { name: 'محمد سمير', role: 'صانع محتوى', icon: 'person' },
    { name: 'عمر الشافعي', role: 'مهندس برمجيات', icon: 'person' },
  ];

  timeline = [
    { year: '2024', event: 'تأسيس الشركة' },
    { year: '2025', event: 'توسعة فريق العمل' },
  ];
}
