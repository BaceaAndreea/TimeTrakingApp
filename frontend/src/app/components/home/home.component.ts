import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Auth, user} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';

@Component({
    selector: 'app-home',
    imports: [],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  user$: Observable<any>;
  timeElapsed: number = 0;
  timer: any;
  isRunning: boolean = false;


  constructor(private auth:Auth, private router: Router, private snackBar: MatSnackBar, private authService : AuthService) {
    this.user$ = user(auth);
  }

  ngOnInit(): void {
    const savedTime = localStorage.getItem('timer');
    if (savedTime) {
      this.timeElapsed = Number(savedTime);
    }
  }

  startStopTimer() {
    if (this.isRunning) {
      clearInterval(this.timer);
      this.saveTime();
    } else {
      this.timer = setInterval(() => {
        this.timeElapsed++;
      }, 1000);
    }
    this.isRunning = !this.isRunning;
  }

  saveTime() {
    localStorage.setItem('timer', this.timeElapsed.toString());
    this.snackBar.open('Timpul a fost salvat!', 'OK', {
      duration: 3000,
    });
  }

  resetTimer() {
    clearInterval(this.timer);
    this.timeElapsed = 0;
    this.isRunning = false;
    localStorage.removeItem('timer');
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error("Eroare la delogare:", error);
    });
  }

}
