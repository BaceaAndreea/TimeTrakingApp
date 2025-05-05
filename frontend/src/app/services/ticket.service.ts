import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest, map} from 'rxjs';

export interface WorkDay {
  date: string;
  hoursWorked: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private workDaysData: WorkDay[] = [
    { date: '2025-03-01', hoursWorked: 8, status: 'approved' },
    { date: '2025-03-02', hoursWorked: 6, status: 'pending' },
    { date: '2025-03-03', hoursWorked: 5, status: 'rejected' },
  ];

  // BehaviorSubjects to store state
  private workDaysSubject = new BehaviorSubject<WorkDay[]>(this.workDaysData);
  private searchTermSubject = new BehaviorSubject<string>('');
  private statusFilterSubject = new BehaviorSubject<string>('');
  private sortDirectionSubject = new BehaviorSubject<boolean>(true); // true = ascending

  // Public Observables that components can subscribe to
  workDays$ = this.workDaysSubject.asObservable();
  searchTerm$ = this.searchTermSubject.asObservable();
  statusFilter$ = this.statusFilterSubject.asObservable();
  sortDirection$ = this.sortDirectionSubject.asObservable();

  // Filtered work days based on search term and status filter
  filteredWorkDays$ = combineLatest([
    this.workDays$,
    this.searchTerm$,
    this.statusFilter$,
    this.sortDirection$
  ]).pipe(
    map(([workDays, searchTerm, statusFilter, sortAscending]) => {
      let filtered = [...workDays];

      // Apply filters
      if (searchTerm) {
        filtered = filtered.filter(day => day.date.toLowerCase().includes(searchTerm.toLowerCase()));
      }

      if (statusFilter) {
        filtered = filtered.filter(day => day.status === statusFilter);
      }

      // Apply sorting
      filtered.sort((a, b) =>
        sortAscending ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
      );

      return filtered;
    })
  );

  constructor() { }

  // Methods to update state
  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  setStatusFilter(status: string): void {
    this.statusFilterSubject.next(status);
  }

  toggleSortDirection(): void {
    this.sortDirectionSubject.next(!this.sortDirectionSubject.value);
  }

  // Method to fetch work days (would connect to a real API in production)
  fetchWorkDays(): void {
    this.workDaysSubject.next(this.workDaysData);
  }
}
