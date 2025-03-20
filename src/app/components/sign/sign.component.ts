import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign',
  standalone: true,
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css'],
  imports: [RouterModule, CommonModule]
})
export class SignComponent {}
