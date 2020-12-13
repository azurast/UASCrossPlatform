import { Component, OnInit } from '@angular/core';
import {User} from '../services/user/user';
import {UserService} from '../services/user/user.service';
import {AngularFireDatabase} from '@angular/fire/database';

@Component({
  selector: 'app-add-friends',
  templateUrl: './add-friends.page.html',
  styleUrls: ['./add-friends.page.scss'],
})
export class AddFriendsPage implements OnInit {
  allUsers: Array<User>;
  signedInUser: User;
  friendsList: Array<string>;
  allStrangers: Array<User>;

  constructor(
      private userService: UserService,
      private db: AngularFireDatabase
  ) {}

  ngOnInit() {
    this.signedInUser = this.userService.signedInUser;
    this.allUsers = new Array<User>();
    this.allStrangers = new Array<User>();
    this.friendsList = this.userService.getFriendsList() || [];
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
    this.db.object('/users').query.once('value').then((dataSnapshot) => {
      Object.entries(dataSnapshot.val()).map(([key, value]) => {
        this.allUsers.push({
          id: key,
          // @ts-ignore
          firstName: value.firstName,
          // @ts-ignore
          lastName: value.lastName,
          // @ts-ignore
          email: value.email
        });
      });
    }).then(() => {
      this.allUsers.forEach((user) => {
        if (this.friendsList.includes(user.id)) {
        } else {
          if (user.id !== this.signedInUser.id) {
            this.allStrangers.push(user);
          }
        }
      });
    });
  }

  onAddFriend(id: string) {
    this.allStrangers = this.allStrangers.filter(strangerId => strangerId.id !== id);
    this.friendsList.push(id);
    this.userService.setFriendsList(this.friendsList);
  }
}
