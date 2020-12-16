import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
})
export class AuthenticationPage implements OnInit {
  isLogin: boolean;
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
      private auth: AngularFireAuth,
      private router: Router,
      private alertCtrl: AlertController,
      private userService: UserService
  ) { }

  login(credentials) {
    this.auth.signInWithEmailAndPassword(credentials.email, credentials.password)
      .then((signedUser) => {
        this.router.navigateByUrl('tabs/tab2');
        this.userService.setLoggedInUser(signedUser.user.uid);
      },
        async error => {
          const alert = await this.alertCtrl.create({
            message: error.message,
            buttons: [{text: 'OK', role: 'cancel'}]
          });
          await alert.present();
        });
  }

  signUp(credentials) {
    this.auth.createUserWithEmailAndPassword(credentials.email, credentials.password)
      .then((signedUser) => {
        this.userService.createUser(signedUser.user, credentials.firstName, credentials.lastName);
        this.router.navigateByUrl('tabs/tab2');
      },
        async error => {
          const alert = await this.alertCtrl.create({
            message: error.message,
            buttons: [{text: 'OK', role: 'cancel'}]
          });
          await alert.present();
        });
  }

  toggleAuth() {
    this.isLogin = !this.isLogin;
  }

  ngOnInit() {
    this.isLogin = true;
    this.auth.onAuthStateChanged((signedUser) => {
      if (signedUser) {
        console.log('===signedUser', signedUser);
        this.userService.setLoggedInUser(signedUser.uid);
        this.router.navigateByUrl('tabs/tab2');
      }
    });
    this.loginForm = new FormGroup({
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: this.isLogin ? [Validators.required] : [],
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: this.isLogin ? [Validators.required] : [],
      }),
    });
    this.registerForm = new FormGroup({
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: this.isLogin ? [Validators.required] : [],
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: this.isLogin ? [Validators.required] : [],
      }),
      confirmPassword: new FormControl(null, {
        updateOn: 'blur',
        validators: this.isLogin ? [Validators.required] : [],
      }),
      firstName: new FormControl(null, {
        updateOn: 'blur',
        validators: this.isLogin ? [Validators.required] : [],
      }),
      lastName: new FormControl(null, {
        updateOn: 'blur',
        validators: this.isLogin ? [Validators.required] : [],
      }),
      agreement: new FormControl(null, {
        updateOn: 'blur',
        validators: this.isLogin ? [Validators.required] : [],
      }),
    });
  }

}
