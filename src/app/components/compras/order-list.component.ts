import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-order-list',
  imports: [ CommonModule, MatTableModule, MatButtonModule, RouterModule ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  api = inject(ApiService);
  router = inject(Router);

  orders: any[] = [];
  columns = ['codigo','proveedor','total','estado','acciones'];

  ngOnInit() {
    this.api.getOrders().subscribe((res:any) => {
      this.orders = res.data.map((o:any) => ({
        id: o.id,
        codigo: o.codigo,
        documentId: o.documentId,
        proveedorNombre: o.proveedor?.nombre || 'Sin proveedor',
        total: o.total || 0,
        estado: o.status || 'PENDIENTE'
      }));
    });
  }

  detail(o: any) {
    this.router.navigate(['/compras', o.id], { queryParams: { id: o.documentId } });
  }
}
