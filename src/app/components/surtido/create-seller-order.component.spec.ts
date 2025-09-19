import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSellerOrderComponent } from './create-seller-order.component';

describe('CreateSellerOrderComponent', () => {
  let component: CreateSellerOrderComponent;
  let fixture: ComponentFixture<CreateSellerOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSellerOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSellerOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
