import {Component, OnInit} from '@angular/core';
import {
  MatTableDataSource
} from '@angular/material/table';
import {FormsModule} from '@angular/forms';
import {formatDate, NgForOf, NgIf} from '@angular/common';
import {MatNativeDateModule} from '@angular/material/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

interface RequestData {
  id: number;
  date: string;
  status: string;
}

@Component({
  selector: 'app-holidays',
  imports: [
    FormsModule,
    NgIf,
    MatNativeDateModule,
    NgForOf
  ],
  templateUrl: './holidays.component.html',
  styleUrl: './holidays.component.scss'
})
export class HolidaysComponent implements OnInit {
  totalDays: number = 21;
  usedDays: number = 4;
  remainingDays: number = this.totalDays - this.usedDays;
  showRequestForm: boolean = false;
  startDate: string = '';
  endDate: string = '';
  reason: string = '';

  displayedColumns: string[] = ['date', 'status', 'actions'];
  requests: RequestData[] = [
    { id: 1, date: '2024-05-01', status: 'Approved' },
    { id: 2, date: '2024-06-10', status: 'Pending' }
  ];

  dataSource = new MatTableDataSource<RequestData>(this.requests);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Ensure dataSource is initialized with the requests array
    this.dataSource.data = this.requests;
    console.log('Initial data:', this.dataSource.data);
  }

  // Navigation methods
  goToTrackingTime(): void {
    this.router.navigate(['/home']);
  }

  goToTickets(): void {
    this.router.navigate(['/tickets']);
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

  toggleRequestForm() {
    this.showRequestForm = !this.showRequestForm;
  }

  submitVacationRequest() {
    if (!this.startDate || !this.endDate || !this.reason) {
      alert('Please fill in all fields!');
      return;
    }

    console.log('Submitting request with:', this.startDate, this.endDate, this.reason);

    // Format dates - handle both string and Date objects
    let formattedStartDate = this.startDate;
    let formattedEndDate = this.endDate;

    try {
      // Try to create Date objects and format them
      const startDateObj = new Date(this.startDate);
      const endDateObj = new Date(this.endDate);

      if (!isNaN(startDateObj.getTime())) {
        formattedStartDate = formatDate(startDateObj, 'yyyy-MM-dd', 'en-US');
      }

      if (!isNaN(endDateObj.getTime())) {
        formattedEndDate = formatDate(endDateObj, 'yyyy-MM-dd', 'en-US');
      }
    } catch (e) {
      console.error('Error formatting dates:', e);
      // Continue with the original values if there's an error
    }

    // Generate new ID
    const newId = Math.max(0, ...this.requests.map(r => r.id)) + 1;

    // Create new request object
    const newRequest: RequestData = {
      id: newId,
      date: `${formattedStartDate} - ${formattedEndDate}`,
      status: 'Pending'
    };

    console.log('New request object:', newRequest);

    // Add to our array of requests
    this.requests.push(newRequest);

    // Update the dataSource with the new array
    this.dataSource.data = [...this.requests];
    console.log('Updated data:', this.dataSource.data);

    // Hide the form
    this.showRequestForm = false;

    // Clear form
    this.startDate = '';
    this.endDate = '';
    this.reason = '';

    // Increase used days
    const startDate = new Date(formattedStartDate);
    const endDate = new Date(formattedEndDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    this.usedDays += daysDiff;
    this.remainingDays = this.totalDays - this.usedDays;
  }

  deleteRequest(request: RequestData) {
    // Remove from our array
    this.requests = this.requests.filter(r => r.id !== request.id);

    // Update the dataSource with the filtered array
    this.dataSource.data = [...this.requests];
    console.log('After delete:', this.dataSource.data);

    // If the request was not approved, update the usedDays count
    if (request.status === 'Pending' || request.status === 'Approved') {
      // Try to extract dates and calculate days
      try {
        const dateRange = request.date.split(' - ');
        if (dateRange.length === 2) {
          const startDate = new Date(dateRange[0]);
          const endDate = new Date(dateRange[1]);
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          this.usedDays -= daysDiff;
          this.remainingDays = this.totalDays - this.usedDays;
        }
      } catch (e) {
        console.error('Error calculating days for deleted request:', e);
      }
    }
  }
}
