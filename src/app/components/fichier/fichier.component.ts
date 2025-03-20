import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface File {
  id: number;
  name: string;
  type: string;
  size: string;
  dateAdded: Date;
}

@Component({
  selector: 'app-fichier',
  templateUrl: './fichier.component.html',
  styleUrls: ['./fichier.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FichierComponent {
  files: File[] = [];
  filteredFiles: File[] = [];
  searchTerm: string = '';
  activeMenu: number | null = null;
  allowedTypes = ['.json', '.csv', '.xml', '.pdf'];

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.isValidFileType(file)) {
      const newFile: File = {
        id: this.files.length + 1,
        name: file.name,
        type: file.type,
        size: this.formatFileSize(file.size),
        dateAdded: new Date()
      };
      this.files.push(newFile);
      this.filterFiles();
    }
  }

  private isValidFileType(file: any): boolean {
    return this.allowedTypes.some(type => file.name.toLowerCase().endsWith(type));
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
    this.filterFiles();
    this.activeMenu = null;
  }

  renameFile(index: number) {
    const newName = prompt('Nouveau nom du fichier:', this.files[index].name);
    if (newName?.trim()) {
      this.files[index].name = newName;
      this.filterFiles();
    }
    this.activeMenu = null;
  }

  filterFiles() {
    this.filteredFiles = this.files.filter(file =>
      file.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleMenu(index: number) {
    this.activeMenu = this.activeMenu === index ? null : index;
  }
}
