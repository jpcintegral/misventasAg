export interface Articulo {
id: number;
marca: string;
precio_proveedor: number;
precio_venta: number;
mililitros: number;
stock: number;
documentId: string;
proveedor: number; // FK
}