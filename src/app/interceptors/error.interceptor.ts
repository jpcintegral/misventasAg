import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let msg = 'Error en la API';

        console.error('❌ ErrorInterceptor atrapó:', error);

        // Manejo de errores según status y name
        if (error.status === 401) {
          // Token inválido o expirado
          msg = 'Sesión expirada. Inicia sesión nuevamente.';
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Sin permisos
          msg = 'No tienes permisos para realizar esta acción.';
        } else if (error.status === 400 && error.error?.error?.name === 'ValidationError') {
          // Credenciales incorrectas
          msg = 'Usuario o contraseña incorrecta';
        } else if (error.error?.message) {
          msg = error.error.message;
        } else if (error.statusText) {
          msg = error.statusText;
        }

        alert(msg);
        return throwError(() => error);
      })
    );
  }
}
