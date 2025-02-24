import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AsyncPipe, DatePipe, NgForOf} from '@angular/common';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreModule} from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-ticket',
  imports: [
    FormsModule,
    NgForOf,
    AsyncPipe,
    DatePipe,
    AngularFirestoreModule
  ],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  tickets$: Observable<any[]> = new Observable();

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.getTickets();
  }

  getTickets() {
    this.firestore.collection('workedDays/mzJej1UKxXjPTbo9zkiW/workedDays').valueChanges()
      .subscribe(data => {
        console.log("🔥 Datele corecte din Firestore:", data);
        this.tickets$ = new Observable(observer => observer.next(data));
      });
  }


}
