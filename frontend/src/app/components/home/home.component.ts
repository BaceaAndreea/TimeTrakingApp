import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Auth, user} from '@angular/fire/auth';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  user$: Observable<any>;
  timeElapsed: number = 0;
  timer: any;
  isRunning: boolean = false;


  constructor(private auth:Auth, private router: Router) {
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
    alert('Timpul a fost salvat cu succes!');
  }

  resetTimer() {
    clearInterval(this.timer);
    this.timeElapsed = 0;
    this.isRunning = false;
    localStorage.removeItem('timer');
  }

}
