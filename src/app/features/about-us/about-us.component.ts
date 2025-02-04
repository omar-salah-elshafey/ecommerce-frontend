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
      text: 'منتجاتنا تخضع لأعلى معايير الجودة',
    },
    {
      icon: 'local_shipping',
      title: 'شحن سريع',
      text: 'توصيل خلال ٢٤-٤٨ ساعة',
    },
    {
      icon: 'support_agent',
      title: 'دعم فني',
      text: 'خدمة عملاء على مدار الساعة',
    },
  ];

  team = [
    { name: 'محمد أحمد', role: 'المدير التنفيذي', img: 'assets/team/ceo.jpg' },
    {
      name: 'فاطمة خالد',
      role: 'مدير التسويق',
      img: 'assets/team/marketing.jpg',
    },
  ];

  timeline = [
    { year: '٢٠٢٠', event: 'تأسيس الشركة' },
    { year: '٢٠٢٢', event: 'توسعة فريق العمل' },
    { year: '٢٠٢٤', event: 'وصول لأكثر من ١٠٠ ألف عميل' },
  ];
}
