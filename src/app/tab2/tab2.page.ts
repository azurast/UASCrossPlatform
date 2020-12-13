import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import {UserService} from '../services/user/user.service';
import {AngularFireDatabase} from '@angular/fire/database';
import {User} from "../services/user/user";

declare var google: any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  map: any;
  isCheckingIn: boolean;
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  geoCoder: any;
  searchForm: FormGroup;
  searchTerm: string;
  friendsList: Array<any>;
  allUsers: Array<User>;
  allFriends: Array<User>;
  friendsLastLocation: Array<any>;
  signedInUser: User;
  myIcon;
  friendIcon;
  @ViewChild('search',{static: false }) searchElementRef: ElementRef;

  constructor(
      private mapsAPILoader: MapsAPILoader,
      private ngZone: NgZone,
      private alertController: AlertController,
      private userService: UserService,
      private db: AngularFireDatabase
  ) {
  }

  ngOnInit(): void {
    this.myIcon = {
      url: 'assets/myPosition.svg',
      scaledSize: {
        width: 60,
        height: 60
      }};
    this.friendIcon = {
      url: 'assets/friendPosition.svg',
      scaledSize: {
        width: 60,
        height:60
      }};
    this.isCheckingIn = true;
    this.searchForm = new FormGroup({
      searchTerm: new FormControl(null, {
        updateOn: 'blur'
      })});
    this.signedInUser = this.userService.signedInUser;
    this.allUsers = new Array<User>();
    this.allFriends = new Array<User>();
    this.friendsLastLocation = [];
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();
      this.setCurrentAddress();
      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          // get the place result
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();

          // verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          // set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
          this.address = place.formatted_address;
        });
      });
    });
    setTimeout(() => this.initialize(), 1000);
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
      setTimeout(() => this.userService.getFriendsLastLocation(), 2000);
      this.friendsLastLocation = this.userService.friendsLastLocation;
      console.log('===this.friendsLastLocation', this.friendsLastLocation);
      const markers = [];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.friendsLastLocation.length; i++) {
        const pos = new google.maps.LatLng(this.friendsLastLocation[i].lat, this.friendsLastLocation[i].lng);
        markers[i] = new google.maps.Marker({
          position: pos,
          map: this.map,
          description: this.friendsLastLocation[i].address
        });
      }
    });
  }

  setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 15;
      });
    }
    if (this.geoCoder) {
      this.setCurrentAddress();
    }
  }

  setCurrentAddress() {
    setTimeout(() => {
      this.geoCoder.geocode({ location: { lat: this.latitude, lng: this.longitude } }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            this.address = results[0].formatted_address;
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
    }, 1000);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

  toggleCheckIn() {
    this.isCheckingIn = !this.isCheckingIn;
  }

  onChange(e) {
    e.preventDefault();
    this.searchTerm = e.target.value;
  }

  onCheckIn() {
    const date = new Date();
    const timestamp = date.toISOString();
    this.presentAlertConfirm(this.address, this.latitude, this.longitude, timestamp);
  }

  async presentAlertConfirm(address: string, latitude: number, longitude: number, timestamp: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Checkin here?',
      message: `Check In at <strong>${address}</strong> ?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.userService.checkIn({
              timestamp,
              latitude,
              longitude,
              address
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
