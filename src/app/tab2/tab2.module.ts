import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab2PageRoutingModule } from './tab2-routing.module';
import {AgmCoreModule} from '@agm/core';
import { environment } from '../../environments/environment';

@NgModule({
  imports: [
    IonicModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapAPI,
      libraries: ['places']
    }),
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab2PageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [Tab2Page]
})
export class Tab2PageModule {}
