import { Component, OnInit } from '@angular/core';

import { TypeaheadMatch } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';
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
  public errors: any = {};
  public isOpen = {};
  public sections = CityProfileSection;

  // Properties to store field choices
  public commitments: CityProfileOption[] = [];
  public sectors: string[] = [];

  constructor(private cityProfileService: CityProfileService,
              private toastr: ToastrService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.userService.current().switchMap(user => {
      return this.cityProfileService.get(user.primary_organization);
    }).subscribe(p => this.cityProfile = p);

    this.cityProfileService.listEconomicSectors().subscribe(s => {
      this.sectors = s.map(option => option.name);
    });
    this.cityProfileService.listCommitmentStatuses().subscribe(commitments => {
      this.commitments = commitments;
    });
  }

  save() {
    this.cityProfileService.update(this.cityProfile).subscribe(p => {
      this.errors = {};
      this.cityProfile = p;
      this.toastr.success('Changes saved successfully.');
    }, error => {
      this.errors = error.json();
      const message = `
        There was an error saving your city profile.
        Please check all form fields and try again.
      `;
      this.toastr.error(message);
    });
  }
}
