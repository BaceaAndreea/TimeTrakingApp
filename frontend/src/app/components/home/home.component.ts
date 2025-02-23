import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Auth, user} from '@angular/fire/auth';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  user$: Observable<any>;

  constructor(private auth:Auth, private router: Router) {
    this.user$ = user(auth);
  }

  ngOnInit(): void {
    this.user$.subscribe(user => {
      console.log("User in home component:", user);
    });
  }

}
