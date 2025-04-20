import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGovernoratesComponent } from './manage-governorates.component';

describe('ManageGovernoratesComponent', () => {
  let component: ManageGovernoratesComponent;
  let fixture: ComponentFixture<ManageGovernoratesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageGovernoratesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageGovernoratesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
