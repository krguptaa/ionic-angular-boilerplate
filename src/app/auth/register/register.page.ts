import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ValidationUtils } from '../../utilities';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, SharedModule]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading = true;

      try {
        const { firstName, lastName, email, password } = this.registerForm.value;
        await this.authService.register({
          firstName,
          lastName,
          email,
          password
        }).toPromise();

        this.router.navigate(['/dashboard']);
      } catch (error) {
        // Error is already handled in the auth service
        console.error('Registration error:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
      this.toastService.showError('Please fill in all required fields correctly');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  // Form validation helpers
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }

  getFirstNameErrorMessage(): string {
    if (this.firstName?.hasError('required')) return 'First name is required';
    if (this.firstName?.hasError('minlength')) return 'First name must be at least 2 characters';
    if (this.firstName?.hasError('maxlength')) return 'First name cannot exceed 50 characters';
    return '';
  }

  getLastNameErrorMessage(): string {
    if (this.lastName?.hasError('required')) return 'Last name is required';
    if (this.lastName?.hasError('minlength')) return 'Last name must be at least 2 characters';
    if (this.lastName?.hasError('maxlength')) return 'Last name cannot exceed 50 characters';
    return '';
  }

  getEmailErrorMessage(): string {
    if (this.email?.hasError('required')) return 'Email is required';
    if (this.email?.hasError('email')) return 'Please enter a valid email address';
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.hasError('required')) return 'Password is required';
    if (this.password?.hasError('minlength')) return 'Password must be at least 8 characters';
    if (this.password?.hasError('passwordStrength')) return this.password?.getError('passwordStrength');
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.hasError('required')) return 'Please confirm your password';
    if (this.registerForm?.hasError('passwordMismatch')) return 'Passwords do not match';
    return '';
  }
}