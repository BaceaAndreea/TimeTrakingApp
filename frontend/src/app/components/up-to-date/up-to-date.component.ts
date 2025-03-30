import { Component } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';

interface LeaveTicket {
  date: string;
  type: string;
  reason: string;
  startTime: string;
  endTime: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

@Component({
  selector: 'app-up-to-date',
  imports: [
    NgIf,
    FormsModule,
    NgForOf
  ],
  templateUrl: './up-to-date.component.html',
  styleUrl: './up-to-date.component.scss'
})
export class UpToDateComponent {
  totalTickets = 10;
  usedTickets = 3;
  showRequestForm = false;
  requestType = 'personal';
  reason = '';
  startTime = '';
  endTime = '';

  dataSource: LeaveTicket[] = [
    { date: '2024-05-01', type: 'personal', reason: 'Vacation', startTime: '09:00', endTime: '12:00', status: 'Approved' },
    { date: '2024-06-10', type: 'medical', reason: 'Doctor appointment', startTime: '14:00', endTime: '16:00', status: 'Pending' }
  ];

  constructor(private router: Router) {}

  // Navigation methods
  goToTrackingTime(): void {
    this.router.navigate(['/tracking-time']);
  }

  goToTickets(): void {
    this.router.navigate(['/leave-tickets']);
  }

  goToHolidays(): void {
    this.router.navigate(['/holidays']);
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
    if (!this.requestType || !this.reason || !this.startTime || !this.endTime) {
      alert("Please complete all fields.");
      return;
    }

    const newTicket: LeaveTicket = {
      date: new Date().toISOString().split('T')[0],
      type: this.requestType,
      reason: this.reason,
      startTime: this.startTime,
      endTime: this.endTime,
      status: 'Pending'
    };

    this.dataSource.push(newTicket);
    this.usedTickets++;
    this.showRequestForm = false;
  }

  deleteTicket(index: number): void {
    const ticket = this.dataSource[index];
    if (ticket.status === 'Approved') {
      this.usedTickets--;
    }
    this.dataSource.splice(index, 1);
  }

  signOut(): void {
    // Clear any local storage or session data if needed
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
