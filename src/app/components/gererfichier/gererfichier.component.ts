import { Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface File {
  id: number;
  name: string;
  type: string;
  size: number; // Changé de string à number
  dateAdded: Date;
  category: string; // Propriété category requise
  content: string;
}

interface Api {
  id: number;
  name: string;
  endpoint: string;
  method: string;
  apiKey?: string; // Ajouter le champ apiKey optionnel
}

interface Url {
  id: number;
  name: string;
  url: string;
}

@Component({
  selector: 'app-gererfichier',
  templateUrl: './gererfichier.component.html',
  styleUrls: ['./gererfichier.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default
})
export class GererfichierComponent implements OnInit {
  private fileReader: FileReader = new FileReader();
  private hasEditorChanges: boolean = false;
  files: File[] = [];
  filteredFiles: File[] = [];
  recentFiles: File[] = [];
  searchTerm: string = '';
  activeFileMenu: number | null = null;
  activeApiMenu: number | null = null;
  activeUrlMenu: number | null = null;
  allowedTypes = ['.json', '.csv', '.xml', '.pdf'];
  selectedFileIndex: number | null = null;
  errorMessage: string = '';
  showEditor: boolean = false;
  editingFile: File | null = null;
  editingContent: string = '';
  apis: Api[] = [];
  urls: Url[] = [];
  showError: boolean = false;
  errorDuration: number = 3000; // 3 secondes
  showPrompt: boolean = false;
  promptTitle: string = '';
  promptValue: string = '';
  promptCallback: ((value: string) => void) | null = null;

  // Données pour les statistiques
  statsData = {
    clientStats: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      data: [65, 78, 90, 85, 95, 110]
    },
    topClients: [
      { name: 'Client A', usage: 156 },
      { name: 'Client B', usage: 134 },
      { name: 'Client C', usage: 98 },
      { name: 'Client D', usage: 85 },
      { name: 'Client E', usage: 72 }
    ],
    mostUsedResources: {
      files: [
        { name: 'dataset.json', uses: 245 },
        { name: 'config.xml', uses: 189 },
        { name: 'data.csv', uses: 156 }
      ],
      apis: [
        { name: 'API Analytics', uses: 312 },
        { name: 'API Payment', uses: 278 },
        { name: 'API Auth', uses: 234 }
      ],
      urls: [
        { name: 'dashboard.com', uses: 423 },
        { name: 'analytics.com', uses: 367 },
        { name: 'reports.com', uses: 289 }
      ],
      destinations: [
        { name: 'Paris', mentions: 156 },
        { name: 'Tokyo', mentions: 134 },
        { name: 'London', mentions: 128 },
        { name: 'New York', mentions: 112 },
        { name: 'Dubai', mentions: 98 }
      ]
    }
  };

  currentBookings = [
    { destination: 'Paris, France', date: new Date('2024-02-15'), status: 'confirmé' },
    { destination: 'Tokyo, Japon', date: new Date('2024-02-18'), status: 'en attente' },
    { destination: 'New York, USA', date: new Date('2024-02-20'), status: 'confirmé' },
    { destination: 'Dubai, UAE', date: new Date('2024-02-22'), status: 'confirmé' },
    { destination: 'Londres, UK', date: new Date('2024-02-25'), status: 'en attente' }
  ];

  upcomingDepartures = [
    { destination: 'Bangkok, Thaïlande', date: new Date('2024-02-14'), places: 3 },
    { destination: 'Rome, Italie', date: new Date('2024-02-16'), places: 5 },
    { destination: 'Barcelona, Espagne', date: new Date('2024-02-19'), places: 2 },
    { destination: 'Istanbul, Turquie', date: new Date('2024-02-21'), places: 4 },
    { destination: 'Marrakech, Maroc', date: new Date('2024-02-24'), places: 6 }
  ];

  popularTimeSlots = [
    { period: 'Juillet - Août', count: 450 },
    { period: 'Décembre - Janvier', count: 380 },
    { period: 'Mars - Avril', count: 320 },
    { period: 'Mai - Juin', count: 280 },
    { period: 'Septembre - Octobre', count: 250 }
  ];

  constructor(private cdr: ChangeDetectorRef) {
    this.setupFileReader();
  }

  private setupFileReader() {
    this.fileReader.onload = () => {
      const content = this.fileReader.result as string;
      if (this.pendingFile) {
        const newFile: File = {
          id: this.files.length + 1,
          name: this.pendingFile.file.name,
          type: this.pendingFile.file.type,
          size: Number(this.pendingFile.file.size), // Convertir en nombre
          dateAdded: new Date(),
          content: content,
          category: 'default' // Ajouter une catégorie par défaut si nécessaire
        };
        
        this.files.push(newFile);
        this.recentFiles.push(newFile);
        this.filterFiles();
        this.pendingFile = null;
      }
    };
  }

  private pendingFile: {file: File, category: string} | null = null;

  ngOnInit() {
    this.filterFiles();
  }

  checkFileExists(fileName: string): boolean {
    return this.files.some(file => file.name.toLowerCase() === fileName.toLowerCase());
  }

  checkApiExists(apiKey: string): boolean {
    return this.apis.some(api => api.apiKey?.toLowerCase() === apiKey.toLowerCase());
  }

  checkUrlExists(urlName: string): boolean {
    return this.urls.some(url => url.name.toLowerCase() === urlName.toLowerCase());
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!this.isValidFileType(file)) {
      this.errorMessage = 'Type de fichier non valide. Seuls les fichiers .json, .csv, .xml, et .pdf sont acceptés.';
      return;
    }

    if (this.checkFileExists(file.name)) {
      this.errorMessage = 'Un fichier avec le même nom existe déjà.';
      return;
    }

    // Lecture du contenu du fichier
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const newFile: File = {
        id: this.files.length + 1,
        name: file.name,
        type: file.type,
        size: Number(file.size),
        dateAdded: new Date(),
        content: e.target?.result as string || '',
        category: 'default'
      };

      this.files.push(newFile);
      this.recentFiles.push(newFile);
      this.filterFiles();
    };

    fileReader.readAsText(file);
  }

  private isValidFileType(file: any): boolean {
    return this.allowedTypes.some(type => file.name.toLowerCase().endsWith(type));
  }

  private formatFileSize(bytes: number): string {
    const size = Number(bytes); // Assurer que bytes est un nombre
    if (isNaN(size)) return '0 bytes';
    
    if (size < 1024) return size + ' bytes';
    if (size < 1048576) return (size / 1024).toFixed(2) + ' KB';
    return (size / 1048576).toFixed(2) + ' MB';
  }

  formatDisplayFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  filterFiles(): void {
    if (!this.searchTerm) {
      this.filteredFiles = this.files;
      return;
    }
    this.filteredFiles = this.files.filter(file =>
      file.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleFileMenu(event: MouseEvent, index: number): void {
    event.stopPropagation();
    this.activeApiMenu = null;
    this.activeUrlMenu = null;
    this.activeFileMenu = this.activeFileMenu === index ? null : index;
  }

  toggleApiMenu(event: MouseEvent, index: number): void {
    event.stopPropagation();
    this.activeFileMenu = null;
    this.activeUrlMenu = null;
    this.activeApiMenu = this.activeApiMenu === index ? null : index;
  }

  toggleUrlMenu(event: MouseEvent, index: number): void {
    event.stopPropagation();
    this.activeFileMenu = null;
    this.activeApiMenu = null;
    this.activeUrlMenu = this.activeUrlMenu === index ? null : index;
  }

  closeAllMenus(): void {
    this.activeFileMenu = null;
    this.activeApiMenu = null;
    this.activeUrlMenu = null;
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const editor = target.closest('.file-editor');
    const menuBtn = target.closest('.menu-btn');
    const dropdownMenu = target.closest('.dropdown-menu');

    if (!editor && !menuBtn && !dropdownMenu && this.showEditor) {
      this.closeEditor();
    }

    if (!menuBtn && !dropdownMenu) {
      this.closeAllMenus();
    }
  }

  onEditorInput(event: any): void {
    this.editingContent = event.target.value;
    this.hasEditorChanges = true;
  }

  showDeleteConfirm: boolean = false;
  fileToDelete: File | null = null;

  deleteFile(index: number): void {
    this.fileToDelete = this.recentFiles[index];
    this.showDeleteConfirm = true;
    this.closeAllMenus();
  }

  confirmDelete(): void {
    if (this.fileToDelete) {
      const fileId = this.fileToDelete.id;
      const fileIndex = this.files.findIndex(f => f.id === fileId);
      
      if (fileIndex !== -1) {
        this.files.splice(fileIndex, 1);
        this.recentFiles = this.recentFiles.filter(f => f.id !== fileId);
        this.filterFiles();
      }
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.fileToDelete = null;
  }

  renameFile(index: number): void {
    const file = this.recentFiles[index];
    const newName = prompt('Nouveau nom du fichier:', file.name);
    if (newName?.trim()) {
      const fileId = file.id;
      const fileIndex = this.files.findIndex(f => f.id === fileId);
      
      if (fileIndex !== -1) {
        this.files[fileIndex].name = newName.trim();
        this.recentFiles[index].name = newName.trim();
        this.filterFiles();
      }
    }
    this.closeAllMenus();
  }

  selectFile(index: number) {
    this.selectedFileIndex = index;
  }

  getFileIcon(file: File | null): string {
    if (!file) return 'fa-file';
    
    if (file.name.endsWith('.json') || file.name.endsWith('.xml')) return 'fa-file-code';
    if (file.name.endsWith('.csv')) return 'fa-file-csv';
    if (file.name.endsWith('.pdf')) return 'fa-file-pdf';
    return 'fa-file';
  }

  toggleFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = this.allowedTypes.join(',');
    fileInput.onchange = (e) => this.onFileSelected(e);
    fileInput.click();
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.recentFiles = this.files.filter(file =>
      file.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  canEditFile(file: File): boolean {
    return file.name.endsWith('.json') || 
           file.name.endsWith('.csv') || 
           file.name.endsWith('.xml');
  }

  editFile(index: number): void {
    const file = this.recentFiles[index];
    if (!this.canEditFile(file)) return;

    this.editingFile = file;
    this.editingContent = file.content || '';
    this.showEditor = true;
    this.closeAllMenus();

    // Note: Suppression du code qui tente d'accéder à event qui n'est pas défini
    // Le contenu est déjà disponible dans file.content
  }

  saveFileChanges(): void {
    if (this.editingFile && this.editingContent) {
      this.editingFile.content = this.editingContent;
      this.editingFile.dateAdded = new Date();
      
      const fileIndex = this.files.findIndex(f => f.id === this.editingFile?.id);
      if (fileIndex !== -1) {
        this.files[fileIndex].content = this.editingContent;
        this.files[fileIndex].dateAdded = new Date();
      }
      
      alert('Modifications enregistrées avec succès !');
    }
  }

  closeEditor(): void {
    if (this.hasEditorChanges) {
      if (confirm('Voulez-vous enregistrer les modifications avant de fermer ?')) {
        this.saveFileChanges();
      }
      this.hasEditorChanges = false;
    }
    this.showEditor = false;
    this.editingFile = null;
    this.editingContent = '';
  }

  getEditorClass(file: File | null): string {
    if (!file) return '';
    
    if (file.name.toLowerCase().endsWith('.json')) return 'json-content';
    if (file.name.toLowerCase().endsWith('.csv')) return 'csv-content';
    if (file.name.toLowerCase().endsWith('.xml')) return 'xml-content';
    return '';
  }

  // Méthodes pour gérer les APIs
  addNewApi() {
    this.openPrompt("Nouvelle API Key", "", (apiKey) => {
      if (this.checkApiExists(apiKey)) {
        this.showErrorMessage('Cette API key existe déjà');
        return;
      }
      
      const newApi: Api = {
        id: this.apis.length + 1,
        name: `API ${this.apis.length + 1}`,
        apiKey: apiKey,
        endpoint: '',
        method: 'GET'
      };
      this.apis.unshift(newApi);
    });
  }

  editApi(index: number) {
    const api = this.apis[index];
    this.openEditModal("Modifier l'API Key", {
      apiKey: api.apiKey || ''
    }, (values) => {
      this.apis[index] = { ...api, ...values };
    });
  }

  deleteApi(index: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette API ?')) {
      this.apis.splice(index, 1);
    }
    this.closeAllMenus();
  }

  // Méthodes pour gérer les URLs
  editUrl(index: number) {
    const url = this.urls[index];
    this.openEditModal("Modifier l'URL", {
      url: url.url,
      name: url.name
    }, (values) => {
      if (!values.url) {
        this.showErrorMessage('L\'URL ne peut pas être vide');
        return;
      }

      try {
        // Vérifier si l'URL est valide
        const urlObj = new URL(values.url);
        // Si le nom n'a pas été modifié, utiliser le nom de domaine
        if (values.name === url.name) {
          values.name = urlObj.hostname.replace('www.', '');
        }
        
        if (values.name !== url.name && this.checkUrlExists(values.name)) {
          this.showErrorMessage('Une URL avec ce nom existe déjà');
          return;
        }

        this.urls[index] = { ...url, ...values };
      } catch (e) {
        this.showErrorMessage('URL invalide. Veuillez entrer une URL valide');
      }
    });
  }

  deleteUrl(index: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette URL ?')) {
      this.urls.splice(index, 1);
    }
    this.closeAllMenus();
  }

  addNewUrl() {
    this.openEditModal("Nouvelle URL", {
      url: '',
      name: ''
    }, (values) => {
      if (!values.url) {
        this.showErrorMessage('L\'URL ne peut pas être vide');
        return;
      }

      try {
        // Extraire le nom du domaine de l'URL
        const urlObj = new URL(values.url);
        const suggestedName = urlObj.hostname.replace('www.', '');
        
        values.name = values.name || suggestedName;

        if (this.checkUrlExists(values.name)) {
          this.showErrorMessage('Une URL avec ce nom existe déjà');
          return;
        }

        const newUrl: Url = {
          id: this.urls.length + 1,
          name: values.name,
          url: values.url
        };
        this.urls.unshift(newUrl);
      } catch (e) {
        this.showErrorMessage('URL invalide. Veuillez entrer une URL valide');
      }
    });
  }

  showEditModal = false;
  editModalTitle = '';
  editModalFields: any = {};
  editModalCallback: ((values: any) => void) | null = null;

  private openEditModal(title: string, fields: any, callback: (values: any) => void) {
    this.editModalTitle = title;
    this.editModalFields = { ...fields };
    this.editModalCallback = callback;
    this.showEditModal = true;
  }

  confirmEdit() {
    if (this.editModalCallback) {
      this.editModalCallback(this.editModalFields);
    }
    this.closeEditModal();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editModalFields = {};
    this.editModalCallback = null;
  }

  private showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
      this.errorMessage = '';
    }, this.errorDuration);
  }

  private openPrompt(title: string, defaultValue: string = '', callback: (value: string) => void) {
    this.promptTitle = title;
    this.promptValue = defaultValue;
    this.promptCallback = callback;
    this.showPrompt = true;
  }

  confirmPrompt() {
    if (this.promptCallback && this.promptValue.trim()) {
      this.promptCallback(this.promptValue.trim());
    }
    this.closePrompt();
  }

  closePrompt() {
    this.showPrompt = false;
    this.promptValue = '';
    this.promptCallback = null;
  }

  onUrlInputChange(urlInput: string) {
    try {
      const urlObj = new URL(urlInput);
      // Ne mettre à jour le nom que s'il n'a pas été modifié manuellement
      if (!this.editModalFields.name || this.editModalFields.name === '') {
        this.editModalFields.name = urlObj.hostname.replace('www.', '');
      }
    } catch (e) {
      // Ignorer les erreurs pendant la saisie
    }
  }

  autoUpdateName(event: any): void {
    const urlInput = event.target.value;
    if (!urlInput) return;

    try {
      const urlObj = new URL(urlInput);
      // Ne mettre à jour le nom que s'il n'a pas été modifié manuellement
      if (!this.editModalFields.name || this.editModalFields.name === '') {
        this.editModalFields.name = urlObj.hostname.replace('www.', '');
      }
    } catch (e) {
      // Ignorer les erreurs pendant la saisie
    }
  }

  logout() {
    // Ajouter la logique de déconnexion ici
    console.log('Déconnexion...');
  }

  getBarHeight(value: number): string {
    const maxValue = Math.max(...this.statsData.clientStats.data);
    return (value / maxValue * 100) + '%';
  }
}
