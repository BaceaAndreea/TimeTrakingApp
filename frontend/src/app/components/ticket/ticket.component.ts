import {Component, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {NgForOf} from '@angular/common';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';

interface WorkDay {
  date: string;
  hoursWorked: number;
  status: string;
}

@Component({
  selector: 'app-ticket',
  imports: [
    FormsModule,
    AngularFirestoreModule,
    ReactiveFormsModule,
    NgForOf
  ],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent  implements OnInit {
  searchControl = new FormControl('');
  statusFilter = new FormControl('');

  // Updated data with English status values
  workDays: WorkDay[] = [
    { date: '2025-03-01', hoursWorked: 8, status: 'approved' },
    { date: '2025-03-02', hoursWorked: 6, status: 'pending' },
    { date: '2025-03-03', hoursWorked: 5, status: 'rejected' },
  ];

  filteredWorkDays: WorkDay[] = [...this.workDays];
  sortAscending = true;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe(() => this.filterData());
    this.statusFilter.valueChanges.subscribe(() => this.filterData());
  }

  filterData(): void {
    let filtered = this.workDays;
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const statusTerm = this.statusFilter.value || '';

    if (searchTerm) {
      filtered = filtered.filter(day => day.date.includes(searchTerm));
    }
    if (statusTerm) {
      filtered = filtered.filter(day => day.status === statusTerm);
    }
    this.filteredWorkDays = filtered;
  }

  sortByDate(): void {
    this.filteredWorkDays.sort((a, b) =>
      this.sortAscending ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
    );
    this.sortAscending = !this.sortAscending;
  }

  // New navigation methods
  goToTrackingTime(): void {
    this.router.navigate(['/home']);
  }

  goToHolidays(): void {
    this.router.navigate(['/holidays']);
  }

  goToUpToDate(): void {
    this.router.navigate(['/up-to-date']);
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error("Error during logout:", error);
    });
  }
}
