import {Component, OnInit} from '@angular/core';
import { UserService } from '../services/user/user.service';
import { User } from '../services/user/user';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Location } from '../services/user/location';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  signedInUser: User;
  history: Array<Location>;

  constructor(
      private userService: UserService,
      private auth: AngularFireAuth,
      private router: Router
  ) {}

  ngOnInit() {
    this.signedInUser = this.userService.signedInUser;
    this.history = Object.entries(this.signedInUser.history).map(([key, value]) => ({key, ...value}));
    console.log('===this.history', this.history);
  }

  logOut() {
    this.auth.signOut().then(() => {
      this.userService.logOut();
      this.router.navigateByUrl('/authentication');
    });
  }

  date(timestamp: string) {
    return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  onDeleteLocation(key: string) {
    console.log('===key', key);
  }
}
