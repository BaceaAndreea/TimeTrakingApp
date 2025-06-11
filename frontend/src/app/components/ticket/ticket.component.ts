import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { NavigationService } from '../../services/navigation.service';
import { Subscription } from 'rxjs';
import { TicketService, WorkDay } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  statusFilter = new FormControl('');

  filteredWorkDays: WorkDay[] = [];
  sortAscending = true;
  loading = false;

  private subscriptions: Subscription[] = [];

  private ticketService     = inject(TicketService);
  private navigationService = inject(NavigationService);
  private router            = inject(Router);
  private authService       = inject(AuthService);
  private snackBar          = inject(MatSnackBar);

  ngOnInit(): void {
    // Wait for auth state to be ready before fetching data
    this.authService.getUser().subscribe(user => {
      if (user) {
        console.log('User authenticated, fetching work days...');
        this.ticketService.fetchWorkDays();
      }
    });

    // Subscribe to observables
    this.subscriptions.push(
      this.ticketService.filteredWorkDays$.subscribe(data => {
        this.filteredWorkDays = data;
      }),

      this.ticketService.sortDirection$.subscribe(direction => {
        this.sortAscending = direction;
      }),

      this.ticketService.loading$.subscribe(loading => {
        this.loading = loading;
      }),

      this.searchControl.valueChanges.subscribe(value => {
        this.ticketService.setSearchTerm(value || '');
      }),

      this.statusFilter.valueChanges.subscribe(value => {
        this.ticketService.setStatusFilter(value || '');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  sortByDate(): void {
    this.ticketService.toggleSortDirection();
  }

  onStatusChange(workDay: WorkDay, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as 'approved' | 'pending' | 'rejected';
    this.updateWorkDayStatus(workDay, newStatus);
  }

  async updateWorkDayStatus(workDay: WorkDay, newStatus: 'approved' | 'pending' | 'rejected'): Promise<void> {
    if (!workDay.id) return;

    try {
      await this.ticketService.updateWorkDay(workDay.id, { status: newStatus });
      this.snackBar.open(`Status updated to ${newStatus}`, 'OK', { duration: 3000 });
    } catch (error) {
      console.error('Error updating status:', error);
      this.snackBar.open('Error updating status', 'OK', { duration: 3000 });
    }
  }

  async deleteWorkDay(workDay: WorkDay): Promise<void> {
    if (!workDay.id) return;

    const confirmed = confirm(`Are you sure you want to delete the work day for ${workDay.date}?`);
    if (!confirmed) return;

    try {
      await this.ticketService.deleteWorkDay(workDay.id);
      this.snackBar.open('Work day deleted successfully', 'OK', { duration: 3000 });
    } catch (error) {
      console.error('Error deleting work day:', error);
      this.snackBar.open('Error deleting work day', 'OK', { duration: 3000 });
    }
  }

  goToTrackingTime(): void {
    this.navigationService.setActiveTab('tracking');
    this.router.navigate(['/home']);
  }

  goToHolidays(): void {
    this.navigationService.setActiveTab('holidays');
  }

  goToUpToDate(): void {
    this.navigationService.setActiveTab('uptodate');
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error("Error during logout:", error);
    });
  }
}
