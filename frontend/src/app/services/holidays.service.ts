import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { formatDate } from '@angular/common';

// holidays.service.ts
export interface RequestData {
  id: number;
  date: string;
  status: string;
  reason?: string;
}


@Injectable({
  providedIn: 'root'
})
export class HolidaysService {
  private totalDaysSubject = new BehaviorSubject<number>(21);
  private usedDaysSubject = new BehaviorSubject<number>(4);
  private remainingDaysSubject = new BehaviorSubject<number>(17);

  private requestsSubject = new BehaviorSubject<RequestData[]>([
    { id: 1, date: '2024-05-01', status: 'Approved', reason: 'Vacantion' },
    { id: 2, date: '2024-06-10', status: 'Pending', reason: 'Winter vacantion' }
  ]);


  totalDays$: Observable<number> = this.totalDaysSubject.asObservable();
  usedDays$: Observable<number> = this.usedDaysSubject.asObservable();
  remainingDays$: Observable<number> = this.remainingDaysSubject.asObservable();
  requests$: Observable<RequestData[]> = this.requestsSubject.asObservable();

  constructor() {
    this.updateRemainingDays();
  }

  private updateRemainingDays(): void {
    const remaining = this.totalDaysSubject.value - this.usedDaysSubject.value;
    this.remainingDaysSubject.next(remaining);
  }

  addVacationRequest(startDate: string, endDate: string, reason: string): void {
    if (!startDate || !endDate || !reason) {
      throw new Error('Please fill in all fields!');
    }

    let formattedStartDate = startDate;
    let formattedEndDate = endDate;

    try {
      // Try to create Date objects and format them
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (!isNaN(startDateObj.getTime())) {
        formattedStartDate = formatDate(startDateObj, 'yyyy-MM-dd', 'en-US');
      }

      if (!isNaN(endDateObj.getTime())) {
        formattedEndDate = formatDate(endDateObj, 'yyyy-MM-dd', 'en-US');
      }
    } catch (e) {
      console.error('Error formatting dates:', e);
    }

    // Generate new ID
    const currentRequests = this.requestsSubject.value;
    const newId = Math.max(0, ...currentRequests.map(r => r.id)) + 1;

    // Create new request object
    const newRequest: RequestData = {
      id: newId,
      date: `${formattedStartDate} - ${formattedEndDate}`,
      status: 'Pending'
    };

    // Add to our array of requests
    const updatedRequests = [...currentRequests, newRequest];
    this.requestsSubject.next(updatedRequests);

    // Increase used days
    const startDateObj = new Date(formattedStartDate);
    const endDateObj = new Date(formattedEndDate);
    const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newUsedDays = this.usedDaysSubject.value + daysDiff;
    this.usedDaysSubject.next(newUsedDays);
    this.updateRemainingDays();
  }

  deleteRequest(requestId: number): void {
    const currentRequests = this.requestsSubject.value;
    const requestToDelete = currentRequests.find(r => r.id === requestId);

    if (!requestToDelete) {
      return;
    }

    // Update the array of requests
    const updatedRequests = currentRequests.filter(r => r.id !== requestId);
    this.requestsSubject.next(updatedRequests);

    // If the request was not approved, update the usedDays count
    if (requestToDelete.status === 'Pending' || requestToDelete.status === 'Approved') {
      // Try to extract dates and calculate days
      try {
        const dateRange = requestToDelete.date.split(' - ');
        if (dateRange.length === 2) {
          const startDate = new Date(dateRange[0]);
          const endDate = new Date(dateRange[1]);
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          const newUsedDays = this.usedDaysSubject.value - daysDiff;
          this.usedDaysSubject.next(newUsedDays);
          this.updateRemainingDays();
        }
      } catch (e) {
        console.error('Error calculating days for deleted request:', e);
      }
    }
  }

  updateVacationRequest(id: number, startDate: string, endDate: string, reason: string): void {
    const reqs = this.requestsSubject.value.slice();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx < 0) return;

    // 1) Ajustează usedDays: scazi zilele vechi și adaugi zilele noi
    let used = this.usedDaysSubject.value;
    try {
      const [oldStart, oldEnd] = reqs[idx].date.split(' - ').map(d => new Date(d));
      const oldCount = Math.ceil((oldEnd.getTime() - oldStart.getTime())/(1000*60*60*24))+1;
      used -= oldCount;
    } catch {}

    try {
      const newS = new Date(startDate), newE = new Date(endDate);
      const newCount = Math.ceil((newE.getTime() - newS.getTime())/(1000*60*60*24))+1;
      used += newCount;
    } catch {}

    this.usedDaysSubject.next(used);
    this.updateRemainingDays();

    // 2) Actualizezi cererea
    reqs[idx] = {
      ...reqs[idx],
      date: `${startDate} - ${endDate}`,
      reason
    };
    this.requestsSubject.next(reqs);
  }

}
