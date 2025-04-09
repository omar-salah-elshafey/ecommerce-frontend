import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersMessagesComponent } from './customers-messages.component';

describe('CustomersMessagesComponent', () => {
  let component: CustomersMessagesComponent;
  let fixture: ComponentFixture<CustomersMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
