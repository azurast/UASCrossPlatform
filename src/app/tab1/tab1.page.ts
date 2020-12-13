import {Component, OnInit} from '@angular/core';
import {UserService} from '../services/user/user.service';
import {User} from '../services/user/user';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import lodash from 'lodash';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  allUsers: Array<User>;
  signedInUser: User;
  friendsList: Array<string>;
  allFriends: Array<User>;

  constructor(
      private userService: UserService,
      private db: AngularFireDatabase
  ) {}

  ngOnInit() {
    this.signedInUser = this.userService.signedInUser;
    this.allUsers = new Array<User>();
    this.allFriends = new Array<User>();
    this.initialize();
  }

  onSearchChange(searchValue: string) {
    if (!searchValue) {
      this.initialize();
    }
    this.allUsers = this.allUsers.filter((user) => {
      if (user.firstName && searchValue) {
        return (
          user.firstName.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
        );
      } else if (user.lastName && searchValue) {
        return (
            user.lastName.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
        );
      }
    });
  }

  initialize() {
    this.db.object('/users/'+ this.signedInUser.id + '/friends/').query.once('value').then((dataSnapshot) => {
      this.friendsList = dataSnapshot.val();
      this.userService.setFriendsList(this.friendsList);
    });
    this.db.object('users/' ).query.orderByKey().once('value').then((dataSnapshot) => {
      Object.entries(dataSnapshot.val()).map(([key, value]) => {
        this.allUsers.push({
          id: key,
          // @ts-ignore
          firstName: value.firstName,
          // @ts-ignore
          lastName: value.lastName,
          // @ts-ignore
          email: value.email,
          // @ts-ignore
          history: value.history
        });
      });
    }).then(() => {
      this.allUsers.forEach((user) => {
        if (this.friendsList.includes(user.id)) {
          this.allFriends.push(user);
        }
      });
      const lastLoc = this.userService.getFriendsLastLocation();
      console.log('===lastLoc', lastLoc);
    });
  }

  onDeleteFriend(id: string) {
    this.friendsList = this.friendsList.filter(friendId => friendId !== id);
    this.allFriends = [];
    this.allUsers.forEach((user) => {
      if (this.friendsList.includes(user.id)) {
        this.allFriends.push(user);
      }
    });
    this.userService.setFriendsList(this.friendsList);
  }
}
