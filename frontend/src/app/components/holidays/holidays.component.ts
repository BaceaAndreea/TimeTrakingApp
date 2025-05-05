import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
  MatTableDataSource
} from '@angular/material/table';
import {FormsModule} from '@angular/forms';
import {formatDate, NgForOf, NgIf} from '@angular/common';
import {MatNativeDateModule} from '@angular/material/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs';
import {NavigationService} from '../../services/navigation.service';
import {HolidaysService, RequestData} from '../../services/holidays.service';


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
export class HolidaysComponent implements OnInit, OnDestroy {
  totalDays: number = 21;
  usedDays: number = 4;
  remainingDays: number = 17;
  requests: RequestData[] = []; // Added this property for template access

  showRequestForm: boolean = false;
  startDate: string = '';
  endDate: string = '';
  reason: string = '';

  displayedColumns: string[] = ['date', 'status', 'actions'];
  dataSource = new MatTableDataSource<RequestData>([]);

  private subscriptions: Subscription[] = [];
  editingRequestId: number | null = null;

  private router            = inject(Router);
  private authService       = inject(AuthService);
  private navigationService = inject(NavigationService);
  private holidaysService   = inject(HolidaysService);


  ngOnInit() {
    // Subscribe to service data
    this.subscriptions.push(
      this.holidaysService.totalDays$.subscribe(days => {
        this.totalDays = days;
      })
    );

    this.subscriptions.push(
      this.holidaysService.usedDays$.subscribe(days => {
        this.usedDays = days;
      })
    );

    this.subscriptions.push(
      this.holidaysService.remainingDays$.subscribe(days => {
        this.remainingDays = days;
      })
    );

    this.subscriptions.push(
      this.holidaysService.requests$.subscribe(requests => {
        this.requests = requests; // Update local property
        this.dataSource.data = requests;
      })
    );

    // Set active tab
    this.navigationService.setActiveTab('holidays');
  }

  ngOnDestroy() {
    // Clean up subscriptions
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

  toggleRequestForm() {
    this.showRequestForm = !this.showRequestForm;
  }

  submitVacationRequest() {
    if (!this.startDate || !this.endDate || !this.reason) {
      alert('Please fill in all fields!');
      return;
    }

    if (this.editingRequestId != null) {
      // sunt în modul edit
      this.holidaysService.updateVacationRequest(
        this.editingRequestId,
        this.startDate,
        this.endDate,
        this.reason
      );
    } else {
      this.holidaysService.addVacationRequest(
        this.startDate,
        this.endDate,
        this.reason
      );
    }

    // reset form
    this.cancelEdit();
  }


  deleteRequest(request: RequestData) {
    this.holidaysService.deleteRequest(request.id);
  }

  editRequest(request: RequestData) {
    this.editingRequestId = request.id;
    const [start, end] = request.date.split(' - ');
    this.startDate = start;
    this.endDate   = end || start;
    this.reason    = request.reason || '';
    this.showRequestForm = true;
  }

  cancelEdit() {
    this.editingRequestId = null;
    this.showRequestForm  = false;
    this.startDate = this.endDate = this.reason = '';
  }




}
