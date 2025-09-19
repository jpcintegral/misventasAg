import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, FormControl, FormGroup } from '@angular/forms';
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
  selector: 'app-create-seller-order',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatTableModule, RouterModule
  ],
  templateUrl: './create-seller-order.component.html',
  styleUrls: ['./create-seller-order.component.css']
})
export class CreateSellerOrderComponent implements OnInit {
  fb = inject(FormBuilder);
  api = inject(ApiService);
  snack = inject(MatSnackBar);
  router = inject(Router);

  form = this.fb.group({
    vendedorId: [null, Validators.required],
    articulos: this.fb.array([]) // FormArray dinámico
  });

  vendedores: any[] = [];
  articulos: any[] = [];
  displayedColumns = ['marca', 'precio_al_vendedor', 'stock', 'cantidad', 'subtotal'];

  ngOnInit() {
    // Obtener vendedores
    this.api.getVendedores().subscribe((res: any) => {
      this.vendedores = res.data.map((v: any) => ({ id: v.id, nombre: v.nombre }));
    });

    // Obtener artículos
    this.api.getArticulos().subscribe((res: any) => {
      this.articulos = res.data.map((a: any) => ({
        id: a.id,
        marca: a.marca,
        stock: a.stock,
        precio_venta: a.precio_venta
      }));

      // Crear controles por artículo
      this.articulos.forEach(a => {
        this.articulosArray.push(this.fb.group({
          cantidad: [0, [Validators.min(0), Validators.max(a.stock)]],
          precio_al_vendedor: [null, [Validators.min(0)]]
        }));
      });
    });
  }

  get articulosArray() {
    return this.form.get('articulos') as FormArray;
  }

  getArticuloControl(index: number): FormGroup {
    return this.articulosArray.at(index) as FormGroup;
  }

  getSubtotal(index: number) {
    const control = this.getArticuloControl(index);
    const cantidad = control.get('cantidad')?.value || 0;
    const precio = control.get('precio_al_vendedor')?.value || this.articulos[index].precio_venta;
    return cantidad * precio;
  }

  calculateGrandTotal() {
    return this.articulosArray.controls.reduce((sum, ctrl, i) => {
      const cantidad = ctrl.get('cantidad')?.value || 0;
      const precio = ctrl.get('precio_al_vendedor')?.value || this.articulos[i].precio_venta;
      return sum + cantidad * precio;
    }, 0);
  }

  submit() {
     if (!this.form.value.vendedorId) {
    this.snack.open('Debe seleccionar un vendedor', 'ok', { duration: 2000 });
    return;
  }


    // Mapear items seleccionados
    const items = this.articulosArray.controls.map((ctrl, i) => {
      const cantidad = ctrl.get('cantidad')?.value;
      const precio = ctrl.get('precio_al_vendedor')?.value || this.articulos[i].precio_venta;
      return {
        articulo: this.articulos[i].id,
        cantidad,
        precio_al_vendedor: precio,
        subtotal: cantidad * precio
      };
    }).filter(it => it.cantidad > 0);

    if (items.length === 0) {
      this.snack.open('Debe seleccionar al menos una botella', 'ok', { duration: 2000 });
      return;
    }

    // Validación de stock
    const excedeStock = items.some(item => item.cantidad > this.articulos.find(a => a.id === item.articulo).stock);
    if (excedeStock) {
      this.snack.open('No hay suficiente stock para alguno de los artículos', 'ok', { duration: 3000 });
      return;
    }

    // Crear la orden primero
    const pedido = {
      vendedor: this.form.value.vendedorId,
      fecha: new Date(),
      status: 'PENDIENTE',
      total: this.calculateGrandTotal()
    };

    this.api.createSellerOrder(pedido).subscribe({
      next: (res: any) => {
        const orderId = res.data.id;

        // Crear items asociados
        const requests = items.map(it => {
          return this.api.createSellerOrderItem({
            articulo: it.articulo,
            cantidad: it.cantidad,
            precio_al_vendedor: it.precio_al_vendedor,
            subtotal: it.subtotal,
            seller_order: orderId
          });
        });

        forkJoin(requests).subscribe({
          next: () => {
            this.snack.open('Pedido a vendedor registrado', 'ok', { duration: 2000 });
            this.router.navigate(['/surtido']);
          },
          error: err => console.error('Error al crear items', err)
        });
      },
      error: err => console.error('Error al crear orden', err)
    });
  }

  getArticuloControlField(index: number, field: string): FormControl {
  return this.articulosArray.at(index).get(field) as FormControl;
}

}
