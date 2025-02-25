import { Component } from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';


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
  requestType = '';
  reason = '';
  startTime = '';
  endTime = '';

  dataSource = [
    { date: '2024-05-01', type: 'personal', reason: 'Vacation', startTime: '09:00', endTime: '12:00', status: 'Approved' },
    { date: '2024-06-10', type: 'medical', reason: 'Doctor appointment', startTime: '14:00', endTime: '16:00', status: 'Pending' }
  ];

  toggleRequestForm() {
    this.showRequestForm = !this.showRequestForm;
  }

  submitLeaveTicket() {
    if (!this.requestType || !this.reason || !this.startTime || !this.endTime) {
      alert("Please complete all fields.");
      return;
    }

    const newTicket = {
      date: new Date().toISOString().split('T')[0],
      status: "Pending",
      reason: this.reason,
      type: this.requestType,
      startTime: this.startTime, // Adăugăm ora de start
      endTime: this.endTime // Adăugăm ora de final
    };

    this.dataSource.push(newTicket);
    this.showRequestForm = false;
    this.requestType = '';
    this.reason = '';
    this.startTime = '';
    this.endTime = '';
  }

  goBack() {
    history.back();
  }
}
