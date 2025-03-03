import {Component, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {NgForOf} from '@angular/common';
import {MatButton} from '@angular/material/button';

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
    NgForOf,
    MatButton
  ],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent  implements OnInit {
  searchControl = new FormControl('');
  statusFilter = new FormControl('');
  workDays: WorkDay[] = [
    { date: '2025-03-01', hoursWorked: 8, status: 'aprobat' },
    { date: '2025-03-02', hoursWorked: 6, status: 'în așteptare' },
    { date: '2025-03-03', hoursWorked: 5, status: 'respins' },
  ];
  filteredWorkDays: WorkDay[] = [...this.workDays];
  sortAscending = true;

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

  goBack() {
    history.back();
  }
}

