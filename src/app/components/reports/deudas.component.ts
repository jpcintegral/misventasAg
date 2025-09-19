import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-deudas',
  imports: [ CommonModule, MatTableModule, MatSelectModule, MatFormFieldModule, MatButtonModule, ReactiveFormsModule ],
  templateUrl: './deudas.component.html',
  styleUrl: './deudas.component.css'
})
export class DeudaProveedorComponent implements OnInit {
  api = inject(ApiService);
  fb = inject(FormBuilder);

  form = this.fb.group({ documentId: [null] });
  proveedores: any[] = [];
  deudas: any[] = [];
  columns = ['marca','cantidadPendiente','deudaTotal'];

  ngOnInit() {
    this.api.getProveedores().subscribe((res:any) => {
      this.proveedores = res.data.map((p:any) => ({ id:p.id, ...p }));
    });
  }

  consultar() {
    const documentId = this.form.value.documentId;
    if(!documentId) return;

    this.api.getDeudaProveedor(documentId).subscribe((res:any) => {
      this.deudas = res.data.map((d:any)=>({
        marca: d.articulo?.data?.marca,
        cantidadPendiente: d.cantidadPendiente,
        deudaTotal: d.deudaTotal
      }));
    });
  }
}