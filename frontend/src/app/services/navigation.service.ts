import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private activeTabSubject = new BehaviorSubject<string>('tracking');
  activeTab$: Observable<string> = this.activeTabSubject.asObservable();

  constructor(private router: Router) { }

  setActiveTab(tab: string): void {
    this.activeTabSubject.next(tab);

    if (tab !== 'tracking') {
      switch(tab) {
        case 'tickets':
          this.router.navigate(['/tickets']);
          break;
        case 'holidays':
          this.router.navigate(['/holidays']);
          break;
        case 'uptodate':
          this.router.navigate(['/up-to-date']);
          break;
      }
    }
  }
}
