import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService } from './services/chat.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatComponent } from './components/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule,
    SidebarComponent,
    ChatComponent
  ],
  providers: [ChatService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'pfe';
  isSidebarVisible: boolean = true;
  isChatRoute = false;
  isLoginRoute = false;
  isSignRoute = false;
  isGererFichierRoute = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.url;
        this.isSignRoute = currentUrl.includes('sign');
        this.isLoginRoute = currentUrl.includes('login');
        this.isChatRoute = currentUrl.includes('chat');
        this.isGererFichierRoute = currentUrl.includes('gererfichier');
        
        // Cacher la sidebar sur les routes de login, sign-up et gererfichier
        this.isSidebarVisible = !(this.isSignRoute || this.isLoginRoute || this.isGererFichierRoute);
      }
    });
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}
