import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { Articulo } from '../../models/articulo.model';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-articulo-list',
  imports: [ CommonModule, MatTableModule, MatIconModule, MatButtonModule, RouterModule   ],
  templateUrl: './articulo-list.component.html',
  styleUrl: './articulo-list.component.css'
})
export class ArticuloListComponent implements OnInit {
  api = inject(ApiService);
  snack = inject(MatSnackBar);
  router = inject(Router);
   private baseUrl = `${environment.urlBackend}`;

  articulos: Articulo[] = [];
  displayedColumns = ['proveedor','marca','precioProveedor','precioVenta','mililitros','actions'];

  ngOnInit() { this.load(); }

  load() {
   this.api.getArticulos().subscribe((res: any) => {
  this.articulos = res.data?.map((r: any) => ({
    id: r.id,
    marca: r.marca,
    mililitros: r.mililitros,
    precio_proveedor: r.precio_proveedor,
    precio_venta: r.precio_venta,
    stock: r.stock,
    purchase_items: r.purchase_items,
    seller_order_items: r.seller_order_items,
    documentId: r.documentId,
    proveedor: r.proveedor.nombre,
    imagen: r.imagen || null // si tu content-type tiene media
  })) || [];
});

  }

  edit(a: Articulo) {
    this.router.navigate(['/articulos/new'], { queryParams: { id: a.documentId } });
  }

canDelete(articulo: any): boolean {
   console.log('articulo para borrar', articulo);
  // Si no hay seller_order_items, se puede borrar
  if (!articulo.seller_order_items?.length) return true;

  // Validamos que ninguno tenga un seller_order con status PENDIENTE
  const tienePendientes = articulo.seller_order_items.some((item: any) => {
    return item.seller_order?.status === 'PENDIENTE';
  });
  console.log('tienePendientes', tienePendientes);
  return tienePendientes;
}

  remove(a: Articulo) {

      if (!this.canDelete(a)) {
      this.snack.open('No se puede eliminar: el artículo tiene ventas pendientes o parciales.', 'cerrar', {
        duration: 3000
      });
      return;
      }

    if(!confirm('¿Eliminar artículo?')) return;
    this.api.deleteArticulo(a.documentId!).subscribe(() => {
      this.snack.open('Artículo eliminado', 'ok', { duration: 2000 });
      this.load();
    });
  }
        getArticuloImageUrl(articulo: any): string {
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