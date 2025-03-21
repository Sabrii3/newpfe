import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { app } from '../../firebase-config';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private auth = getAuth(app);
  private currentUser: User | null = null;
  private userDetails:any;

  constructor(private userService: UserService) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentUser = user;
        this.userDetails = this.userService.getUserDetails();
        this.isAuthenticatedSubject.next(true);
      } else {
        this.currentUser = null;
        this.isAuthenticatedSubject.next(false);
      }
    });
  }

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
