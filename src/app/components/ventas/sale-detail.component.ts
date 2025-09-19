import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { maxPendienteValidator } from '../../validators/max-pendiente.validator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'


@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [ CommonModule, MatInputModule,
    MatTableModule, MatButtonModule, RouterModule, ReactiveFormsModule, MatFormFieldModule ],
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.css']
})
export class SaleDetailComponent implements OnInit {
   private baseUrl = 'http://localhost:1337'; 
  api = inject(ApiService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);
  snack = inject(MatSnackBar);
  abonoForm!: FormGroup;
  evidenciaFile: File | null = null;
  vendedor : string = '';

  venta: any = null;
  displayedColumns = ['articulo', 'cantidad', 'precio', 'subtotal'];
  constructor() {
    
  }


  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    this.vendedor = this.route.snapshot.queryParamMap.get('vendedor') || '';
     console.log('ID de la venta:', id);
    if (id) {
     this.loadOrder(id);
   
    
    }
  }


  loadOrder(id: string) {
     if (id) {
      this.api.getSellerOrder(id).subscribe((res: any) => {
        if (res?.data) {
          const v = res.data;
          this.venta = {
            id: v.id,
            documentId: v.documentId,
            codigo: v.codigo,
            fecha: v.fecha,
            status: v.status,
             pagos: v.payments || [],
             payments: v.payments || [],
            total: v.total,
            items: v.items.map((i: any) => ({
              id: i.id,
              articulo: i.articulo.marca || 'N/A',
              cantidad: i.cantidad,
              precio: i.articulo.precio_venta,
              subtotal: i.subtotal
            }))
          };
        }
          this.abonoForm = this.fb.group({
      monto: [0, [Validators.required, 
        Validators.min(0),maxPendienteValidator(this.venta)]]
    });
      });
    }
  }
  goBack() {
    this.router.navigate(['/ventas']);
  }

  get totalAbonos(): number {
  if (!this.venta?.payments) return 0;
   return this.venta.payments.reduce((sum: number, p: any) => sum + p.monto, 0);
}
 onFileSelected(event: any) {
    const file = event.target.files[0];
    if(file) this.evidenciaFile = file;
  }


    
submitPayment() {
  if(this.abonoForm.invalid || !this.venta) return;

  const monto = Number(this.abonoForm.value.monto);
  const totalAbonos = this.venta.pagos.reduce((sum: number, p: any) => sum + p.monto, 0);
  const nuevoTotalPagado = totalAbonos + monto;

  // Determinar nuevo estado
  let nuevoEstado = 'PENDIENTE';
  if(nuevoTotalPagado >= this.venta.total) {
    nuevoEstado = 'PAGADO';
  } else if(nuevoTotalPagado > 0) {
    nuevoEstado = 'PARCIAL';
  }

  const formData = new FormData();
  formData.append('data[monto]', monto.toString());
  formData.append('data[seller_order]', this.venta.id.toString());

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
      this.api.updateSellerOrder(this.venta.documentId, { status: nuevoEstado }).subscribe(() => {
        this.snack.open('Pago registrado correctamente', 'ok', { duration: 2000 });
        this.loadOrder(this.venta.documentId); 
        this.abonoForm.reset();
        this.evidenciaFile = null;
      });
    },
    error: err => console.error(err)
  });
}

  getPaymentImageUrl(pago: any): string {
  if (!pago?.evidencia) return '';
  const evidencia = pago.evidencia[0].url;
  return this.baseUrl + evidencia;
}

validatePaymentAmount(venta: any, nuevoMonto: number): boolean {
  if (!venta?.data) return false;

  const total = venta.data.total || 0;
  const pagos = venta.data.payments || [];

  // suma de pagos realizados
  const sumaPagos = pagos.reduce((acc: number, p: any) => acc + (p.monto || 0), 0);

  // diferencia disponible
  const diferencia = total - sumaPagos;

  console.log('Total:', total, 'Pagos:', sumaPagos, 'Disponible:', diferencia);

  // el nuevo monto no puede ser mayor a la diferencia
  return nuevoMonto <= diferencia;
}

generarRecibo(venta: any) {
  const doc = new jsPDF();
  console.log('Generando recibo para la venta:', venta);

  // Encabezado
  doc.setFontSize(16);
  doc.text('Comprobante de Venta', 70, 15);

  // Datos generales
  doc.setFontSize(12);
  doc.text(`Venta No: ${venta.codigo}`, 15, 30);
  doc.text(`Cliente: ${this.vendedor || 'venta'}`, 15, 40);
  doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 15, 50);
  doc.text(`Estado: ${venta.status}`, 15, 60);

  // Tabla de artículos
  autoTable(doc, {
    startY: 70,
    head: [['Artículo', 'Cantidad', 'Precio Unitario', 'Subtotal']],
    body: venta.items.map((i: any) => [
      i.articulo,
      i.cantidad,
      `$${i.precio.toFixed(2)}`,
      `$${i.subtotal.toFixed(2)}`
    ])
  });

  // Total artículos
  const total = venta.items.reduce(
    (acc: number, i: any) => acc + i.subtotal,
    0
  );

  let finalY = (doc as any).lastAutoTable?.finalY || 70;
  doc.text(`Total: $${total.toFixed(2)}`, 150, finalY + 10);

  // === Tabla de pagos ===
  if (venta.pagos && venta.pagos.length > 0) {
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Fecha', 'Método', 'Monto']],
      body: venta.pagos.map((p: any) => [
        new Date(p.fecha).toLocaleDateString(),
        p.metodo,
        `$${p.monto.toFixed(2)}`
      ])
    });

    finalY = (doc as any).lastAutoTable?.finalY || finalY + 20;

    const totalPagos = venta.pagos.reduce(
      (acc: number, p: any) => acc + p.monto,
      0
    );

    doc.text(`Total Pagado: $${totalPagos.toFixed(2)}`, 150, finalY + 10);
    doc.text(`Saldo Pendiente: $${(total - totalPagos).toFixed(2)}`, 150, finalY + 20);
  }

   // === Pie de página con fecha y hora actual ===
  const ahora = new Date();
  const fechaHora = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaHora}`, pageWidth - 15, pageHeight - 10, { align: "right" });

  // Guardar PDF
  doc.save(`venta_${venta.codigo}.pdf`);
}

}
