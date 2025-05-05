import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  // tip special de Subject care păstrează ultima valoare emisă și o retrimite oricărui subscriber nou.
  private timeElapsedSubject = new BehaviorSubject<number>(0);
  private totalTimeSpentSubject = new BehaviorSubject<number>(0);
  private isRunningSubject = new BehaviorSubject<boolean>(false);
  private hourglassFillPercentageSubject = new BehaviorSubject<number>(0);

  private timer: any;
  private startTime: number = 0;

  //doar un Observable (nu şi metode de next()), astfel încât componentele să poată asculta schimbările, fără să modifice direct valoarea.
  timeElapsed$: Observable<number> = this.timeElapsedSubject.asObservable();
  totalTimeSpent$: Observable<number> = this.totalTimeSpentSubject.asObservable();
  isRunning$: Observable<boolean> = this.isRunningSubject.asObservable();
  hourglassFillPercentage$: Observable<number> = this.hourglassFillPercentageSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {
    this.loadSavedTimes();
  }

  private loadSavedTimes(): void {
    const savedTime = localStorage.getItem('timer');
    const savedTotalTime = localStorage.getItem('totalTimeSpent');

    if (savedTime) {
      this.timeElapsedSubject.next(Number(savedTime));
      this.updateHourglassFill();
    }

    if (savedTotalTime) {
      this.totalTimeSpentSubject.next(Number(savedTotalTime));
    }
  }

  startStopTimer(): void {
    if (this.isRunningSubject.value) {
      clearInterval(this.timer);
      // Calculate session duration and add to total time spent
      const sessionDuration = Math.floor((Date.now() - this.startTime) / 1000);
      const currentTotal = this.totalTimeSpentSubject.value;
      this.totalTimeSpentSubject.next(currentTotal + sessionDuration);
      this.saveTime();
    } else {
      //start
      this.startTime = Date.now();
      this.timer = setInterval(() => {
        const currentTime = this.timeElapsedSubject.value;
        this.timeElapsedSubject.next(currentTime + 1);
        this.updateHourglassFill();
      }, 1000);
    }
    this.isRunningSubject.next(!this.isRunningSubject.value);
  }

  updateHourglassFill(): void {
    // Calculate fill percentage based on a 60-second cycle
    const fillPercentage = Math.min(100, (this.timeElapsedSubject.value % 60) / 60 * 100);
    this.hourglassFillPercentageSubject.next(fillPercentage);
  }

  saveTime(): void {
    localStorage.setItem('timer', this.timeElapsedSubject.value.toString());
    localStorage.setItem('totalTimeSpent', this.totalTimeSpentSubject.value.toString());
    this.snackBar.open('Timpul a fost salvat!', 'OK', {
      duration: 3000,
    });
  }

  resetTimer(): void {
    clearInterval(this.timer);
    this.timeElapsedSubject.next(0);
    this.isRunningSubject.next(false);
    this.updateHourglassFill();
    localStorage.removeItem('timer');
    // Keep total time spent intact unless explicitly asked to reset it
  }

  resetTotalTime(): void {
    this.totalTimeSpentSubject.next(0);
    localStorage.removeItem('totalTimeSpent');
    this.snackBar.open('Timpul total a fost resetat!', 'OK', {
      duration: 3000,
    });
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
