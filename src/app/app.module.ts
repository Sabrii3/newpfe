import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SignComponent } from './components/sign/sign.component';
import { GererfichierComponent } from './components/gererfichier/gererfichier.component'; // Corrected import name
import { ChatComponent } from './components/chat/chat.component';
import { LoginComponent } from './components/login/login.component';
const routes: Routes = [
  { path: 'sign', component: SignComponent },
  { path: 'gererfichier', component: GererfichierComponent }, // Corrected name
  { path: '', redirectTo: '/chat', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    SignComponent,
    SidebarComponent,
    GererfichierComponent, // Corrected component name
    ChatComponent,
    LoginComponent,
    
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    CommonModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
