import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Location } from '@angular/common'; // 1. Location importieren
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit { // 2. AppComponent statt App

  constructor(private location: Location) {}

  ngOnInit() {
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        // Geht eine Seite in der Angular-Historie zurück
        this.location.back();
      } else {
        // Schließt die App nur, wenn keine vorherige Seite mehr existiert
        App.exitApp();
      }
    });
  } // 3. Klammer für ngOnInit() ergänzt
}
