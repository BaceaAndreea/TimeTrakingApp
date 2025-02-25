import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AngularFirestoreModule} from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-ticket',
  imports: [
    FormsModule,
    AngularFirestoreModule
  ],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent  {


}
