import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';

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
  @ViewChild('search',{static: false }) searchElementRef: ElementRef;

  constructor(
      private mapsAPILoader: MapsAPILoader,
      private ngZone: NgZone,
      private alertController: AlertController
  ) {
  }

  ngOnInit(): void {
    this.isCheckingIn = true;
    this.searchForm = new FormGroup({
      searchTerm: new FormControl(null, {
      updateOn: 'blur'
      })});

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
    this.presentAlertConfirm(this.address, this.latitude, this.longitude);
  }

  async presentAlertConfirm(address: string, lat: number, lng: number) {
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
            console.log('Confirm Okay');
          }
        }
      ]
    });
    await alert.present();
  }
}
