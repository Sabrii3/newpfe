import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule, FormsModule]
})
export class SidebarComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  conversations: string[] = ['Chat 1', 'Chat 2', 'Chat 3'];
  filteredConversations: string[] = this.conversations;
  isVisible: boolean = true;
  isCreatingNewChat: boolean = false;
  newChatName: string = '';
  searchTerm: string = '';
  activeMenu: number | null = null;
  isSearching: boolean = false; // Ajouter une variable pour suivre l'état de la recherche
  selectedFileIndex: number | null = null;

  toggleNewChat() {
    this.isCreatingNewChat = !this.isCreatingNewChat;
  }

  createNewChat() {
    const date = new Date();
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    const newChatName = `Chat du ${formattedDate}`;
    this.conversations.unshift(newChatName); // Ajouter au début de la liste
    this.filteredConversations = this.conversations;
    this.selectedFileIndex = 0; // Sélectionner le nouveau chat
    this.isCreatingNewChat = false; // Fermer le formulaire de création
  }

  deleteChat(index: number) {
    this.conversations.splice(index, 1);
    this.filteredConversations = this.conversations;
    this.activeMenu = null;
  }

  renameChat(index: number) {
    const newName = prompt('Enter new name for the chat:', this.conversations[index]);
    if (newName) {
      this.conversations[index] = newName;
      this.filteredConversations = this.conversations;
    }
    this.activeMenu = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Vérifier si le clic est en dehors du menu et du bouton menu
    const clickedElement = event.target as HTMLElement;
    const isMenuButton = clickedElement.closest('.menu-btn');
    const isDropdownMenu = clickedElement.closest('.dropdown-menu');
    
    // Si le clic n'est ni sur le menu ni sur le bouton menu, fermer le menu
    if (!isMenuButton && !isDropdownMenu) {
      this.activeMenu = null;
    }
  }

  toggleMenu(index: number) {
    event?.stopPropagation(); // Empêcher la propagation du clic
    this.activeMenu = this.activeMenu === index ? null : index;
  }

  searchChats() {
    this.isSearching = this.searchTerm.trim().length > 0; // Mettre à jour l'état de la recherche
    this.filteredConversations = this.conversations.filter(convo =>
      convo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectChat(chat: string) {
    this.searchTerm = chat;
    this.searchChats();
  }

  logout() {
    // Ajouter la logique de déconnexion ici
    console.log('User logged out');
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.searchChats(); // This will use the existing searchChats method
  }

  // Ajouter une méthode pour gérer la sélection
  selectFile(index: number) {
    this.selectedFileIndex = index;
  }
}