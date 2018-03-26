import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Rx';

import { CityProfileService } from '../../core/services/city-profile.service';
import { UserService } from '../../core/services/user.service';
import { CityProfile, CityProfileOption, CityProfileSection } from '../../shared';

@Component({
  selector: 'app-city-profile',
  templateUrl: 'city-profile.component.html'
})
export class CityProfileComponent implements OnInit {

  public cityProfile: CityProfile;
  public isOpen = {};
  public sections = CityProfileSection;

  // Properties to store field choices
  public sectors: string[] = [];

  constructor(private cityProfileService: CityProfileService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.userService.current().switchMap(user => {
      return this.cityProfileService.get(user.primary_organization);
    }).subscribe(p => this.cityProfile = p);

    this.cityProfileService.listEconomicSectors().subscribe(s => {
      this.sectors = s.map(option => option.name);
    });
  }

  save() {
    this.cityProfileService.update(this.cityProfile).subscribe(p => this.cityProfile = p);
  }
}
