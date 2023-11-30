import { Component } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  usuario = '';
  senha = '';
  loginInvalid = false;

  constructor(private login: LoginService, private router: Router) {}

  fazerLogin(): void {
    this.login.login(this.usuario, this.senha).subscribe(
      (response) => {
        if (response.auth == true) {
          this.login.autenticado = true;
          this.router.navigate(['/lista']);
        } 
      },
      (error) => {
        this.loginInvalid = true;
      }
    )
  }
}
