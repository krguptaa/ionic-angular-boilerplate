import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';

export interface ValidationRule {
  type: string;
  value?: any;
  message: string;
}

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true
    }
  ],
  standalone: false
})
export class CustomInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() type: InputType = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() maxlength: number | null = null;
  @Input() minlength: number | null = null;
  @Input() pattern: string | null = null;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step: number | null = null;
  @Input() autocomplete: string = 'off';
  @Input() inputmode: string = 'text';
  @Input() showPasswordToggle = false;
  @Input() clearable = false;
  @Input() validationRules: ValidationRule[] = [];

  @Output() valueChange = new EventEmitter<string>();
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();
  @Output() enter = new EventEmitter<string>();

  value = '';
  isPasswordVisible = false;
  isFocused = false;
  hasError = false;
  currentErrorMessage = '';

  private destroy$ = new Subject<void>();
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.updateInputMode();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value || '';
    this.validateInput();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Event handlers
  onInputChange(event: any): void {
    const value = event.target.value;
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
    this.validateInput();
  }

  onFocus(event: FocusEvent): void {
    this.isFocused = true;
    this.onTouched();
    this.focus.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.isFocused = false;
    this.validateInput();
    this.blur.emit(event);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.enter.emit(this.value);
    }
  }

  // Password visibility toggle
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  // Clear input
  clearInput(): void {
    this.value = '';
    this.onChange('');
    this.valueChange.emit('');
    this.validateInput();
  }

  // Get current input type (considering password visibility)
  getCurrentInputType(): string {
    if (this.type === 'password' && this.isPasswordVisible) {
      return 'text';
    }
    return this.type;
  }

  // Get password toggle icon
  getPasswordToggleIcon(): string {
    return this.isPasswordVisible ? 'eye-off-outline' : 'eye-outline';
  }

  // Validation
  private validateInput(): void {
    this.hasError = false;
    this.currentErrorMessage = '';

    // Required validation
    if (this.required && !this.value.trim()) {
      this.hasError = true;
      this.currentErrorMessage = `${this.label || 'This field'} is required`;
      return;
    }

    // Skip other validations if empty and not required
    if (!this.value.trim() && !this.required) {
      return;
    }

    // Type-specific validations
    switch (this.type) {
      case 'email':
        if (!this.isValidEmail(this.value)) {
          this.hasError = true;
          this.currentErrorMessage = 'Please enter a valid email address';
        }
        break;
      case 'url':
        if (!this.isValidUrl(this.value)) {
          this.hasError = true;
          this.currentErrorMessage = 'Please enter a valid URL';
        }
        break;
      case 'number':
        if (isNaN(Number(this.value))) {
          this.hasError = true;
          this.currentErrorMessage = 'Please enter a valid number';
        } else {
          const num = Number(this.value);
          if (this.min !== null && num < this.min) {
            this.hasError = true;
            this.currentErrorMessage = `Value must be at least ${this.min}`;
          } else if (this.max !== null && num > this.max) {
            this.hasError = true;
            this.currentErrorMessage = `Value must be at most ${this.max}`;
          }
        }
        break;
    }

    // Length validations
    if (this.minlength && this.value.length < this.minlength) {
      this.hasError = true;
      this.currentErrorMessage = `Minimum length is ${this.minlength} characters`;
    }

    if (this.maxlength && this.value.length > this.maxlength) {
      this.hasError = true;
      this.currentErrorMessage = `Maximum length is ${this.maxlength} characters`;
    }

    // Pattern validation
    if (this.pattern && !new RegExp(this.pattern).test(this.value)) {
      this.hasError = true;
      this.currentErrorMessage = 'Invalid format';
    }

    // Custom validation rules
    for (const rule of this.validationRules) {
      if (!this.validateRule(rule)) {
        this.hasError = true;
        this.currentErrorMessage = rule.message;
        break;
      }
    }

    // Use custom error message if provided
    if (this.hasError && this.errorMessage) {
      this.currentErrorMessage = this.errorMessage;
    }
  }

  private validateRule(rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'min':
        return Number(this.value) >= rule.value;
      case 'max':
        return Number(this.value) <= rule.value;
      case 'pattern':
        return new RegExp(rule.value).test(this.value);
      case 'custom':
        return rule.value(this.value);
      default:
        return true;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private updateInputMode(): void {
    switch (this.type) {
      case 'email':
        this.inputmode = 'email';
        break;
      case 'tel':
        this.inputmode = 'tel';
        break;
      case 'number':
        this.inputmode = 'numeric';
        break;
      case 'url':
        this.inputmode = 'url';
        break;
      case 'search':
        this.inputmode = 'search';
        break;
      default:
        this.inputmode = 'text';
    }
  }

  // Utility methods
  shouldShowPasswordToggle(): boolean {
    return this.type === 'password' && this.showPasswordToggle;
  }

  shouldShowClearButton(): boolean {
    return this.clearable && this.value.length > 0 && !this.disabled && !this.readonly;
  }

  getInputClasses(): string {
    let classes = 'custom-input';

    if (this.hasError) classes += ' error';
    if (this.isFocused) classes += ' focused';
    if (this.disabled) classes += ' disabled';
    if (this.readonly) classes += ' readonly';
    if (this.prefixIcon) classes += ' has-prefix';
    if (this.suffixIcon || this.shouldShowPasswordToggle() || this.shouldShowClearButton()) classes += ' has-suffix';

    return classes;
  }
}