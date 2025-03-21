import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiUrl, app } from '../../../firebase-config';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sign',
  standalone: true,
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css'],
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class SignComponent {
  constructor(private router: Router, private http: HttpClient) { }
  applyForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    fullName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });
  signup() {
    if (this.applyForm.invalid) {
      return;
    }
    const auth = getAuth(app);
    const email = this.applyForm.get('email')!.value;
    const password = this.applyForm.get('password')!.value;
    const fullName = this.applyForm.get('fullName')!.value;
    if (email && password && fullName) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          let body = new FormData();
          const user = userCredential.user;
          body.append("UID", user.uid);
          body.append("fullName", fullName);
          this.http.post(apiUrl + "signup", body).subscribe((res) => {
            console.log(res);
            this.router.navigate(['/login']);
          });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert("Error creating user: " + errorMessage);
        });
    }
  }
}
