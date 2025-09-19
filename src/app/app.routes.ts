import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { MenuComponent } from './components/menu/menu/menu.component';

// Proveedores
import { ProveedorListComponent } from './components/proveedor/proveedor-list.component';
import { ProveedorFormComponent } from './components/proveedor/proveedor-form.component';

// Artículos
import { ArticuloListComponent } from './components/articulo/articulo-list.component';
import { ArticuloFormComponent } from './components/articulo/articulo-form.component';

// Vendedores
import { VendedorListComponent } from './components/vendedor/vendedor-list.component';
import { VendedorFormComponent } from './components/vendedor/vendedor-form.component';

// Compras
import { CreateOrderComponent } from './components/compras/create-order.component';
import { OrderListComponent } from './components/compras/order-list.component';
import { OrderDetailComponent } from './components/compras/order-detail.component';

// Ventas
import { SaleFormComponent } from './components/ventas/sale-form.component';
import { SaleListComponent } from './components/ventas/sale-list.component';
 import { SaleDetailComponent } from './components/ventas/sale-detail.component';
// Surtido a vendedores
import { CreateSellerOrderComponent } from './components/surtido/create-seller-order.component';

// Reportes

import { DeudaVendedorComponent } from './components/reports/deudas-vendedor.component';
import { ReportesComponent } from './components/reportes/reportes.component';

// Guard
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Login fuera del layout
  { path: 'login', component: LoginComponent },

  // Área privada con menú
  {
    path: '',
    component: MenuComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'proveedores', component: ProveedorListComponent },
      { path: 'proveedores/new', component: ProveedorFormComponent },

      { path: 'articulos', component: ArticuloListComponent },
      { path: 'articulos/new', component: ArticuloFormComponent },

      { path: 'vendedores', component: VendedorListComponent },
      { path: 'vendedores/new', component: VendedorFormComponent },

      { path: 'compras/new', component: CreateOrderComponent },
      { path: 'compras', component: OrderListComponent },
      { path: 'compras/:id', component: OrderDetailComponent },

      { path: 'ventas/new', component: SaleFormComponent },
      { path: 'ventas', component: SaleListComponent },
      { path: 'ventas/:id', component: SaleDetailComponent },
      

      { path: 'surtido/new', component: CreateSellerOrderComponent },

      { path: 'reportes', component: ReportesComponent },
      { path: 'reportes/deuda-vendedor', component: DeudaVendedorComponent },

      // default → ventas
      { path: '', redirectTo: 'ventas', pathMatch: 'full' }
    ]
  },

  // Wildcard
  { path: '**', redirectTo: 'ventas' }
];
