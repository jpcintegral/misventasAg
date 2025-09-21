import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { maxPendienteValidator } from '../../validators/max-pendiente.validator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-order-detail',
  imports: [ CommonModule,
     MatTableModule, RouterModule, MatButtonModule, ReactiveFormsModule,  MatFormFieldModule, MatInputModule ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  private baseUrl = `${environment.urlBackend}`;
  api = inject(ApiService);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  snack = inject(MatSnackBar);

  pedido: any = null;
  columns = ['marca','precio','cantidad','total'];
  abonoForm!: FormGroup;
  evidenciaFile: File | null = null;

   constructor() {
    
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if(id){
        this.loadOrder(id);
      }
    });
  }

  loadOrder(id: string) {
    this.api.getOrder(id).subscribe((res:any) => {
      if(res?.data){
        const o = res.data;
        this.pedido = {
          id: o.id,
          documentId: o.documentId,
          codigo: o.codigo,
          proveedorNombre: o.proveedor?.nombre || 'Sin proveedor',
          total: o.total || 0,
          estado: o.status || 'PENDIENTE',
          pagos: o.payments || [],
          payments: o.payments || [],
          items: o.items?.map((i:any) => ({
            articulo: i.articulo || 'Desconocido',
            precio: i.precio,
            cantidad: i.cantidad || 0,
            total: i.subtotal || 0
          })) || []
        };
      }
      this.abonoForm = this.fb.group({
      monto: [0, [Validators.required, Validators.min(0),
        maxPendienteValidator(this.pedido)
      ]]
    });
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if(file) this.evidenciaFile = file;
  }
  
submitPayment() {
  if(this.abonoForm.invalid || !this.pedido) return;

  const monto = Number(this.abonoForm.value.monto);
  const totalAbonos = this.pedido.pagos.reduce((sum: number, p: any) => sum + p.monto, 0);
  const nuevoTotalPagado = totalAbonos + monto;

  // Determinar nuevo estado
  let nuevoEstado = 'PENDIENTE';
  if(nuevoTotalPagado >= this.pedido.total) {
    nuevoEstado = 'PAGADO';
  } else if(nuevoTotalPagado > 0) {
    nuevoEstado = 'PARCIAL';
  }

  const formData = new FormData();
  formData.append('data[monto]', monto.toString());
  formData.append('data[purchase_order]', this.pedido.id.toString());

  if(this.evidenciaFile) {
    formData.append('files.evidencia', this.evidenciaFile);
  }

  // Crear payment
  this.api.createPayment(formData).subscribe({
    next: (payment: any) => { 
        
       if (this.evidenciaFile) {
                const uploadData = new FormData();
                uploadData.append('files', this.evidenciaFile, this.evidenciaFile.name);
                uploadData.append('ref', 'api::payment.payment');
                uploadData.append('refId', payment.data.id.toString()); // ✅ id del payment creado
                uploadData.append('field', 'evidencia');

                this.api.uploadFile(uploadData).subscribe({
                  next: () => console.log('Evidencia subida correctamente'),
                  error: err => console.error('Error al subir evidencia', err)
                });
              }
      // Actualizar estado del pedido
      this.api.updateOrderStatus(this.pedido.documentId, { status: nuevoEstado }).subscribe(() => {
        this.snack.open('Pago registrado correctamente', 'ok', { duration: 2000 });
        this.loadOrder(this.pedido.documentId); 
        this.abonoForm.reset();
        this.evidenciaFile = null;
      });
    },
    error: err => console.error(err)
  });
}

get totalAbonos(): number {
  if (!this.pedido?.payments) return 0;
   return this.pedido.payments.reduce((sum: number, p: any) => sum + p.monto, 0);
}

getPaymentImageUrl(pago: any): string {
  if (!pago?.evidencia) return '';
  const evidencia = pago.evidencia[0].url;
  return this.baseUrl + evidencia;
}

  generarComprobanteCompra(compra: any) {
  const doc = new jsPDF();
  console.log('Generando comprobante de compra:', compra);

  // Encabezado
  doc.setFontSize(16);
  doc.text('Comprobante de Compra', 70, 15);

  // Datos generales
  doc.setFontSize(12);
  doc.text(`Compra No: ${compra.codigo}`, 15, 30);
  doc.text(`Proveedor: ${compra.proveedorNombre || 'N/A'}`, 15, 40);
  doc.text(`Estado: ${compra.estado}`, 15, 50);

  // Tabla de artículos
  autoTable(doc, {
    startY: 60,
    head: [['Marca / Artículo', 'Cantidad', 'Precio Unitario', 'Subtotal']],
    body: compra.items.map((i: any) => [
      i.marca,
      i.cantidad,
      `$${i.precio.toFixed(2)}`,
      `$${i.total.toFixed(2)}`
    ])
  });

  // Total de compra
  const total = compra.items.reduce((acc: number, i: any) => acc + i.total, 0);
  let finalY = (doc as any).lastAutoTable?.finalY || 60;
  doc.text(`Total: $${total.toFixed(2)}`, 150, finalY + 10);

  // === Tabla de pagos ===
  if (compra.pagos && compra.pagos.length > 0) {
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Fecha', 'Método', 'Monto']],
      body: compra.pagos.map((p: any) => [
        p.fecha ? new Date(p.fecha).toLocaleDateString() : 'N/A',
        p.metodo || 'N/A',
        `$${p.monto.toFixed(2)}`
      ])
    });

    finalY = (doc as any).lastAutoTable?.finalY || finalY + 20;
    const totalPagos = compra.pagos.reduce((acc: number, p: any) => acc + p.monto, 0);
    doc.text(`Total Pagado: $${totalPagos.toFixed(2)}`, 150, finalY + 10);
    doc.text(`Saldo Pendiente: $${(total - totalPagos).toFixed(2)}`, 150, finalY + 20);
  }

  // === Pie de página con fecha y hora de emisión ===
  const ahora = new Date();
  const fechaHora = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaHora}`, pageWidth - 15, pageHeight - 10, { align: "right" });

  // Guardar PDF
  doc.save(`compra_${compra.codigo}.pdf`);
}

 getArticuloImageUrl(articulo: any): string {
   console.log('Artículo recibido para imagen:', articulo);
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
