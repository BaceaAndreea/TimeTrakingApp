import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatIcon} from '@angular/material/icon';


@Component({
    selector: 'app-root',
  imports: [RouterOutlet, MatIcon],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
  isDarkMode: boolean = false;

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }
}
