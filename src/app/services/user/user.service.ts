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
  allFriends: Array<any>;
  localStorage: Storage;
  friendsLastLocation: Array<any>;

  constructor(
      private db: AngularFireDatabase
  ) {
    this.friendsLastLocation = [];
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
      friends: {empty: ''},
      history: {empty: ''}
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
      this.signedInUser.history = dataSnapshot.val().history || [];
      if (this.isLocalStorageSupported) {
        // console.log('===localStorageSupported');
        // console.log('===this.signedInUser', this.signedInUser);
        this.localStorage.setItem('user', JSON.stringify(this.signedInUser));
      } else {
        // console.log('not localStorageSupported');
      }
    });
  }

  getLoggedInUser = () => {
    return JSON.parse(this.localStorage.getItem('user'));
  }

  logOut() {
    this.localStorage.removeItem('user');
    this.signedInUser = new User();
    this.friendsLastLocation = [];
  }

  setFriendsList(data) {
    this.allFriends = Object.entries(data).map(([key,value]) => (value));
    // set to db
  }

  setFriendsListStr(data) {
    this.allFriends = data;
    // set to db
  }

  getFriendsList() {
    // console.log('===this.allFriends', this.allFriends);
    return this.allFriends;
  }

  checkIn(data) {
    this.db.database.ref('users/' + this.getLoggedInUser().id + '/history').push(data);
  }

  getFriendsLastLocation() {
    this.allFriends.forEach((id) => {
      let name = 'friend';
      this.db.database.ref('users/' + id).once('value').then((data) => name = data.val().firstName).then(() => {
        this.db.database.ref('users/' + id +'/history')
            .orderByChild('timestamp').limitToLast(1)
            .once('value').then((dataSnapshot) => {
          const loc = Object.values(dataSnapshot.val());
          this.friendsLastLocation.push({
            id,
            // @ts-ignore
            address: loc[0].address,
            // @ts-ignore
            lat: loc[0].latitude,
            // @ts-ignore
            lng: loc[0].longitude,
            name
          });
        });
      });
    });
  }
}
