import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { CommunitySystemService } from '../../core/services/community-system.service';
import { CommunitySystem } from '../models/community-system.model';


@Component({
  selector: 'app-add-community-systems',
  templateUrl: 'add-community-systems.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddCommunitySystemsComponent),
      multi: true,
    }
  ]
})
export class AddCommunitySystemsComponent implements OnInit, ControlValueAccessor {

  public selectedSystems: CommunitySystem[];
  public communitySystems: CommunitySystem[];

  private onChange = (_: any) => { };

  constructor(private communitySystemService: CommunitySystemService) { }

  ngOnInit() {
    this.communitySystemService.list().subscribe(events => this.communitySystems = events);
  }

  public add(communitySystem: CommunitySystem) {
    if (!this.isSelected(communitySystem)) {
      this.selectedSystems.push(communitySystem);
      this.onChange(this.selectedSystems);
    }
  }

  public isSelected(communitySystem: CommunitySystem) {
    return this.selectedSystems.findIndex(e => e.id === communitySystem.id) !== -1;
  }

  public remove(communitySystem: CommunitySystem) {
    // Only allow deletion of community systems added while the component is open
    const index = this.selectedSystems.findIndex(e => e.id === communitySystem.id);
    if (index !== -1) {
      this.selectedSystems.splice(index, 1);
      this.onChange(this.selectedSystems);
    }
  }

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any) {}

  public writeValue(value: any) {
    this.selectedSystems = value || [];
  }
}
