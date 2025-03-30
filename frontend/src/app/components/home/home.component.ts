import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Auth, user} from '@angular/fire/auth';
import {Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';
import {MatIconModule} from '@angular/material/icon';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-home',
  imports: [
    MatIconModule,
    NgIf
  ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  user$: Observable<any>;
  timeElapsed: number = 0;
  totalTimeSpent: number = 0;
  timer: any;
  isRunning: boolean = false;
  activeTab: string = 'tracking';
  hourglassFillPercentage: number = 0;
  startTime: number = 0;

  constructor(
    private auth: Auth,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.user$ = user(auth);
  }

  ngOnInit(): void {
    const savedTime = localStorage.getItem('timer');
    const savedTotalTime = localStorage.getItem('totalTimeSpent');

    if (savedTime) {
      this.timeElapsed = Number(savedTime);
      this.updateHourglassFill();
    }

    if (savedTotalTime) {
      this.totalTimeSpent = Number(savedTotalTime);
    }
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;

    if (tab !== 'tracking') {
      switch(tab) {
        case 'tickets':
          this.router.navigate(['/tickets']);
          break;
        case 'holidays':
          this.router.navigate(['/holidays']);
          break;
        case 'uptodate':
          this.router.navigate(['/up-to-date']);
          break;
      }
    }
  }

  startStopTimer() {
    if (this.isRunning) {
      clearInterval(this.timer);
      // Calculate session duration and add to total time spent
      const sessionDuration = Math.floor((Date.now() - this.startTime) / 1000);
      this.totalTimeSpent += sessionDuration;
      this.saveTime();
    } else {
      this.startTime = Date.now();
      this.timer = setInterval(() => {
        this.timeElapsed++;
      }, 1000);
    }
    this.isRunning = !this.isRunning;
  }

  updateHourglassFill() {
    // Calculate fill percentage based on a 60-second cycle
    this.hourglassFillPercentage = Math.min(100, (this.timeElapsed % 60) / 60 * 100);
  }

  saveTime() {
    localStorage.setItem('timer', this.timeElapsed.toString());
    localStorage.setItem('totalTimeSpent', this.totalTimeSpent.toString());
    this.snackBar.open('Timpul a fost salvat!', 'OK', {
      duration: 3000,
    });
  }

  resetTimer() {
    clearInterval(this.timer);
    this.timeElapsed = 0;
    this.isRunning = false;
    localStorage.removeItem('timer');
    // Keep total time spent intact unless explicitly asked to reset it
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error("Eroare la delogare:", error);
    });
  }

  resetTotalTime() {
    this.totalTimeSpent = 0;
    localStorage.removeItem('totalTimeSpent');
    this.snackBar.open('Timpul total a fost resetat!', 'OK', {
      duration: 3000,
    });
  }
}
