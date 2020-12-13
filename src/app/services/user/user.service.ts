import { Injectable } from '@angular/core';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {User} from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private dbPath = '/users';
  usersRef: AngularFireList<User> = null;
  dbRef: any;
  signedInUser: User;
  allFriends: Array<string>;
  localStorage: Storage;

  constructor(
      private db: AngularFireDatabase
  ) {
    this.usersRef = db.list(this.dbPath);
    this.localStorage = window.localStorage;
  }

  createUser(user: any, firstName: string, lastName: string) {
    const { uid, providerData } = user;
    this.dbRef = this.db.database.ref().child('users');
    this.dbRef.child(`${uid}`).set({
      email: providerData[0].email,
      firstName,
      lastName,
      friends: []
    });
  }

  get isLocalStorageSupported(): boolean {
    return !!this.localStorage;
  }

  setLoggedInUser(uid: string) {
    this.signedInUser = new User();
    this.dbRef = this.db.database.ref('users/' + uid).once('value').then((dataSnapshot) => {
      this.signedInUser.id = uid;
      this.signedInUser.firstName = dataSnapshot.val().firstName || '';
      this.signedInUser.lastName = dataSnapshot.val().lastName || '';
      this.signedInUser.email = dataSnapshot.val().email || '';

      if (this.isLocalStorageSupported) {
        this.localStorage.setItem('user', JSON.stringify(this.signedInUser));
      }
    });
  }

  logOut() {
    this.localStorage.removeItem('user');
  }

  setFriendsList(data: Array<string>) {
    this.allFriends = data;
    // set it to DB
  }

  getFriendsList() {
    return this.allFriends;
  }

}
