import {Component, OnInit, OnDestroy, inject} from '@angular/core';
import { NgClass, NgForOf, NgIf, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../services/navigation.service';
import { AuthService } from '../../services/auth.service';
import {LeaveTicket, UpToDateService} from '../../services/up-to-date.service';

@Component({
  selector: 'app-up-to-date',
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
    TitleCasePipe
  ],
  templateUrl: './up-to-date.component.html',
  styleUrl: './up-to-date.component.scss'
})
export class UpToDateComponent implements OnInit, OnDestroy {
  totalTickets: number = 10;
  usedTickets: number = 3;
  showRequestForm: boolean = false;
  requestType: string = 'personal';
  reason: string = '';
  startTime: string = '';
  endTime: string = '';

  // Keep a local copy for the template
  dataSource: LeaveTicket[] = [];

  private subscriptions: Subscription[] = [];


  private router            = inject(Router);
  private authService       = inject(AuthService);
  private navigationService = inject(NavigationService);
  private upToDateService   = inject(UpToDateService);

  ngOnInit() {
    // Subscribe to service data
    this.subscriptions.push(
      this.upToDateService.totalTickets$.subscribe(total => {
        this.totalTickets = total;
      })
    );

    this.subscriptions.push(
      this.upToDateService.usedTickets$.subscribe(used => {
        this.usedTickets = used;
      })
    );

    this.subscriptions.push(
      this.upToDateService.tickets$.subscribe(tickets => {
        this.dataSource = tickets;
      })
    );

    // Set active tab
    this.navigationService.setActiveTab('uptodate');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Navigation methods
  goToTrackingTime(): void {
    this.navigationService.setActiveTab('tracking');
    this.router.navigate(['/home']);
  }

  goToTickets(): void {
    this.navigationService.setActiveTab('tickets');
  }

  goToHolidays(): void {
    this.navigationService.setActiveTab('holidays');
  }

  toggleRequestForm(): void {
    this.showRequestForm = !this.showRequestForm;
    // Reset form fields when opening
    if (this.showRequestForm) {
      this.requestType = 'personal';
      this.reason = '';
      this.startTime = '';
      this.endTime = '';
    }
  }

  submitLeaveTicket(): void {
    try {
      this.upToDateService.addLeaveTicket(
        this.requestType,
        this.reason,
        this.startTime,
        this.endTime
      );

      // Reset form and close it
      this.showRequestForm = false;
    } catch (error) {
      alert(error);
    }
  }

  deleteTicket(index: number): void {
    this.upToDateService.deleteTicket(index);
  }

  // Fixed method name to match what's used in the template
  signOut(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error("Error during logout:", error);
    });
  }
}
