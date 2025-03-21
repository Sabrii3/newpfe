import { Component, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ChatResponse } from '../models/chatResponse';

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
  
  userDetails: any;
  fullName:any;
  isLoggedIn = false;
  userImage = 'assets/default-profile.png'; // Image par défaut

  constructor(
    private chatService: ChatService, 
    private authService: AuthService, 
    private router: Router,
    private userService: UserService
  ) {
  }
  ngOnInit() {
    this.userDetails = this.userService.getUserDetails();
    if (this.userDetails && this.userDetails.user && this.userDetails.user.length > 1) {
      this.fullName = this.userDetails.user[1]; // Retrieve the full name
    }
    console.log('User details in chat component:', this.userDetails);
    this.authService.isAuthenticated().subscribe((status) => {
      this.isLoggedIn = status;
      console.log('User logged in:', this.userDetails);
  }); 
  }
  
  sendMessage() {
    if (this.message.trim()) {
      this.messages.push(`You: ${this.message}`);
      this.saveOrUpdateConversation(); // Save or update conversation after sending a message
  
      this.chatService.askTravelBot(this.message).subscribe((response: ChatResponse) => {
        console.log('Response from travel bot:', response);
        if (typeof response.response === 'string') {
          this.messages.push(`Bot: ${response.response}`); // Handle string response
        } else if (typeof response.response === 'object') {
          this.messages.push(`Bot: ${JSON.stringify(response.response)}`); // Handle JSON object response
        }
        this.saveOrUpdateConversation(); // Save or update conversation after receiving a response
      }, error => {
        console.error('Error from travel bot:', error);
      });
      this.message = '';
    }
  }
  saveOrUpdateConversation() {
    const conversationData = {
      user_id: this.userDetails.user[0], // Assuming userDetails has an id property
      message: this.message,
      timestamp: new Date().toISOString()
    };
  
    this.chatService.getConversation(this.userDetails.user[0]).subscribe(conversation => {
      console.log('Conversation fetched successfully:', conversation);
      if (conversation.error) {
        this.chatService.saveConversation(conversationData).subscribe(response => {
          console.log('Conversation saved successfully:', response);
        }, error => {
          console.error('Error saving conversation:', error);
        });
      }
      else if (conversation.messages.length > 0) {
        this.chatService.updateConversation(this.userDetails.user[0], this.message).subscribe(response => {
          console.log('Conversation updated successfully:', response);
        }, error => {
          console.error('Error updating conversation:', error);
        });
      } 
    }, error => {
      console.error('Error fetching conversation:', error);
      this.chatService.saveConversation(conversationData).subscribe(response => {
        console.log('Conversation saved successfully:', response);
      }, error => {
        console.error('Error saving conversation:', error);
      });
    });
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  navigateToLogin() {
    this.router.navigate(['/login']); // 🔹 Redirection vers la page de connexion
  }
}
