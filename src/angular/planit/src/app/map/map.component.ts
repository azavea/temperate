import {
  Component,
  OnInit
} from '@angular/core';

import { ImpactService } from '../core/services/impact.service';

import { Impact } from '../shared';

@Component({
  selector: 'app-map-page',
  templateUrl: './map.component.html'
})
export class MapPageComponent implements OnInit {
  public impacts: Impact[] = null;

  constructor(private impactService: ImpactService) {}

  ngOnInit() {
    this.impactService.list().subscribe((impacts) => {
      this.impacts = impacts;
    });
  }
}
