import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { PopoverDirective } from 'ngx-bootstrap/popover';

import {
  City as ApiCity,
  Indicator,
  IndicatorService
} from 'climate-change-components';

import { IndicatorChartComponent } from '../../shared/indicator-chart/indicator-chart.component';
import { ModalTemplateComponent } from '../../shared/modal-template/modal-template.component';
import { Location } from '../../shared/models/location.model';
import { Risk } from '../../shared/models/risk.model';

import { CityService } from '../../core/services/city.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'va-risk-popover',
  templateUrl: 'risk-popover.component.html'
})
export class RiskPopoverComponent implements OnInit {
  @Input() risk: Risk;

  public indicators: Indicator[];
  public selectedIndicator: Indicator;
  public apiCity: ApiCity;

  @ViewChild('indicatorModal')
  private indicatorModal: ModalTemplateComponent;

  @ViewChild('popover')
  private popoverElement: PopoverDirective;

  constructor (private indicatorService: IndicatorService,
               private cityService: CityService,
               private userService: UserService) {}

  ngOnInit() {
    this.updateRiskIndicators();
    this.userService.current()
      .switchMap((user) => {
        const id = user.primary_organization.location.properties.api_city_id;
        return this.cityService.get(id);
      })
      .subscribe((apiCity) => {
        this.apiCity = apiCity;
      });
  }

  public openIndicatorModal(indicator: Indicator) {
    this.selectedIndicator = indicator;
    this.indicatorModal.open();
    this.popoverElement.hide();
  }

  updateRiskIndicators() {
    this.indicatorService.list().subscribe(indicators => {
      this.indicators = indicators.filter(indicator => {
        return this.risk.weather_event.indicators.includes(indicator.name);
      });
    });
  }
}
