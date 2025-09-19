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
  displayedColumnsPagosPendientes = ['proveedor', 'totalPendiente'];
  displayedColumnsDeudaVendedores = ['vendedor', 'totalPendiente'];
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
}
