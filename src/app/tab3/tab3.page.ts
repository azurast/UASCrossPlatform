import {Component, OnInit} from '@angular/core';
import { UserService } from '../services/user/user.service';
import { User } from '../services/user/user';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  signedInUser: User;

  constructor(
      private userService: UserService,
      private auth: AngularFireAuth,
      private router: Router
  ) {}

  ngOnInit() {
    this.signedInUser = this.userService.signedInUser;
  }

  logOut() {
    this.auth.signOut().then(() => {
      this.userService.logOut();
      this.router.navigateByUrl('/authentication');
    });
  }

}
