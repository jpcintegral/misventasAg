import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
    private baseUrl = `${environment.urlBackend}/api`;
  private token = localStorage.getItem('token') || '';
  private tokenKey = 'token';
  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  /** ---------- LOGIN ---------- */
  login(email: string, password: string): Observable<any> {
    const payload = { identifier: email, password: password };
    return this.http.post(`${this.baseUrl}/auth/local`, payload);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
  }


  // ================= PROVEEDORES =================
  getProveedores(): Observable<any> {
    return this.http.get(`${this.baseUrl}/proveedors?populate=*` );
  }

  getProveedor(documentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/proveedors/${documentId}?populate=*` );
  }

  createProveedor(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/proveedors`, { data } );
  }

  updateProveedor(documentId: string, proveedor: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/proveedors/${documentId}`,
       {data:proveedor}  );
  }

  deleteProveedor(documentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/proveedors/${documentId}` );
  }

  // ================= ARTICULOS =================
  getArticulos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/articulos?populate=*`);
    //return this.http.get(`${this.baseUrl}/articulos?populate=proveedor&populate=seller_order_items.seller_order` );
 
  }
  
   // Nueva función: obtiene todos los artículos con stock
  getArticulosConStock(): Observable<any> {
    return this.http.get(`${this.baseUrl}/articulos/findWithStock` );
  }



  getArticulo(documentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/articulos/${documentId}?populate=*` );
  }

  createArticulo(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/articulos`, { data } );
  }

  updateArticulo(documentId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/articulos/${documentId}`, { data } );
  }

  deleteArticulo(documentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/articulos/${documentId}` );
  }

  // ================= VENDEDORES =================
  getVendedores(): Observable<any> {
    return this.http.get(`${this.baseUrl}/vendedors?populate=*` );
  }

  getVendedor(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/vendedors/${id}?populate=*` );
  }

  createVendedor(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/vendedors`, { data } );
  }

  updateVendedor(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/vendedors/${id}`, { data } );
  }

  deleteVendedor(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/vendedors/${id}` );
  }

  // ================= COMPRAS / PEDIDOS =================
  getOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/purchase-orders?populate=*` );
  }

  getOrder(documentId: string): Observable<any> {
  const url = `${this.baseUrl}/purchase-orders/${documentId}?populate=items.articulo&populate=proveedor&populate=payments.evidencia`;

  return this.http.get(url );
}


  createOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/purchase-orders`, data  );
  }

  updateOrder(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/purchase-orders/${id}`, { data } );
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/purchase-orders/${id}` );
  }

  // ================= VENTAS =================
  getSales(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales?populate=*` );
  }

  getSale(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales/${id}?populate=*` );
  }

  createSale(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sales`, { data } );
  }

  updateSale(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/sales/${id}`, { data } );
  }

  deleteSale(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sales/${id}` );
  }

  // ================= SURTIDO VENDEDORES =================
  getSellerOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/seller-orders?populate[vendedor]=true&populate[items][populate]=articulo` ); 
  }

  getSellerOrder(documentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/seller-orders/${documentId}?populate=items.articulo.imagen&populate=payments.evidencia` );
  }

  createSellerOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/seller-orders`, { data } );
  }

  updateSellerOrder(documentId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/seller-orders/${documentId}`, { data } );
  }

  deleteSellerOrder(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seller-orders/${id}` );
  }

    deleteSellerOrderFull(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seller-orders/${id}/deleteFull` );
  }

    cancelSellerOrderFull(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seller-orders/${id}/cancelOrder` );
  }

 updateSellerOrderStatus(documentId: string, status: string): Observable<any> {
  return this.http.put(
    `${this.baseUrl}/seller-orders/${documentId}`,
    { data: { status } },
    { headers: this.headers }
  );
}


   createSellerOrderItem(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/seller-order-items`, { data },{ headers: this.headers });
  }

 
  // ================= PAGOS / ABONOS =================
 createPayment(formData: FormData) {
   const headersPyment = new HttpHeaders({
       'Authorization': `Bearer ${this.token}` // solo autorización
  });
  return this.http.post(`${this.baseUrl}/payments`, formData, { headers: headersPyment });
}
  getPayments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments?populate=*` );
  }

  // Deuda de un proveedor por tipo de botella
  getDeudaProveedor(proveedorId: string) {
    return this.http.get(`${this.baseUrl}/deuda-proveedores/${proveedorId}` );
  }

  // Deuda de un vendedor por tipo de botella
  getDeudaVendedor(vendedorId: number) {
    return this.http.get(`${this.baseUrl}/deuda-vendedores/${vendedorId}` );
  }
  // ================= TOKEN =================
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = '';
    localStorage.removeItem('token');
  }

  createPurchaseItem(item: any) {
  return this.http.post(`${this.baseUrl}/purchase-items`, item );
}
getArticulosByProveedor(proveedorId: number) {
   return this.http.get(`${this.baseUrl}/articulos?filters[proveedor][id][$eq]=${proveedorId}&populate=*` );
}

// Actualizar estado del pedido
updateOrderStatus(documentId: string, data: any) {
  return this.http.put(`${this.baseUrl}/purchase-orders/${documentId}`, { data },{ headers: this.headers });
}

 uploadFile(formData: FormData) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.post(`${this.baseUrl}/upload`, formData, { headers });
  }

  //================== DASHBOARD =================

   getStock(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/stock`);
  }

  getPagosPendientes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/pagos-pendientes`,{ headers: this.headers });
  }

  getComprasPagas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/compras-pagas`,{ headers: this.headers });
  }

  getDeudaVendedores(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/deuda-vendedores`,{ headers: this.headers });
  }

  getVentasPagas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/ventas-pagas`,{ headers: this.headers });
  }

  getArticulosVendidos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/articulos-vendidos`,{ headers: this.headers });
  }

  getPorcentajeVentasArticulos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/articulos-ventas-porcentaje`,{ headers: this.headers });
  }

   getReporteVendedor(idVendedor : number ): Observable<any> {
    return this.http.get(`${this.baseUrl}/vendedors/${idVendedor}/comprobante-general` );
  }

   getReporteProveddor(idProveedor : number ): Observable<any> {
    return this.http.get(`${this.baseUrl}/proveedor/${idProveedor}/comprobante-general` );
  }
}
