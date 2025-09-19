import { Articulo } from './articulo.model';

export interface Proveedor {
id: number;
nombre: string;
contacto: string;
telefono: string;
documentId: string
articulos?: Articulo[];
}