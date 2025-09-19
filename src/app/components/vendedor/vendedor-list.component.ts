import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { Vendedor } from '../../models/vendedor.model';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-vendedor-list',
  imports: [ CommonModule, MatTableModule, MatIconModule, MatButtonModule, RouterModule   ],
  templateUrl: './vendedor-list.component.html',
  styleUrl: './vendedor-list.component.css'
})
export class VendedorListComponent implements OnInit {
  api = inject(ApiService);
  snack = inject(MatSnackBar);
  router = inject(Router);

  vendedores: Vendedor[] = [];
  displayedColumns = ['nombre', 'precio', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.api.getVendedores().subscribe((res: any) => {
      this.vendedores = res.data?.map((r: any) => ({ id: r.id, ...r })) || [];
    });
  }

  edit(v: Vendedor) {
    this.router.navigate(['/vendedores/new'], { queryParams: { id: v.id } });
  }

  remove(v: Vendedor) {
    if(!confirm('¿Eliminar vendedor?')) return;
    this.api.deleteVendedor(v.id!).subscribe(() => {
      this.snack.open('Vendedor eliminado', 'ok', { duration: 2000 });
      this.load();
    });
  }
}