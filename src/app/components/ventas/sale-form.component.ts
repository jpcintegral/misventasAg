import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [ 
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    RouterModule
  ],
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.css']
})
export class SaleFormComponent implements OnInit {
  fb = inject(FormBuilder);
  api = inject(ApiService);
  snack = inject(MatSnackBar);
  router = inject(Router);
  evidenciaFile: File | null = null;

  form = this.fb.group({
    articulos: this.fb.array<FormControl<number>>([]),
     status: this.fb.control('PENDIENTE', { nonNullable: true }),
     
  });
montoControl = new FormControl(0, [Validators.required, Validators.min(0)]);

  

  articulos: any[] = [];
  displayedColumns = ['marca','precioVenta','stock','cantidad','total'];

 ngOnInit() {
  this.api.getArticulosConStock().subscribe((res: any[]) => {
    this.articulos = res.map((a: any) => ({ id: a.id, ...a }));
    this.articulos.forEach((a) =>
      this.articulosArray.push(
        new FormControl(0, {
          nonNullable: true,
          validators: [
            Validators.min(0),
            Validators.max(a.stock) // 👈 no permite ingresar más que el stock
          ]
        })
      )
    );
  });

  this.form.controls['status'].valueChanges.subscribe(status => {
    if (status === 'PAGADO') {
      this.montoControl.setValue(this.calculateGrandTotal());
      this.montoControl.disable();
    } else if (status === 'PARCIAL') {
      this.montoControl.enable();
      this.montoControl.setValue(0);
    } else {
      this.montoControl.reset();
    }
  });
}


  get articulosArray(): FormArray<FormControl<number>> {
    return this.form.get('articulos') as FormArray<FormControl<number>>;
  }

  getArticuloControl(index: number): FormControl<number> {
    return this.articulosArray.at(index) as FormControl<number>;
  }

  getTotal(index: number) {
    const cantidad = this.getArticuloControl(index).value || 0;
    return cantidad * this.articulos[index].precio_venta;
  }

  calculateGrandTotal() {
    return this.articulosArray.controls.reduce((sum, ctrl, i) => sum + (ctrl.value || 0) * this.articulos[i].precio_venta, 0);
  }



onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.evidenciaFile = file;
  }
}

  submit() {
  const items = this.articulosArray.controls
    .map((c, i) => ({
      articulo: this.articulos[i].id,   // relación con articulo
      cantidad: c.value,
      subtotal: c.value * this.articulos[i].precio_venta,
      precio_venta: this.articulos[i].precio_venta
    }))
    .filter(x => x.cantidad > 0);

  if(items.length === 0){
    this.snack.open('Debe seleccionar al menos una botella', 'ok',{duration:2000});
    return;
  }

  // Validación de stock
  const excedeStock = items.some(item => item.cantidad > this.articulos.find(a => a.id === item.articulo).stock);
  if(excedeStock){
    this.snack.open('No hay suficiente stock para alguno de los artículos', 'ok',{duration:3000});
    return;
  }

  // Crear la orden primero
  const venta = {
    fecha: new Date(),
    status: this.form.controls['status'].value,
    total: this.calculateGrandTotal(),
    vendedor: null
  };

  this.api.createSellerOrder(venta).subscribe({
    next: (res: any) => {
      const orderId = res.data.id;

      // Crear los items asociados
      const requests = items.map(it => {
        return this.api.createSellerOrderItem({
          cantidad: it.cantidad,
          subtotal: it.subtotal,
          precio_venta: it.precio_venta,
          articulo: it.articulo,
          seller_order: orderId
        });
      });

      // Ejecutar todas las peticiones de items
     forkJoin(requests).subscribe({
        next: () => {
          // 👇 Si la venta es PAGADA, registramos el pago directo
          if (venta.status === 'PAGADO' || venta.status === 'PARCIAL') {
            
         const pago = new FormData();
            pago.append('data[monto]', (venta.status === 'PARCIAL' ? this.montoControl.value! : venta.total).toString());
            pago.append('data[seller_order]', orderId.toString());
       
        
            this.api.createPayment(pago).subscribe({
              next: (payment: any) => {
              if (this.evidenciaFile) {
                const uploadData = new FormData();
                uploadData.append('files', this.evidenciaFile, this.evidenciaFile.name);
                uploadData.append('ref', 'api::payment.payment');
                uploadData.append('refId', payment.data.id.toString()); // ✅ id del payment creado
                uploadData.append('field', 'evidencia');

                this.api.uploadFile(uploadData).subscribe({
                  next: () => console.log('Evidencia subida correctamente'),
                  error: err => console.error('Error al subir evidencia', err)
                });
              }
              

                this.snack.open('Venta y pago registrados correctamente', 'ok', { duration: 2500 });
                this.router.navigate(['/ventas']);
              },
              error: err => console.error('Error al registrar pago', err)
            });
          } else {
            this.snack.open('Venta registrada correctamente', 'ok', { duration: 2000 });
            this.router.navigate(['/ventas']);
          }
        },
        error: (err) => console.error('Error al crear items', err)
      });
    },
    error: (err) => console.error('Error al crear orden', err)
  });
}


}
