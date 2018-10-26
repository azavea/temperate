import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { PopoverDirective } from 'ngx-bootstrap/popover';

import {
  Indicator,
  IndicatorService
} from 'climate-change-components';

import { ModalTemplateComponent } from '../../shared/modal-template/modal-template.component';
import { Risk } from '../../shared/models/risk.model';

import { UserService } from '../../core/services/user.service';
import { Point } from '../../shared/';

@Component({
  selector: 'va-risk-popover',
  templateUrl: 'risk-popover.component.html'
})
export class RiskPopoverComponent implements OnInit {
  @Input() risk: Risk;

  public indicators: Indicator[];
  public selectedIndicator: Indicator;
  public point: Point;

  @ViewChild('indicatorModal')
  private indicatorModal: ModalTemplateComponent;

  @ViewChild('popover')
  private popoverElement: PopoverDirective;

  constructor (private indicatorService: IndicatorService,
               private userService: UserService) {}

  ngOnInit() {
    this.updateRiskIndicators();
    this.userService.current().subscribe((user) => {
      this.point = user.primary_organization.location.geometry;
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
