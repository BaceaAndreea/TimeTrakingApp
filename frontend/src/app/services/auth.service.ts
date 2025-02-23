import {inject, Injectable} from '@angular/core';
import {Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  constructor( private router : Router) { }

  login(email: string, password: string) {
    console.log("Attempting login with:", email);

    return signInWithEmailAndPassword(this.auth, email, password)
      .then(userCredential => {
        console.log("Login successful:", userCredential);
        this.router.navigate(['/home']);  // 🔹 Redirecționează către home după login
      })
      .catch(error => {
        console.error("Login failed:", error.message);
      });
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }



  logout() {
    return signOut(this.auth).then(() => this.router.navigate(['/login']));
  }

  getUser(): Observable<User | null> {
    return new Observable(subscriber => {
      this.auth.onAuthStateChanged(subscriber);
    });
  }
}
