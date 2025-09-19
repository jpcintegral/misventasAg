import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-vendedor-form',
  imports: [ CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule ],
  templateUrl: './vendedor-form.component.html',
  styleUrl: './vendedor-form.component.css'
})
export class VendedorFormComponent implements OnInit {
  fb = inject(FormBuilder);
  api = inject(ApiService);
  snack = inject(MatSnackBar);
  route = inject(ActivatedRoute);
  router = inject(Router);

  form = this.fb.group({
    nombre: ['', Validators.required],
    //precio: [0, Validators.required]
  });

  editingId?: number;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if(params['id']){
        this.editingId = +params['id'];
        this.api.getVendedor(this.editingId).subscribe((res: any) => {
          if(res?.data) this.form.patchValue(res.data);
        });
      }
    });
  }

  save() {
    if(this.form.invalid) return;
    const data = this.form.value;
    if(this.editingId){
      this.api.updateVendedor(this.editingId, data).subscribe(() => {
        this.snack.open('Vendedor actualizado', 'ok',{duration:2000});
        this.router.navigate(['/vendedores']);
      });
    } else {
      this.api.createVendedor(data).subscribe(() => {
        this.snack.open('Vendedor creado', 'ok',{duration:2000});
        this.router.navigate(['/vendedores']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/vendedores']);
  }
}
