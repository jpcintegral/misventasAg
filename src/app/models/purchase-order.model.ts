import { Articulo } from './articulo.model';
import { Proveedor } from './proveedor.model';

export interface PurchaseOrderItem {
articulo: Articulo;
cantidad: number;
subtotal: number;
}


export interface PurchaseOrder {
id: number;
proveedor: Proveedor;
items: PurchaseOrderItem[];
total: number;
estado: 'pendiente' | 'abonado' | 'pagado';
}