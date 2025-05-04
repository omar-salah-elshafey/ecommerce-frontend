import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-investments',
  imports: [],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.scss',
})
export class InvestmentsComponent implements OnInit {
  private router = inject(Router);
  ngOnInit(): void {
    this.router.navigate(['/coming-soon']);
  }
}
