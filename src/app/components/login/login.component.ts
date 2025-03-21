import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { browserSessionPersistence, getAuth, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { apiUrl, app } from '../../../firebase-config';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [RouterModule, CommonModule,ReactiveFormsModule,FormsModule]
})
export class LoginComponent {
  constructor(private router: Router,private http:HttpClient,private userService:UserService) { }
  applyForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });
  login() {
    const auth = getAuth(app);
    const email = this.applyForm.get('email')!.value;
    const password = this.applyForm.get('password')!.value;
    if (email && password) {
      setPersistence(auth, browserSessionPersistence)
        .then(() => {
          return signInWithEmailAndPassword(auth, email, password);
        })
        .then((userCredential) => {
          const user = userCredential.user;
          this.http.get(`${apiUrl}user?UID=${user.uid}`).subscribe((res) => {
            console.log('User details:', res);
            this.userService.setUserDetails(res); 
            this.router.navigate(['/chat']);
          });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert("Error logging in: " + errorMessage);
        });
    }
  }


}
