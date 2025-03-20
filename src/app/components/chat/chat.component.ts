import { Component, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true, // 🔹 Ajoute standalone
  templateUrl: './chat.component.html',
  imports: [FormsModule, CommonModule, RouterModule], // 🔹 Assure-toi que les imports sont bons
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  message = '';
  messages: string[] = [];
  
  isLoggedIn = false;
  userImage = 'assets/default-profile.png'; // Image par défaut

  constructor(
    private chatService: ChatService, 
    private authService: AuthService, 
    private router: Router
  ) {
    this.authService.isAuthenticated().subscribe((status) => {
      this.isLoggedIn = status;
      if (status) {
        this.userImage = this.authService.getUserImage(); // 🔹 Récupérer l'image utilisateur si connecté
      }
    });
  }

  sendMessage() {
    if (this.message.trim()) {
      this.messages.push(`You: ${this.message}`);
      this.chatService.getResponse(this.message).then(response => {
        this.messages.push(`Bot: ${response}`);
      });
      this.message = '';
    }
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  navigateToLogin() {
    this.router.navigate(['/login']); // 🔹 Redirection vers la page de connexion
  }
}
