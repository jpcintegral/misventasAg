import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { RouterModule, Router } from '@angular/router';
import { Vendedor } from '../../models/vendedor.model';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [ CommonModule, MatTableModule, MatButtonModule, RouterModule ],
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.css']
})
export class SaleListComponent implements OnInit {
  api = inject(ApiService);
  router = inject(Router);

  ventas: any[] = [];
  columns = ['status','tipoventa','codigo','fecha','total','acciones'];

  ngOnInit() {
    this.api.getSellerOrders().subscribe((res: any) => {
      // Transformamos la data para usarla en la tabla
      this.ventas = res.data.map((v: any) => ({
        codigo: v.codigo,
        id: v.id,
        documentId: v.documentId,
        estado: v.status,
        fecha: v.fecha,
        total: v.total,
        vendedor: v.vendedor,
        items: v.items?.map((item: any) => ({
          id: item.id,
          articulo: item.articulo?.data?.id,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        })) || []
      }));
    });
  }

  detail(v: any) {
    // Navega al detalle con el id
     this.router.navigate(['/ventas', v.id], { queryParams: { id: v.documentId ,vendedor:v.vendedor?.nombre} });
  }

  isventaNovalidad(venta: any): boolean {
   
  if (!venta) return false;
 
  // Solo nos interesa validar ventas pendientes
  if (venta.estado !== 'PENDIENTE') return false;

  // Si algún item no tiene artículo asignado, la venta es inválida
  const itemsInvalidos = venta.items.some((item: any) => !item.articulo);
   
  return itemsInvalidos;
}


 deleteSale(venta: any) {
    // Validamos que la venta exista
    if (!venta) return;
     console.log('Eliminando venta', venta.estado);
    // Opcional: solo permitir eliminar si está pendiente y es inválida
    if (venta.estado !== 'PENDIENTE' || !this.isventaNovalidad(venta)) {
      alert('Solo se pueden eliminar ventas pendientes con artículos faltantes');
      return;
    }

    // Confirmación
    if (!confirm(`¿Deseas eliminar la venta ${venta.codigo}?`)) return;

    this.api.deleteSellerOrderFull(venta.id).subscribe({
      next: () => {
        // Eliminamos la venta del listado para actualizar la UI
        this.ventas = this.ventas.filter(v => v.id !== venta.id);
        alert('Venta eliminada correctamente');
      },
      error: (err) => {
        console.error(err);
        alert('Ocurrió un error al eliminar la venta');
      }
    });
  }

  cancelarVenta(venta: any) {
  if (!confirm(`¿Deseas cancelar la venta ${venta.codigo}?`)) return;
   venta.estado = 'CANCELADO';
  this.api.updateSellerOrderStatus(venta.documentId,"CANCELADO").subscribe({
    next: (res) => {
      // Actualizamos el estado en la UI
      venta.estado = 'CANCELADO';
      alert(`Venta ${venta.codigo} cancelada correctamente.`);
    },
    error: (err) => {
      console.error(err);
      alert(`Error al cancelar la venta ${venta.codigo}`);
    }
  });
}

}
