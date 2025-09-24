import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'


@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit {
  stock = new MatTableDataSource<any>([]);
  pagosPendientes = new MatTableDataSource<any>([]);
  deudaVendedores = new MatTableDataSource<any>([]);
  porcentajeVentas = new MatTableDataSource<any>([]);

  comprasPagas: any = {};
  ventasPagas: any = {};
  articulosVendidos: any = {};
  totalVendido: number = 0;

  displayedColumnsStock = ['articulo', 'proveedor', 'stock'];
  displayedColumnsPagosPendientes = ['proveedor', 'totalPendiente' ,'acciones'];
  displayedColumnsDeudaVendedores = ['vendedor', 'totalPendiente','acciones'];
  displayedColumnsPorcentaje = ['articulo', 'cantidad', 'porcentaje'];

  constructor(private reportesService: ApiService) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes() {
    this.reportesService.getStock().subscribe(data => this.stock.data = data || []);
    this.reportesService.getPagosPendientes().subscribe(data => this.pagosPendientes.data = data || []);
    this.reportesService.getComprasPagas().subscribe(data => this.comprasPagas = data || {});
    this.reportesService.getDeudaVendedores().subscribe(data => this.deudaVendedores.data = data || []);
    this.reportesService.getVentasPagas().subscribe(data => this.ventasPagas = data || {});
    this.reportesService.getArticulosVendidos().subscribe(data => this.articulosVendidos = data || {});
    
    this.reportesService.getPorcentajeVentasArticulos().subscribe(data => {
      if (data && data.porcentajeVentas) {
        this.porcentajeVentas.data = data.porcentajeVentas;
        this.totalVendido = data.totalVendido || data.porcentajeVentas.reduce((acc :any, cur:any) => acc + cur.cantidad, 0);
      } else {
        this.porcentajeVentas.data = [];
        this.totalVendido = 0;
      }
    });
  }

  exportPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Reportes de Ventas', 14, 22);

    let yOffset = 30;

    // --- Stock ---
    doc.setFontSize(14);
    doc.text('Stock de Artículos', 14, yOffset);
    yOffset += 6;
    autoTable(doc, {
      startY: yOffset,
      head: [this.displayedColumnsStock.map(c => c.toUpperCase())],
      body: this.stock.data.map(item => [item.articulo, item.proveedor, item.stock]),
      theme: 'grid',
      headStyles: { fillColor: [135, 135, 135] },
    });
    yOffset = (doc as any).lastAutoTable.finalY + 10;

    // --- Pagos Pendientes ---
    doc.text('Pagos Pendientes', 14, yOffset);
    yOffset += 6;
    autoTable(doc, {
      startY: yOffset,
      head: [this.displayedColumnsPagosPendientes.map(c => c.toUpperCase())],
      body: this.pagosPendientes.data.map(item => [item.proveedor, item.totalPendiente]),
      theme: 'grid',
      headStyles: { fillColor: [135, 135, 135] },
    });
    yOffset = (doc as any).lastAutoTable.finalY + 10;

    // --- Deuda Vendedores ---
    doc.text('Deuda Vendedores', 14, yOffset);
    yOffset += 6;
    autoTable(doc, {
      startY: yOffset,
      head: [this.displayedColumnsDeudaVendedores.map(c => c.toUpperCase())],
      body: this.deudaVendedores.data.map(item => [item.vendedor, item.deuda]),
      theme: 'grid',
      headStyles: { fillColor: [135, 135, 135] },
    });
    yOffset = (doc as any).lastAutoTable.finalY + 10;

    // --- Porcentaje Ventas ---
    doc.text(`Porcentaje Ventas (Total Vendido: ${this.totalVendido})`, 14, yOffset);
    yOffset += 6;
    autoTable(doc, {
      startY: yOffset,
      head: [this.displayedColumnsPorcentaje.map(c => c.toUpperCase())],
      body: this.porcentajeVentas.data.map(item => [item.articulo, item.cantidad, item.porcentaje]),
      theme: 'grid',
      headStyles: { fillColor: [135, 135, 135] },
    });

     // === Pie de página con fecha y hora de emisión ===
      const ahora = new Date();
      const fechaHora = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(10);
      doc.text(`Fecha de emisión: ${fechaHora}`, pageWidth - 15, pageHeight - 10, { align: "right" });

    doc.save('reportes.pdf');
  }



  generarReporte(idVendedor : number,nombreVendedor : string){
     this.reportesService.getReporteVendedor(idVendedor).subscribe(data => {
      if (data ) {
       this.generarReporteVendedor(data,nombreVendedor);
      
      }
    });
  }
  
generarReporteVendedor(reporte: any, vendedorNombre: string = '') {
  const doc = new jsPDF();

  // === Encabezado ===
  doc.setFontSize(16);
  doc.text('Reporte General de Vendedor', 60, 15);

  // Datos generales del vendedor
  doc.setFontSize(12);
  doc.text(`Vendedor ID: ${reporte.vendedorId}`, 15, 30);
  doc.text(`Nombre: ${vendedorNombre || '---'}`, 15, 40);
  doc.text(`Total Adeudo: $${reporte.totalAdeudo.toFixed(2)}`, 15, 50);

  let finalY = 60;

  // === Recorrer pedidos ===
  reporte.pedidos.forEach((pedido: any, index: number) => {
    doc.setFontSize(12);
    doc.text(`Pedido #${index + 1} - ${pedido.codigo}`, 15, finalY);

    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleDateString()}`, 15, finalY + 7);
    doc.text(`Estado: ${pedido.status}`, 80, finalY + 7);
    doc.text(`Total Pedido: $${pedido.totalPedido.toFixed(2)}`, 15, finalY + 14);
    doc.text(`Pagado: $${pedido.totalPagado.toFixed(2)}`, 80, finalY + 14);
    doc.text(`Adeudo: $${pedido.adeudo.toFixed(2)}`, 140, finalY + 14);

    // Tabla de artículos
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Artículo', 'Cantidad', 'Precio', 'Subtotal']],
      body: pedido.items.map((i: any) => [
        i.marca,
        i.cantidad,
        `$${i.precio.toFixed(2)}`,
        `$${i.subtotal.toFixed(2)}`
      ]),
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;

    // Tabla de pagos (si existen)
    if (pedido.payments && pedido.payments.length > 0) {
      autoTable(doc, {
        startY: finalY,
        head: [['Monto', 'Fecha']],
        body: pedido.payments.map((p: any) => [
          `$${p.monto.toFixed(2)}`,
          p.fecha ? new Date(p.fecha).toLocaleDateString() : '---',
        ]),
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      finalY += 10;
    }

    // Salto de página si es necesario
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }
  });

  // === Resumen final ===
  doc.setFontSize(14);
  doc.text(`TOTAL ADEUDO GENERAL: $${reporte.totalAdeudo.toFixed(2)}`, 15, finalY + 10);

  // === Pie de página con fecha y hora ===
  const ahora = new Date();
  const fechaHora = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaHora}`, pageWidth - 15, pageHeight - 10, {
    align: 'right',
  });

  // Guardar PDF
  doc.save(`reporte_vendedor_${reporte.vendedorId}.pdf`);
}




  generarReporteVenderor(idProvedor : number,nombreVendedor : string){
     this.reportesService.getReporteProveddor(idProvedor).subscribe(data => {
      if (data ) {
       this.generarReporteProveedor(data,nombreVendedor);      
      }
    });
  }
  generarReporteProveedor(reporte: any, proveedorNombre: string = '') {
  const doc = new jsPDF();
  console.log("reporte", reporte);

  // === Encabezado ===
  doc.setFontSize(16);
  doc.text('Reporte General de Proveedor', 60, 15);

  // Datos generales del proveedor
  doc.setFontSize(12);
  doc.text(`Proveedor ID: ${reporte.pedidos[0]?.proveedor?.id || '---'}`, 15, 30);
  doc.text(`Nombre: ${proveedorNombre || reporte.pedidos[0]?.proveedor?.nombre || '---'}`, 15, 40);
  doc.text(`Total Adeudo General: $${reporte.totales.totalAdeudoGeneral.toFixed(2)}`, 15, 50);
  doc.text(`Total Pagado General: $${reporte.totales.totalPagadoGeneral.toFixed(2)}`, 15, 58);
  doc.text(`Total General: $${reporte.totales.totalGeneral.toFixed(2)}`, 15, 66);

  let finalY = 75;

  // === Recorrer pedidos ===
  reporte.pedidos.forEach((pedido: any, index: number) => {
    // Encabezado del pedido
    doc.setFontSize(12);
    doc.text(`Pedido #${index + 1} - ${pedido.codigo}`, 15, finalY);

    // Detalles del pedido
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleDateString()}`, 15, finalY + 7);
    doc.text(`Estado: ${pedido.status}`, 80, finalY + 7);
    doc.text(`Total Pedido: $${pedido.total.toFixed(2)}`, 15, finalY + 14);
    doc.text(`Pagado: $${pedido.totalPagado.toFixed(2)}`, 80, finalY + 14);
    doc.text(`Adeudo: $${pedido.totalAdeudo.toFixed(2)}`, 140, finalY + 14);

    // Tabla de artículos
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Artículo', 'Cantidad', 'Precio', 'Subtotal']],
      body: pedido.items.map((i: any) => [
        i.articulo?.marca || '---',
        i.cantidad,
        `$${i.precio.toFixed(2)}`,
        `$${i.subtotal.toFixed(2)}`
      ]),
      //theme: 'grid',
      headStyles: { fillColor: [16, 144, 174], textColor: 255 }, // gris encabezado
      //bodyStyles: { textColor: 135 }, // texto gris
      alternateRowStyles: { fillColor: [234, 234, 234] } // gris claro alternado
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;

    // Tabla de pagos
    if (pedido.payments && pedido.payments.length > 0) {
      autoTable(doc, {
        startY: finalY,
        head: [['Monto', 'Fecha']],
        body: pedido.payments.map((p: any) => [
          `$${p.monto.toFixed(2)}`,
          p.fecha ? new Date(p.fecha).toLocaleDateString() : '---',
        ]),
        //theme: 'grid',
        headStyles: { fillColor: [16, 144, 174], textColor: 255 },
        bodyStyles: { textColor: 135 },
        alternateRowStyles: { fillColor: [234, 234, 234] }
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      finalY += 10;
    }

    // Salto de página
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }
  });

  // === Resumen final ===
  doc.setFontSize(14);
  doc.text(`TOTAL ADEUDO GENERAL: $${reporte.totales.totalAdeudoGeneral.toFixed(2)}`, 15, finalY + 10);
  doc.text(`TOTAL PAGADO GENERAL: $${reporte.totales.totalPagadoGeneral.toFixed(2)}`, 15, finalY + 18);
  doc.text(`TOTAL GENERAL: $${reporte.totales.totalGeneral.toFixed(2)}`, 15, finalY + 26);

  // === Pie de página ===
  const ahora = new Date();
  const fechaHora = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaHora}`, pageWidth - 15, pageHeight - 10, { align: 'right' });

  // Guardar PDF
  doc.save(`reporte_proveedor_${reporte.pedidos[0]?.proveedor?.id || 'sin_id'}.pdf`);
}


}
