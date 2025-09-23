import { ApplicationConfig, provideZoneChangeDetection ,importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient,withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor} from  './interceptors/error.interceptor'


import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
        provideRouter(routes),
        provideHttpClient(),
        importProvidersFrom(BrowserAnimationsModule),
        provideHttpClient(withInterceptorsFromDi()), // 👈 necesario
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ]
};
