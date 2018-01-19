import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { PopoverDirective } from 'ngx-bootstrap/popover';

import {
  City,
  Indicator,
  IndicatorService
} from 'climate-change-components';

import { IndicatorChartComponent } from '../../shared/indicator-chart/indicator-chart.component';
import { ModalTemplateComponent } from '../../shared/modal-template/modal-template.component';
import { Risk } from '../../shared/models/risk.model';


@Component({
  selector: 'va-risk-popover',
  templateUrl: 'risk-popover.component.html'
})
export class RiskPopoverComponent implements OnInit {
  @Input() risk: Risk;

  public indicators: Indicator[];
  public selectedIndicator: Indicator;
  public city: City;

  @ViewChild('indicatorModal')
  private indicatorModal: ModalTemplateComponent;

  @ViewChild('popover')
  private popoverElement: PopoverDirective;

  constructor (private indicatorService: IndicatorService) {}

  ngOnInit() {
    this.updateRiskIndicators();

    // TODO (issue #404): Replace with the user's organization location
    this.city = {
      id: '7',
      type: 'feature',
      geometry: { type: 'Point', coordinates: [-75.16379, 39.95233] },
      properties: {
        name: 'Philadelphia',
        admin: 'PA',
        datasets: ['NEX-GDDP', 'LOCA'],
        region: 11
      },
    };
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
