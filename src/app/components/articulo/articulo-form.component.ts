import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-articulo-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    RouterModule
  ],
  templateUrl: './articulo-form.component.html',
  styleUrl: './articulo-form.component.css'
})
export class ArticuloFormComponent implements OnInit {
  fb = inject(FormBuilder);
  api = inject(ApiService);
  snack = inject(MatSnackBar);
  route = inject(ActivatedRoute);
  router = inject(Router);

  proveedores: any[] = [];

  form = this.fb.group({
    marca: ['', Validators.required],
    precio_proveedor: [0, Validators.required],
    precio_venta: [0, Validators.required],
    mililitros: [0, Validators.required],
    proveedor: [null, Validators.required]
  });

  editingId?: string;

  ngOnInit() {
    // cargar proveedores para el select
    this.api.getProveedores().subscribe((res: any) => {
      this.proveedores = res.data?.map((p: any) => ({
        id: p.id,
        nombre: p.attributes?.nombre || p.nombre
      })) || [];
    });

    // si viene con ID, es edición
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.editingId = params['id'];
        this.api.getArticulo(this.editingId!).subscribe((res: any) => {
          if (res?.data) {
            this.form.patchValue({
              marca: res.data.marca,
              precio_proveedor: res.data.precio_proveedor,
              precio_venta: res.data.precio_venta,
              mililitros: res.data.mililitros,
              proveedor: res.data.proveedor?.id || null
            });
          }
        });
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value ;

    if (this.editingId) {
      this.api.updateArticulo(this.editingId, payload).subscribe(() => {
        this.snack.open('Artículo actualizado', 'ok', { duration: 2000 });
        this.router.navigate(['/articulos']);
      });
    } else {
      this.api.createArticulo(payload).subscribe(() => {
        this.snack.open('Artículo creado', 'ok', { duration: 2000 });
        this.router.navigate(['/articulos']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/articulos']);
  }
}
