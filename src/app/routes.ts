import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ChatComponent } from './components/chat/chat.component';
import { SignComponent } from './components/sign/sign.component';
import { GererfichierComponent } from './components/gererfichier/gererfichier.component'; // Corrected import name

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'sign', component: SignComponent },
  { path: 'gererfichier', component: GererfichierComponent } // Corrected component name
];
