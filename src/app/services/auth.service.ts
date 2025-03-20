import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  isAuthenticated() {
    return this.isAuthenticatedSubject.asObservable();
  }

  login() {
    this.isAuthenticatedSubject.next(true);
  }

  signup() {
    console.log('Redirection vers Sign Up');
  }

  getUserImage() {
    return 'https://www.w3schools.com/howto/img_avatar.png'; // Image test
  }
}
