import {Component, OnInit} from '@angular/core';
import { UserService } from '../services/user/user.service';
import { User } from '../services/user/user';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Location } from '../services/user/location';
import {AngularFireDatabase} from '@angular/fire/database';

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
      private router: Router,
      private db: AngularFireDatabase
  ) {}

  ngOnInit() {
    this.signedInUser = this.userService.getLoggedInUser();
    this.db.object('/users/'+ this.signedInUser.id + '/history/').query.once('value').then((dataSnapshot) => {
      console.log('===dataSnapshot', dataSnapshot.val());
      // @ts-ignore
      this.history = Object.entries(dataSnapshot.val()).map(([key, value]) => ({key, ...value}));
    });
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
    // @ts-ignore
    this.history= this.history.filter(history => history.key !== key);
    this.db.database.ref('/users/'+ this.signedInUser.id + '/history/' + key).remove();
  }
}
