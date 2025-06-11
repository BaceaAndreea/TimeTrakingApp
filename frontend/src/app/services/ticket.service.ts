import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';

export interface WorkDay {
  id?: string;
  date: string;
  hoursWorked: number;
  status: 'approved' | 'pending' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // BehaviorSubjects to store state
  private workDaysSubject = new BehaviorSubject<WorkDay[]>([]);
  private searchTermSubject = new BehaviorSubject<string>('');
  private statusFilterSubject = new BehaviorSubject<string>('');
  private sortDirectionSubject = new BehaviorSubject<boolean>(true); // true = ascending
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Public Observables that components can subscribe to
  workDays$ = this.workDaysSubject.asObservable();
  searchTerm$ = this.searchTermSubject.asObservable();
  statusFilter$ = this.statusFilterSubject.asObservable();
  sortDirection$ = this.sortDirectionSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

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
        filtered = filtered.filter(day =>
          day.date.toLowerCase().includes(searchTerm.toLowerCase())
        );
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

  constructor() {}

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

  // Firestore methods
  async fetchWorkDays(): Promise<void> {
    // Wait for auth state to be ready
    const currentUser = await this.waitForAuth();
    if (!currentUser) {
      console.error('No user logged in after waiting');
      return;
    }

    console.log('Fetching work days for user:', currentUser.uid);
    this.loadingSubject.next(true);

    try {
      // Query work days for the current user
      const workDaysRef = collection(this.firestore, 'users', currentUser.uid, 'workDays');
      const q = query(workDaysRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      const workDays: WorkDay[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        workDays.push({
          id: doc.id,
          date: data['date'],
          hoursWorked: data['hoursWorked'],
          status: data['status'],
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate()
        });
      });

      console.log('Found work days:', workDays.length);
      this.workDaysSubject.next(workDays);

      // If no data exists, add some sample data
      if (workDays.length === 0) {
        console.log('No work days found, adding sample data...');
        await this.addSampleData();
        // Fetch again after adding sample data
        await this.fetchWorkDays();
        return;
      }

    } catch (error) {
      console.error('Error fetching work days:', error);
      // Fallback to sample data if Firestore fails
      this.loadSampleData();
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async addWorkDay(workDay: Omit<WorkDay, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const currentUser = await this.waitForAuth();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const workDaysRef = collection(this.firestore, 'users', currentUser.uid, 'workDays');
      const newWorkDay = {
        ...workDay,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(workDaysRef, newWorkDay);

      // Refresh the data
      await this.fetchWorkDays();
    } catch (error) {
      console.error('Error adding work day:', error);
      throw error;
    }
  }

  async updateWorkDay(id: string, updates: Partial<WorkDay>): Promise<void> {
    const currentUser = await this.waitForAuth();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const workDayRef = doc(this.firestore, 'users', currentUser.uid, 'workDays', id);
      await updateDoc(workDayRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      // Refresh the data
      await this.fetchWorkDays();
    } catch (error) {
      console.error('Error updating work day:', error);
      throw error;
    }
  }

  async deleteWorkDay(id: string): Promise<void> {
    const currentUser = await this.waitForAuth();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const workDayRef = doc(this.firestore, 'users', currentUser.uid, 'workDays', id);
      await deleteDoc(workDayRef);

      // Refresh the data
      await this.fetchWorkDays();
    } catch (error) {
      console.error('Error deleting work day:', error);
      throw error;
    }
  }

  // Helper method to wait for authentication
  private waitForAuth(): Promise<any> {
    return new Promise((resolve) => {
      if (this.auth.currentUser) {
        resolve(this.auth.currentUser);
      } else {
        const unsubscribe = this.auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      }
    });
  }

  // Helper method to add sample data for new users
  private async addSampleData(): Promise<void> {
    const sampleData: Omit<WorkDay, 'id' | 'createdAt' | 'updatedAt'>[] = [
      { date: '2025-03-01', hoursWorked: 8, status: 'approved' },
      { date: '2025-03-02', hoursWorked: 6, status: 'pending' },
      { date: '2025-03-03', hoursWorked: 5, status: 'rejected' },
      { date: '2025-06-10', hoursWorked: 7, status: 'approved' },
      { date: '2025-06-11', hoursWorked: 8, status: 'pending' }
    ];

    try {
      for (const workDay of sampleData) {
        await this.addWorkDay(workDay);
      }
    } catch (error) {
      console.error('Error adding sample data:', error);
    }
  }

  // Fallback method for offline/error scenarios
  private loadSampleData(): void {
    const sampleData: WorkDay[] = [
      { id: '1', date: '2025-03-01', hoursWorked: 8, status: 'approved' },
      { id: '2', date: '2025-03-02', hoursWorked: 6, status: 'pending' },
      { id: '3', date: '2025-03-03', hoursWorked: 5, status: 'rejected' }
    ];

    this.workDaysSubject.next(sampleData);
  }

  // Method to generate work day from timer data
  async createWorkDayFromTimer(date: string, hoursWorked: number): Promise<void> {
    await this.addWorkDay({
      date,
      hoursWorked: Math.round(hoursWorked * 100) / 100, // Round to 2 decimals
      status: 'pending'
    });
  }
}
