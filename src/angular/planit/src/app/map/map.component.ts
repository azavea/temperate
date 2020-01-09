import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { FullHeightService } from '../core/services/full-height.service';
import { ImpactService } from '../core/services/impact.service';

import { Impact } from '../shared';

@Component({
  selector: 'app-map-page',
  templateUrl: './map.component.html'
})
export class MapPageComponent implements OnInit, OnDestroy {
  public impacts: Impact[] = null;

  constructor(private impactService: ImpactService,
              private fullHeightService: FullHeightService) {}

  ngOnInit() {
    this.impactService.list().subscribe((impacts) => {
      this.impacts = impacts;
    });
    setTimeout(() => this.fullHeightService.enable());
  }

  ngOnDestroy() {
    setTimeout(() => this.fullHeightService.disable());
  }
}
