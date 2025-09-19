import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  fb = inject(FormBuilder);
  api = inject(ApiService);
  snack = inject(MatSnackBar);
  router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  login() {
    if(this.form.invalid){
      this.snack.open('Por favor completa todos los campos','ok',{duration:2000});
      return;
    }

    const { email, password } = this.form.value;

    this.api.login(email!, password!).subscribe({
      next: (res:any)=>{
        // Guardar JWT y usuario en localStorage
        localStorage.setItem('token', res.jwt);
        localStorage.setItem('user', JSON.stringify(res.user));
         console.log(JSON.stringify(res.user));
        // Redirigir según tipo de usuario
        if(res.user.email === 'palex00726@gmail.com'){
          this.router.navigate(['/proveedores']);
        } else {
           console.log('Redirigiendo a /ventas/list');
          this.router.navigate(['/ventas']);
        }
      },
      error: (err)=>{
        console.error(err);
        this.snack.open('Usuario o contraseña incorrecta','ok',{duration:2000});
      }
    });
  }
}