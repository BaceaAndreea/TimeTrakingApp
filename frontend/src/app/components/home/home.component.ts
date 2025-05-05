import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Auth, user} from '@angular/fire/auth';
import {Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';
import {MatIconModule} from '@angular/material/icon';
import {NgIf} from '@angular/common';
import {HomeService} from '../../services/home.service';
import {NavigationService} from '../../services/navigation.service';

@Component({
    selector: 'app-home',
  imports: [
    MatIconModule,
    NgIf
  ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy{
  timeElapsed: number = 0;
  totalTimeSpent: number = 0;
  isRunning: boolean = false;
  activeTab: string = 'tracking';
  hourglassFillPercentage: number = 0;

  private subscriptions: Subscription[] = [];

  private auth              = inject(Auth);
  private router            = inject(Router);
  private authService       = inject(AuthService);
  private homeService       = inject(HomeService);
  private navigationService = inject(NavigationService);


  ngOnInit(): void {
    // Subscribe to observables from HomeService to get the timer values
    this.subscriptions.push(
      this.homeService.timeElapsed$.subscribe(time => this.timeElapsed = time),
      this.homeService.totalTimeSpent$.subscribe(total => this.totalTimeSpent = total),
      this.homeService.isRunning$.subscribe(running => this.isRunning = running),
      this.homeService.hourglassFillPercentage$.subscribe(fill => this.hourglassFillPercentage = fill)
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  formatTime(seconds: number): string {
    return this.homeService.formatTime(seconds);
  }

  setActiveTab(tab: string) {
    this.navigationService.setActiveTab(tab);
  }

  startStopTimer() {
    this.homeService.startStopTimer();
  }

  saveTime() {
    this.homeService.saveTime();
  }

  resetTimer() {
    this.homeService.resetTimer();
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error("Eroare la delogare:", error);
    });
  }

  resetTotalTime() {
    this.homeService.resetTotalTime();
  }
}
