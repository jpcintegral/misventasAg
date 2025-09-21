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
    return this.http.get(`${this.baseUrl}/proveedors?populate=*`, { headers: this.headers });
  }

  getProveedor(documentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/proveedors/${documentId}?populate=*`, { headers: this.headers });
  }

  createProveedor(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/proveedors`, { data }, { headers: this.headers });
  }

  updateProveedor(documentId: string, proveedor: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/proveedors/${documentId}`,
       {data:proveedor} , { headers: this.headers });
  }

  deleteProveedor(documentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/proveedors/${documentId}`, { headers: this.headers });
  }

  // ================= ARTICULOS =================
  getArticulos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/articulos?populate=*`, { headers: this.headers });
    //return this.http.get(`${this.baseUrl}/articulos?populate=proveedor&populate=seller_order_items.seller_order&&populate=*`, { headers: this.headers });
 
  }
  
   // Nueva función: obtiene todos los artículos con stock
  getArticulosConStock(): Observable<any> {
    return this.http.get(`${this.baseUrl}/articulos/findWithStock`, { headers: this.headers });
  }



  getArticulo(documentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/articulos/${documentId}?populate=*`, { headers: this.headers });
  }

  createArticulo(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/articulos`, { data }, { headers: this.headers });
  }

  updateArticulo(documentId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/articulos/${documentId}`, { data }, { headers: this.headers });
  }

  deleteArticulo(documentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/articulos/${documentId}`, { headers: this.headers });
  }

  // ================= VENDEDORES =================
  getVendedores(): Observable<any> {
    return this.http.get(`${this.baseUrl}/vendedors?populate=*`, { headers: this.headers });
  }

  getVendedor(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/vendedors/${id}?populate=*`, { headers: this.headers });
  }

  createVendedor(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/vendedors`, { data }, { headers: this.headers });
  }

  updateVendedor(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/vendedors/${id}`, { data }, { headers: this.headers });
  }

  deleteVendedor(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/vendedors/${id}`, { headers: this.headers });
  }

  // ================= COMPRAS / PEDIDOS =================
  getOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/purchase-orders?populate=*`, { headers: this.headers });
  }

  getOrder(documentId: string): Observable<any> {
  const url = `${this.baseUrl}/purchase-orders/${documentId}?populate=items.articulo&populate=proveedor&populate=payments.evidencia`;

  return this.http.get(url, { headers: this.headers });
}


  createOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/purchase-orders`, data , { headers: this.headers });
  }

  updateOrder(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/purchase-orders/${id}`, { data }, { headers: this.headers });
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/purchase-orders/${id}`, { headers: this.headers });
  }

  // ================= VENTAS =================
  getSales(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales?populate=*`, { headers: this.headers });
  }

  getSale(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales/${id}?populate=*`, { headers: this.headers });
  }

  createSale(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sales`, { data }, { headers: this.headers });
  }

  updateSale(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/sales/${id}`, { data }, { headers: this.headers });
  }

  deleteSale(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sales/${id}`, { headers: this.headers });
  }

  // ================= SURTIDO VENDEDORES =================
  getSellerOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/seller-orders?populate[vendedor]=true&populate[items][populate]=articulo`, { headers: this.headers }); 
  }

  getSellerOrder(documentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/seller-orders/${documentId}?populate=items.articulo.imagen&populate=payments.evidencia`, { headers: this.headers });
  }

  createSellerOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/seller-orders`, { data }, { headers: this.headers });
  }

  updateSellerOrder(documentId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/seller-orders/${documentId}`, { data }, { headers: this.headers });
  }

  deleteSellerOrder(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seller-orders/${id}`, { headers: this.headers });
  }

    deleteSellerOrderFull(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seller-orders/${id}/deleteFull`, { headers: this.headers });
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
    return this.http.get(`${this.baseUrl}/payments?populate=*`, { headers: this.headers });
  }

  // Deuda de un proveedor por tipo de botella
  getDeudaProveedor(proveedorId: string) {
    return this.http.get(`${this.baseUrl}/deuda-proveedores/${proveedorId}`, { headers: this.headers });
  }

  // Deuda de un vendedor por tipo de botella
  getDeudaVendedor(vendedorId: number) {
    return this.http.get(`${this.baseUrl}/deuda-vendedores/${vendedorId}`, { headers: this.headers });
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
  return this.http.post(`${this.baseUrl}/purchase-items`, item, { headers: this.headers });
}
getArticulosByProveedor(proveedorId: number) {
   return this.http.get(`${this.baseUrl}/articulos?filters[proveedor][id][$eq]=${proveedorId}&populate=*`, { headers: this.headers });
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

}
