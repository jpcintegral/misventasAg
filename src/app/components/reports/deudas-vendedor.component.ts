import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-deudas-vendedor',
  imports: [ CommonModule, MatTableModule, MatSelectModule, MatFormFieldModule, MatButtonModule, ReactiveFormsModule ],
  templateUrl: './deudas-vendedor.component.html',
  styleUrl: './deudas-vendedor.component.css'
})
export class DeudaVendedorComponent implements OnInit {
  api = inject(ApiService);
  fb = inject(FormBuilder);

  form = this.fb.group({ vendedorId: [null] });
  vendedores: any[] = [];
  deudas: any[] = [];
  columns = ['marca','cantidadPendiente','deudaTotal'];

  ngOnInit() {
    this.api.getVendedores().subscribe((res:any)=>{
      this.vendedores = res.data.map((v:any)=>({id:v.id,...v.attributes}));
    });
  }

  consultar() {
    const id = this.form.value.vendedorId;
    if(!id) return;

    this.api.getDeudaVendedor(id).subscribe((res:any)=>{
      this.deudas = res.data.map((d:any)=>({
        marca: d.articulo?.data?.attributes?.marca,
        cantidadPendiente: d.cantidadPendiente,
        deudaTotal: d.deudaTotal
      }));
    });
  }
}