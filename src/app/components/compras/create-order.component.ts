import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-create-order',
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
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent implements OnInit {
  fb = inject(FormBuilder);
  api = inject(ApiService);
  snack = inject(MatSnackBar);
  router = inject(Router);
    private baseUrl = `${environment.urlBackend}`;

  form = this.fb.group({
    proveedorId: [null, Validators.required],
    articulos: this.fb.array([])
  });

  proveedores: any[] = [];
  articulos: any[] = [];
  displayedColumns = ['marca', 'precioProveedor', 'cantidad', 'total'];

  ngOnInit() {
    this.api.getProveedores().subscribe((res: any) => {
      this.proveedores = res.data.map((p: any) => ({ id: p.id, ...p }));
    });
  }

  get articulosArray() {
    return this.form.get('articulos') as FormArray;
  }

  getArticuloControl(index: number): any {
    return this.articulosArray.at(index);
  }

  getTotal(index: number) {
    const cantidad = this.getArticuloControl(index).value || 0;
    return cantidad * this.articulos[index].precio_proveedor;
  }

  calculateGrandTotal() {
    return this.articulosArray.controls.reduce(
      (sum, ctrl, i) => sum + (ctrl.value || 0) * this.articulos[i].precio_proveedor,
      0
    );
  }

  onProveedorChange(proveedorId: number) {
    this.api.getArticulosByProveedor(proveedorId).subscribe((res: any) => {
      this.articulos = res.data.map((a: any) => ({
        id: a.id,
        marca: a.marca,
        precio_proveedor: a.precio_proveedor,
        imagen : a.imagen
      }));
      // reset form array
      this.form.setControl('articulos', this.fb.array([]));
      this.articulos.forEach(() => this.articulosArray.push(this.fb.control(0)));
    });
  }

  generateCodigoPedido(proveedorId: number): string {
    const today = new Date();
    const fechaStr = today.toISOString().split('T')[0]; // yyyy-mm-dd
    const uid = Math.random().toString(36).substring(2, 8);
    return `${fechaStr}-${uid}-${proveedorId}`;
  }

   submit() {
  if (this.form.invalid) return;

  const proveedorId = this.form.value.proveedorId!;
  const itemsPayload = this.articulosArray.controls
    .map((c, i) => ({
      articulo: this.articulos[i].id,
      cantidad: c.value,
      precio: this.articulos[i].precio_proveedor,
      subtotal: (c.value || 0) * this.articulos[i].precio_proveedor
    }))
    .filter(x => x.cantidad > 0);

  // 1️⃣ Crear el pedido
  const pedidoPayload = {
    data: {
      proveedor: { connect: { id: proveedorId } },
      status: 'PENDIENTE',
      total: this.calculateGrandTotal()
    }
  };

  this.api.createOrder(pedidoPayload).subscribe({
    next: (res: any) => {
      const purchaseOrderId = res.data.id;

      // 2️⃣ Crear los purchase-items asociados
      itemsPayload.forEach(item => {
        const itemPayload = {
          data: {
            articulo: { connect: { id: item.articulo } },
            cantidad: item.cantidad,
            precio: item.precio,
            subtotal: item.subtotal,
            purchase_order: { connect: { id: purchaseOrderId } }
          }
        };
        this.api.createPurchaseItem(itemPayload).subscribe({
          next: () => {},
          error: err => console.error('Error creando purchase-item:', err)
        });
      });

      this.snack.open('Pedido creado correctamente', 'ok', { duration: 2000 });
      this.router.navigate(['/compras']);
    },
    error: err => console.error(err)
  });
}

   getArticuloImageUrl(articulo: any): string {
     console.log('articulo imagen', articulo);
          if (!articulo?.imagen || articulo.imagen.length === 0) {
            return 'assets/placeholder.png'; // Imagen por defecto si no hay
          }

          // Tomamos la primera imagen del array
          const img = articulo.imagen[0];

          // Si existe la versión small
          if (img.formats?.small?.url) {
            return this.baseUrl + img.formats.small.url;
          }

          // Si no existe small, usamos la imagen original
          return this.baseUrl + img.url;
        }

}
