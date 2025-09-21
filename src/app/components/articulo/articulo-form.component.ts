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
import { environment } from '../../../environments/environment';

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
  img: File | null = null;
    private baseUrl = `${environment.urlBackend}`;

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


   onFileSelected(event: any) {
    const file = event.target.files[0];
    if(file) this.img = file;
  }


    
 save() {
  if (this.form.invalid) return;
  const payload = this.form.value;

  if (this.editingId) {
    // Actualización
    this.api.updateArticulo(this.editingId, payload).subscribe({
      next: (updatedArticulo: any) => {
        this.snack.open('Artículo actualizado', 'ok', { duration: 2000 });

        // Subir imagen si hay
        if (this.img) {
           console.log("done img", this.img);
          const uploadData = new FormData();
          uploadData.append('files', this.img, this.img.name);
          uploadData.append('ref', 'api::articulo.articulo'); // nombre del modelo
          uploadData.append('refId', updatedArticulo.data.id.toString());
          uploadData.append('field', 'imagen'); // nombre del campo en Strapi

          this.api.uploadFile(uploadData).subscribe({
            next: () => console.log('Imagen subida correctamente'),
            error: err => console.error('Error al subir imagen', err)
          });
        }

        this.router.navigate(['/articulos']);
      },
      error: err => console.error(err)
    });
  } else {
    // Creación
    this.api.createArticulo(payload).subscribe({
      next: (newArticulo: any) => {
        // Subir imagen si hay
        if (this.img) {
          const uploadData = new FormData();
          uploadData.append('files', this.img, this.img.name);
          uploadData.append('ref', 'api::articulo.articulo'); // nombre del modelo
          uploadData.append('refId', newArticulo.data.id.toString());
          uploadData.append('field', 'imagen'); // nombre del campo en Strapi

          this.api.uploadFile(uploadData).subscribe({
            next: () => console.log('Imagen subida correctamente'),
            error: err => console.error('Error al subir imagen', err)
          });
        }

        this.snack.open('Artículo creado', 'ok', { duration: 2000 });
        this.router.navigate(['/articulos']);
      },
      error: err => console.error(err)
    });
  }
}

  cancel() {
    this.router.navigate(['/articulos']);
  }
  getPaymentImageUrl(articulo: any): string {
  if (!articulo?.imagen) return '';
  const imagen = articulo.imagen[0].url;
  return this.baseUrl + imagen;
}
}
