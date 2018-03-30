import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { PopoverDirective } from 'ngx-bootstrap/popover';

import {
  Indicator,
  IndicatorService
} from 'climate-change-components';

import { IndicatorChartComponent } from '../../shared/indicator-chart/indicator-chart.component';
import { ModalTemplateComponent } from '../../shared/modal-template/modal-template.component';
import { Location } from '../../shared/models/location.model';
import { Risk } from '../../shared/models/risk.model';

import { CityService } from '../../core/services/city.service';

@Component({
  selector: 'va-risk-popover',
  templateUrl: 'risk-popover.component.html'
})
export class RiskPopoverComponent implements OnInit {
  @Input() risk: Risk;

  public indicators: Indicator[];
  public selectedIndicator: Indicator;
  public city: Location;

  @ViewChild('indicatorModal')
  private indicatorModal: ModalTemplateComponent;

  @ViewChild('popover')
  private popoverElement: PopoverDirective;

  constructor (private indicatorService: IndicatorService,
               private cityService: CityService) {}

  ngOnInit() {
    this.updateRiskIndicators();
    this.cityService.current().subscribe(city => { this.city = city; });
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
