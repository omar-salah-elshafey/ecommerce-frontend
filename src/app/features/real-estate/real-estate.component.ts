import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-real-estate',
  imports: [],
  templateUrl: './real-estate.component.html',
  styleUrl: './real-estate.component.scss',
})
export class RealEstateComponent implements OnInit {
  private router = inject(Router);
  ngOnInit(): void {
    this.router.navigate(['/coming-soon']);
  }
}
