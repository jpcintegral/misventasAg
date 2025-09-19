import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConnectableObservable } from 'rxjs';


@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule ],
  templateUrl: './proveedor-form.component.html',
  styleUrl: './proveedor-form.component.css'
})
export class ProveedorFormComponent implements OnInit {
  fb = inject(FormBuilder);
  api = inject(ApiService);
  snack = inject(MatSnackBar);
  route = inject(ActivatedRoute);
  router = inject(Router);

  form = this.fb.group({
    nombre: ['', Validators.required],
    telefono: [''],
    email: [''],
    direccion: ['']
  });

  editingId?: string;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if(params['id']){
        this.editingId = params['id'];
        console.log(params['id']);
        this.api.getProveedor(this.editingId!).subscribe((res: any) => {
          const p = res.data;
          if(p) this.form.patchValue({...p});
        });
      }
    });
  }

  save() {
    if(this.form.invalid) return;
    const data = this.form.value;
    if(this.editingId){
       console.log(this.editingId);
      this.api.updateProveedor(this.editingId, data).subscribe(() => {
        this.snack.open('Proveedor actualizado', 'ok',{duration:2000});
        this.router.navigate(['/proveedores']);
      });
    } else {
      this.api.createProveedor(data).subscribe(() => {
        this.snack.open('Proveedor creado', 'ok',{duration:2000});
        this.router.navigate(['/proveedores']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/proveedores']);
  }
}