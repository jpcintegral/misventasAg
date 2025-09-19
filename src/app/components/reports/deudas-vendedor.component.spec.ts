import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeudasVendedorComponent } from './deudas-vendedor.component';

describe('DeudasVendedorComponent', () => {
  let component: DeudasVendedorComponent;
  let fixture: ComponentFixture<DeudasVendedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeudasVendedorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeudasVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
