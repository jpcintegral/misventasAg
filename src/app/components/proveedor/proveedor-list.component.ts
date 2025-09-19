import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { Proveedor } from  '../../models/proveedor.model';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-proveedor-list',
  imports: [ CommonModule, MatTableModule, MatIconModule, MatButtonModule, RouterModule   ],
  templateUrl: './proveedor-list.component.html',
  styleUrl: './proveedor-list.component.css'
})
export class ProveedorListComponent implements OnInit {
  api = inject(ApiService);
  snack = inject(MatSnackBar);
  router = inject(Router);

  proveedores: Proveedor[] = [];
  displayedColumns = ['nombre','telefono','email','direccion','actions'];

  ngOnInit() { this.load(); }

  load() {
    this.api.getProveedores().subscribe((res: any) => {
      this.proveedores = res.data?.map((r: any) => ({ id: r.id, ...r })) || [];
    });
  }

  edit(p: Proveedor) {
      this.router.navigate(['/proveedores/new'], { queryParams: { id: p.documentId } });
  }

  remove(p: Proveedor) {
    if(!confirm('¿Eliminar proveedor?')) return;
    this.api.deleteProveedor(p.documentId!).subscribe(() => {
      this.snack.open('Proveedor eliminado', 'ok', { duration: 2000 });
      this.load();
    });
  }
}
