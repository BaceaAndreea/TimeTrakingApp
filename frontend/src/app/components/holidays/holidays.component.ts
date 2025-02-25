import { Component } from '@angular/core';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {FormsModule} from '@angular/forms';
import {formatDate, NgIf} from '@angular/common';
import {MatNativeDateModule} from '@angular/material/core';

interface RequestData {
  id: number;
  date: string;
  status: string;
}

@Component({
  selector: 'app-holidays',
  imports: [
    MatProgressBar,
    MatButton,
    MatLabel,
    MatDatepickerInput,
    FormsModule,
    MatDatepickerToggle,
    MatDatepicker,
    MatFormField,
    MatInput,
    MatTable,
    MatHeaderCell,
    MatColumnDef,
    MatCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatCellDef,
    MatHeaderCellDef,
    NgIf,
    MatNativeDateModule
  ],
  templateUrl: './holidays.component.html',
  styleUrl: './holidays.component.scss'
})
export class HolidaysComponent {
  totalDays: number = 21;
  usedDays: number = 4;
  remainingDays: number = this.totalDays - this.usedDays;
  showRequestForm: boolean = false;
  startDate!: string;
  endDate!: string;
  reason!: string;

  displayedColumns: string[] = ['date', 'status', 'actions'];
  dataSource = new MatTableDataSource<RequestData>([
    { id: 1, date: '2024-05-01', status: 'Approved' },
    { id: 2, date: '2024-06-10', status: 'Pending' }
  ]);

  constructor() {}

  goBack() {
    history.back();
  }

  toggleRequestForm() {
    this.showRequestForm = !this.showRequestForm;
  }

  submitVacationRequest() {
    if (!this.startDate || !this.endDate || !this.reason) {
      alert('Please fill in all fields!');
      return;
    }

    const formattedStartDate = formatDate(this.startDate, 'yyyy-MM-dd', 'en-US');
    const formattedEndDate = formatDate(this.endDate, 'yyyy-MM-dd', 'en-US');

    const newRequest: RequestData = {
      id: this.dataSource.data.length + 1,
      date: `${formattedStartDate} - ${formattedEndDate}`,  // Data formatată
      status: 'Pending'
    };

    this.dataSource.data = [...this.dataSource.data, newRequest];
    this.showRequestForm = false;
  }

  deleteRequest(request: RequestData) {
    this.dataSource.data = this.dataSource.data.filter(r => r.id !== request.id);
  }

}
