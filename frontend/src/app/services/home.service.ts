import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private timeElapsedSubject = new BehaviorSubject<number>(0);
  private totalTimeSpentSubject = new BehaviorSubject<number>(0);
  private isRunningSubject = new BehaviorSubject<boolean>(false);
  private hourglassFillPercentageSubject = new BehaviorSubject<number>(0);

  private timer: any;
  private startTime: number = 0;
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  timeElapsed$: Observable<number> = this.timeElapsedSubject.asObservable();
  totalTimeSpent$: Observable<number> = this.totalTimeSpentSubject.asObservable();
  isRunning$: Observable<boolean> = this.isRunningSubject.asObservable();
  hourglassFillPercentage$: Observable<number> = this.hourglassFillPercentageSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {
    this.loadSavedTimes();
  }

  private async loadSavedTimes(): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.log('No user logged in');
      return;
    }

    try {
      // Get user's timer data from Firestore
      const userTimerDoc = doc(this.firestore, 'users', currentUser.uid);
      const docSnap = await getDoc(userTimerDoc);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data['currentTimer']) {
          this.timeElapsedSubject.next(data['currentTimer']);
          this.updateHourglassFill();
        }

        if (data['totalTimeSpent']) {
          this.totalTimeSpentSubject.next(data['totalTimeSpent']);
        }
      } else {
        console.log('No timer data found for user');
      }
    } catch (error) {
      console.error('Error loading saved times:', error);
      // Fallback to localStorage if Firestore fails
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): void {
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
      // Start timer
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
    const fillPercentage = Math.min(100, (this.timeElapsedSubject.value % 60) / 60 * 100);
    this.hourglassFillPercentageSubject.next(fillPercentage);
  }

  async saveTime(): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    try {
      // Save to Firestore
      const userTimerDoc = doc(this.firestore, 'users', currentUser.uid);
      await setDoc(userTimerDoc, {
        currentTimer: this.timeElapsedSubject.value,
        totalTimeSpent: this.totalTimeSpentSubject.value,
        lastUpdated: new Date()
      }, { merge: true });

      // Also save session to sessions collection for history tracking
      await addDoc(collection(this.firestore, 'users', currentUser.uid, 'sessions'), {
        duration: Math.floor((Date.now() - this.startTime) / 1000),
        timestamp: new Date(),
        totalAtTime: this.totalTimeSpentSubject.value
      });

      // Keep localStorage as backup
      localStorage.setItem('timer', this.timeElapsedSubject.value.toString());
      localStorage.setItem('totalTimeSpent', this.totalTimeSpentSubject.value.toString());

      this.snackBar.open('Timpul a fost salvat în cloud!', 'OK', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving to Firestore:', error);

      // Fallback to localStorage
      localStorage.setItem('timer', this.timeElapsedSubject.value.toString());
      localStorage.setItem('totalTimeSpent', this.totalTimeSpentSubject.value.toString());

      this.snackBar.open('Timpul a fost salvat local (offline)', 'OK', {
        duration: 3000,
      });
    }
  }

  async resetTimer(): Promise<void> {
    clearInterval(this.timer);
    this.timeElapsedSubject.next(0);
    this.isRunningSubject.next(false);
    this.updateHourglassFill();

    const currentUser = this.auth.currentUser;
    if (currentUser) {
      try {
        const userTimerDoc = doc(this.firestore, 'users', currentUser.uid);
        await setDoc(userTimerDoc, {
          currentTimer: 0,
          lastUpdated: new Date()
        }, { merge: true });
      } catch (error) {
        console.error('Error resetting timer in Firestore:', error);
      }
    }

    localStorage.removeItem('timer');
  }

  async resetTotalTime(): Promise<void> {
    this.totalTimeSpentSubject.next(0);

    const currentUser = this.auth.currentUser;
    if (currentUser) {
      try {
        const userTimerDoc = doc(this.firestore, 'users', currentUser.uid);
        await setDoc(userTimerDoc, {
          totalTimeSpent: 0,
          lastUpdated: new Date()
        }, { merge: true });
      } catch (error) {
        console.error('Error resetting total time in Firestore:', error);
      }
    }

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
