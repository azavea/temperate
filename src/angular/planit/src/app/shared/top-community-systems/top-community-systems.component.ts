import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CommunitySystem } from '../../shared';


@Component({
  selector: 'app-top-community-systems',
  templateUrl: './top-community-systems.component.html'
})
export class TopCommunitySystemsComponent {

  @Input() communitySystems: CommunitySystem[];

  @Output() removed = new EventEmitter<CommunitySystem>();

  remove(communitySystem: CommunitySystem) {
    this.removed.emit(communitySystem);
  }

}
