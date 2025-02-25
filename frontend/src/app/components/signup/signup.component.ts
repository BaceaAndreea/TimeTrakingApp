import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';

@Component({
    selector: 'app-signup',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(7)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  submit() {
    if (this.signupForm.valid) {
      const { email, password } = this.signupForm.value;
      this.authService.register(email, password).then(() => {
        this.router.navigate(['/home']);
      }).catch(error => {
        console.error('Sign up failed:', error.message);
      });
    }
  }

}
