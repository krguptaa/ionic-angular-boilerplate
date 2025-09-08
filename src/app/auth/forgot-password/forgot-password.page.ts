import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthLayoutComponent } from '../../auth-containers/auth-layout/auth-layout.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, AuthLayoutComponent]
})
export class ForgotPasswordPage implements OnInit {
  forgotForm: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
  }

  get email() {
    return this.forgotForm.get('email');
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      // TODO: Implement forgot password API call
      console.log('Forgot password for:', this.forgotForm.value.email);
      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        // Navigate to login or show success message
        this.router.navigate(['/auth/login']);
      }, 2000);
    }
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
