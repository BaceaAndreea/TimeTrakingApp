import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LeaveTicket {
  date: string;
  type: string;
  reason: string;
  startTime: string;
  endTime: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

@Injectable({
  providedIn: 'root'
})
export class UpToDateService {
  private totalTicketsSubject = new BehaviorSubject<number>(10);
  private usedTicketsSubject = new BehaviorSubject<number>(3);

  private ticketsSubject = new BehaviorSubject<LeaveTicket[]>([
    { date: '2024-05-01', type: 'personal', reason: 'Vacation', startTime: '09:00', endTime: '12:00', status: 'Approved' },
    { date: '2024-06-10', type: 'medical', reason: 'Doctor appointment', startTime: '14:00', endTime: '16:00', status: 'Pending' }
  ]);

  totalTickets$: Observable<number> = this.totalTicketsSubject.asObservable();
  usedTickets$: Observable<number> = this.usedTicketsSubject.asObservable();
  tickets$: Observable<LeaveTicket[]> = this.ticketsSubject.asObservable();

  constructor() {}

  getTickets(): LeaveTicket[] {
    return this.ticketsSubject.value;
  }

  addLeaveTicket(type: string, reason: string, startTime: string, endTime: string): void {
    if (!type || !reason || !startTime || !endTime) {
      throw new Error("Please complete all fields.");
    }

    const newTicket: LeaveTicket = {
      date: new Date().toISOString().split('T')[0],
      type: type,
      reason: reason,
      startTime: startTime,
      endTime: endTime,
      status: 'Pending'
    };

    const currentTickets = this.ticketsSubject.value;
    const updatedTickets = [...currentTickets, newTicket];
    this.ticketsSubject.next(updatedTickets);

    // Update used tickets count
    const newUsedTickets = this.usedTicketsSubject.value + 1;
    this.usedTicketsSubject.next(newUsedTickets);
  }

  deleteTicket(index: number): void {
    const currentTickets = this.ticketsSubject.value;

    if (index < 0 || index >= currentTickets.length) {
      return;
    }

    const ticket = currentTickets[index];
    const updatedTickets = [...currentTickets];
    updatedTickets.splice(index, 1);

    this.ticketsSubject.next(updatedTickets);

    // Update used tickets count if the ticket was approved
    if (ticket.status === 'Approved') {
      const newUsedTickets = this.usedTicketsSubject.value - 1;
      this.usedTicketsSubject.next(newUsedTickets);
    }
  }
}
