import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function maxPendienteValidator(abono: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!abono) return null;
    
    const total = abono.total || 0;
    const pagos = abono.payments || [];

    const sumaPagos = pagos.reduce((acc: number, p: any) => acc + (p.monto || 0), 0);
    const diferencia = total - sumaPagos;

    const value = control.value || 0;

    return value > diferencia
      ? { maxPendiente: { value, pendiente: diferencia } }
      : null;
  };
}
