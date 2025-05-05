import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {NgForOf} from '@angular/common';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';
import {NavigationService} from '../../services/navigation.service';
import {Subscription} from 'rxjs';
import {TicketService} from '../../services/ticket.service';

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

  filteredWorkDays: WorkDay[] = [];
  sortAscending = true;

  private subscriptions: Subscription[] = [];

  private ticketService     = inject(TicketService);
  private navigationService = inject(NavigationService);
  private router            = inject(Router);
  private authService       = inject(AuthService);



  ngOnInit(): void {
    // Initialize data
    this.ticketService.fetchWorkDays();

    // Subscribe to the filtered work days
    this.subscriptions.push(
      this.ticketService.filteredWorkDays$.subscribe(data => {
        this.filteredWorkDays = data;
      }),

      this.ticketService.sortDirection$.subscribe(direction => {
        this.sortAscending = direction;
      }),

      this.searchControl.valueChanges.subscribe(value => {
        this.ticketService.setSearchTerm(value || '');
      }),

      this.statusFilter.valueChanges.subscribe(value => {
        this.ticketService.setStatusFilter(value || '');
      })
    );
  }

  sortByDate(): void {
    this.ticketService.toggleSortDirection();
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
