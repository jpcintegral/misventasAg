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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit {
  stock = new MatTableDataSource<any>([]);
  pagosPendientes = new MatTableDataSource<any>([]);
  deudaVendedores = new MatTableDataSource<any>([]);
  porcentajeVentas = new MatTableDataSource<any>([]);
  gananciaTotal: number = 0;
  gananciaMensual: any[] = [];
  pagosAProveedores: any[] = [];
  ventasPorVendedor: any[] = [];
  resumenGeneral: any = {};
  comprasPagas: any = {};
  ventasPagas: any = {};
  articulosVendidos: any = {};
  totalVendido: number = 0;

   // Totales
  totalStock = 0;
  totalPagosPendientes = 0;
  totalComprasPagas = 0;
  totalDeudaVendedores = 0;
  totalVentasPagas = 0;
  totalPorcentajeVendido = 0;
  totalGananciaMensual = 0;
  totalPagosAProveedores = 0;
  totalVentasPorVendedor = 0;
  totalGananciaVendedores = 0;

 

  displayedColumnsStock = ['articulo', 'proveedor', 'stock'];
  displayedColumnsPagosPendientes = ['proveedor', 'totalPendiente' ,'acciones'];
  displayedColumnsDeudaVendedores = ['vendedor', 'totalPendiente','acciones'];
  displayedColumnsPagosPendientesdoc = ['proveedor', 'totalPendiente'];
  displayedColumnsDeudaVendedoresdoc = ['vendedor', 'totalPendiente'];
  displayedColumnsPorcentaje = ['articulo', 'cantidad', 'porcentaje'];

  constructor(private reportesService: ApiService) {}

  ngOnInit(): void {
    this.cargarReportes();
      console.log(" this.deudaVendedores.data", this.deudaVendedores);
  }

  cargarReportes() {
    this.reportesService.getStock().subscribe(data => this.stock.data = data || []);
    this.reportesService.getPagosPendientes().subscribe(data => this.pagosPendientes.data = data || []);
    this.reportesService.getComprasPagas().subscribe(data => this.comprasPagas = data || {});
    this.reportesService.getDeudaVendedores().subscribe(data => this.deudaVendedores.data = data || []);
    this.reportesService.getVentasPagas().subscribe(data => this.ventasPagas = data || {});
    this.reportesService.getArticulosVendidos().subscribe(data => this.articulosVendidos = data || {});
    // NUEVOS ENDPOINTS
    this.reportesService.getGananciaTotal().subscribe(data => this.gananciaTotal = data?.totalGanancia || 0);
    this.reportesService.getGananciaMensual().subscribe(data => this.gananciaMensual = data || []);
    this.reportesService.getPagosAProveedores().subscribe(data => this.pagosAProveedores = data || []);
    this.reportesService.getVentasPorVendedor().subscribe(data => this.ventasPorVendedor = data || []);
    this.reportesService.getResumenGeneral().subscribe(data => this.resumenGeneral = data || {});

    
    this.reportesService.getPorcentajeVentasArticulos().subscribe(data => {
      if (data && data.porcentajeVentas) {
        this.porcentajeVentas.data = data.porcentajeVentas;
        this.totalVendido = data.totalVendido || data.porcentajeVentas.reduce((acc :any, cur:any) => acc + cur.cantidad, 0);
      } else {
        this.porcentajeVentas.data = [];
        this.totalVendido = 0;
      }
    });


    // totales

      this.reportesService.getStock().subscribe(data => {
      this.stock.data = data || [];
      this.totalStock = this.stock.data.reduce((a: number, b: any) => a + (b.stock || 0), 0);
    });

       this.reportesService.getPagosPendientes().subscribe(data => {
      this.pagosPendientes.data = data || [];
      this.totalPagosPendientes = this.pagosPendientes.data.reduce((a: number, b: any) => a + (b.totalPendiente || 0), 0);
    }); 
    

     this.reportesService.getComprasPagas().subscribe(data => {
      this.comprasPagas = data || {};
      this.totalComprasPagas = this.comprasPagas.totalPagado || 0;
    });

    this.reportesService.getDeudaVendedores().subscribe(data => {
      this.deudaVendedores.data = data || [];
      this.totalDeudaVendedores = this.deudaVendedores.data.reduce((a: number, b: any) => a + (b.deuda || 0), 0);
    });

    this.reportesService.getVentasPagas().subscribe(data => {
      this.ventasPagas = data || {};
      this.totalVentasPagas = this.ventasPagas.totalPagado || 0;
    });

    this.reportesService.getArticulosVendidos().subscribe(data => this.articulosVendidos = data || {});

    this.reportesService.getPorcentajeVentasArticulos().subscribe(data => {
      if (data && data.porcentajeVentas) {
        this.porcentajeVentas.data = data.porcentajeVentas;
        this.totalPorcentajeVendido = data.porcentajeVentas.reduce((a: number, b: any) => a + (b.cantidad || 0), 0);
      }
    });

    this.reportesService.getGananciaMensual().subscribe(data => {
      this.gananciaMensual = data || [];
      this.totalGananciaMensual = this.gananciaMensual.reduce((a: number, b: any) => a + (b.ganancia || 0), 0);
    });

    this.reportesService.getPagosAProveedores().subscribe(data => {
      this.pagosAProveedores = data || [];
      this.totalPagosAProveedores = this.pagosAProveedores.reduce((a: number, b: any) => a + (b.totalPagado || 0), 0);
    });

    this.reportesService.getVentasPorVendedor().subscribe(data => {
      this.ventasPorVendedor = data || [];
      this.totalVentasPorVendedor = this.ventasPorVendedor.reduce((a: number, b: any) => a + (b.totalVendido || 0), 0);
      this.totalGananciaVendedores = this.ventasPorVendedor.reduce((a: number, b: any) => a + (b.ganancia || 0), 0);
    });

    this.reportesService.getResumenGeneral().subscribe(data => this.resumenGeneral = data || {});
  


  }



exportPDF() {
  const doc = new jsPDF();
  let yOffset = 20;

  // === Encabezado principal ===
  doc.setFontSize(18);
  doc.text('Reportes de Ventas', 14, yOffset);
  yOffset += 10;

  // --- Resumen General al inicio ---
  if (this.resumenGeneral) {
    const resumenBody = [
      ['Ganancia Total', `$${this.resumenGeneral.gananciaTotal || 0}`],
      ['Total Ventas Pagas', `$${this.resumenGeneral.totalVentasPagas || 0}`],
      ['Total Compras Pagas', `$${this.resumenGeneral.totalComprasPagas || 0}`],
      ['Total Deuda Vendedores', `$${this.resumenGeneral.totalDeudaVendedores || 0}`],
      ['Total Pagos Pendientes Proveedores', `$${this.resumenGeneral.totalPagosPendientesProveedores || 0}`],
    ];

    doc.setFontSize(16);
    doc.text('Resumen General', 14, yOffset);
    yOffset += 6;

    autoTable(doc, {
      startY: yOffset,
      head: [['Concepto', 'Cantidad']],
      body: resumenBody,
      theme: 'grid',
      headStyles: { fillColor: [16, 144, 174], textColor: 255 },
      bodyStyles: { textColor: 135 },
      alternateRowStyles: { fillColor: [234, 234, 234] },
    });

    yOffset = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- Stock ---
  doc.setFontSize(14);
  doc.text('Stock de Artículos', 14, yOffset);
  yOffset += 6;
  doc.setFontSize(12);
  doc.text('Muestra la cantidad de artículos disponibles en inventario por proveedor.', 14, yOffset);
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
  doc.text('Pagos Pendientes a Proveedores', 14, yOffset);
  yOffset += 6;
  doc.setFontSize(12);
  doc.text('Muestra los pagos que aún se deben a cada proveedor.', 14, yOffset);
  yOffset += 6;

  autoTable(doc, {
    startY: yOffset,
    head: [this.displayedColumnsPagosPendientesdoc.map(c => c.toUpperCase())],
    body: this.pagosPendientes.data.map(item => [item.nombre, item.totalPendiente]),
    theme: 'grid',
    headStyles: { fillColor: [135, 135, 135] },
  });
  yOffset = (doc as any).lastAutoTable.finalY + 10;

  // --- Deuda Vendedores ---
  doc.text('Deuda de Vendedores', 14, yOffset);
  yOffset += 6;
  doc.setFontSize(12);
  doc.text('Refleja lo que cada vendedor aún debe al negocio por ventas realizadas.', 14, yOffset);
  yOffset += 6;

  const totalDeudaVendedores = this.deudaVendedores.data.reduce((acc: number, v: any) => acc + v.deuda, 0);
  const deudaVendedoresBody = this.deudaVendedores.data.map(item => [item.nombre, `$${item.deuda.toFixed(2)}`]);
  deudaVendedoresBody.push(['TOTAL', `$${totalDeudaVendedores.toFixed(2)}`]);

  autoTable(doc, {
    startY: yOffset,
    head: [this.displayedColumnsDeudaVendedoresdoc.map(c => c.toUpperCase())],
    body: deudaVendedoresBody,
    theme: 'grid',
    headStyles: { fillColor: [135, 135, 135] },
    footStyles: { fillColor: [200, 200, 200], textColor: 0 },
  });
  yOffset = (doc as any).lastAutoTable.finalY + 10;

  // --- Ventas Pagas ---
  doc.text('Ventas Pagas', 14, yOffset);
  yOffset += 6;
  doc.setFontSize(12);
  doc.text('Muestra las ventas que ya han sido pagadas por los clientes.', 14, yOffset);
  yOffset += 6;

  doc.text(`Total Pagado: $${this.ventasPagas.totalPagado?.toFixed(2) || 0}`, 14, yOffset);
  yOffset += 8;
  doc.text(`Artículos Más Vendidos: ${this.articulosVendidos.masVendido || '---'}`, 14, yOffset);
  yOffset += 6;
  doc.text(`Artículos Menos Vendidos: ${this.articulosVendidos.menosVendido || '---'}`, 14, yOffset);
  yOffset += 10;

  // --- Porcentaje Ventas ---
  doc.text(`Porcentaje Ventas (Total Vendido: ${this.totalVendido})`, 14, yOffset);
  yOffset += 6;
  doc.setFontSize(12);
  doc.text('Muestra el porcentaje de ventas de cada artículo respecto al total vendido.', 14, yOffset);
  yOffset += 6;

  autoTable(doc, {
    startY: yOffset,
    head: [this.displayedColumnsPorcentaje.map(c => c.toUpperCase())],
    body: this.porcentajeVentas.data.map(item => [item.articulo, item.cantidad, item.porcentaje]),
    theme: 'grid',
    headStyles: { fillColor: [135, 135, 135] },
  });
  yOffset = (doc as any).lastAutoTable.finalY + 10;

  // --- Ganancia Total ---
  doc.text(`Ganancia Total: $${this.resumenGeneral.gananciaTotal?.toFixed(2) || 0}`, 14, yOffset);
  yOffset += 10;

  // --- Ganancia Mensual ---
  doc.text('Ganancia Mensual', 14, yOffset);
  yOffset += 6;
  doc.setFontSize(12);
  doc.text('Muestra la ganancia obtenida por mes.', 14, yOffset);
  yOffset += 6;

  autoTable(doc, {
    startY: yOffset,
    head: [['Mes', 'Ganancia']],
    body: this.gananciaMensual.map(item => [item.mes, `$${item.ganancia.toFixed(2)}`]),
    theme: 'grid',
    headStyles: { fillColor: [16, 144, 174], textColor: 255 },
    bodyStyles: { textColor: 135 },
  });
  yOffset = (doc as any).lastAutoTable.finalY + 10;

  // --- Pagos a Proveedores ---
  doc.text('Pagos a Proveedores', 14, yOffset);
  yOffset += 6;
  doc.setFontSize(12);
  doc.text('Muestra los pagos realizados a proveedores.', 14, yOffset);
  yOffset += 6;

  autoTable(doc, {
    startY: yOffset,
    head: [['Proveedor', 'Total Pagado']],
    body: this.pagosAProveedores.map(item => [item.proveedor, `$${item.totalPagado.toFixed(2)}`]),
    theme: 'grid',
    headStyles: { fillColor: [16, 144, 174], textColor: 255 },
    bodyStyles: { textColor: 135 },
  });
  yOffset = (doc as any).lastAutoTable.finalY + 10;

  // --- Ventas por Vendedor ---
  doc.text('Ventas por Vendedor', 14, yOffset);
  yOffset += 6;
  doc.setFontSize(12);
  doc.text('Muestra las ventas realizadas por cada vendedor y la ganancia obtenida sobre esas ventas.', 14, yOffset);
  yOffset += 6;

  const totalVendidoVendedores = this.ventasPorVendedor.reduce((acc: number, v: any) => acc + v.totalVendido, 0);
  const totalGananciaVendedores = this.ventasPorVendedor.reduce((acc: number, v: any) => acc + v.ganancia, 0);

  const ventasVendedorBody = this.ventasPorVendedor.map(item => [
    item.vendedor,
    `$${item.totalVendido.toFixed(2)}`,
    `$${item.ganancia.toFixed(2)}`
  ]);

  ventasVendedorBody.push([
    'TOTAL',
    `$${totalVendidoVendedores.toFixed(2)}`,
    `$${totalGananciaVendedores.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: yOffset,
    head: [['Vendedor', 'Total Vendido', 'Ganancia']],
    body: ventasVendedorBody,
    theme: 'grid',
    headStyles: { fillColor: [16, 144, 174], textColor: 255 },
    bodyStyles: { textColor: 135 },
    footStyles: { fillColor: [135, 135, 135], textColor: 255 },
  });
  yOffset = (doc as any).lastAutoTable.finalY + 10;

  // === Pie de página con fecha y hora ===
  const ahora = new Date();
  const fechaHora = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaHora}`, pageWidth - 15, pageHeight - 10, { align: 'right' });

  // === Guardar PDF ===
  doc.save('reportes_completos.pdf');
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
