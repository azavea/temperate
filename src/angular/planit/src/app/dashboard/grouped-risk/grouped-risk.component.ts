import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { City, Indicator } from 'climate-change-components';

import { RiskService } from '../../core/services/risk.service';
import { Risk, WeatherEvent } from '../../shared/';
import { ModalTemplateComponent } from '../../shared/modal-template/modal-template.component';

@Component({
  selector: 'app-grouped-risk',
  templateUrl: 'grouped-risk.component.html'
})

export class GroupedRiskComponent implements OnChanges, OnInit {

  @ViewChild('indicatorChartModal')
  private indicatorsModal: ModalTemplateComponent;

  @Input() risks: Risk[];
  @Input() weatherEvent: WeatherEvent;

  public canShowIndicators = false;
  public city: City;
  public indicators: Indicator[] = [];
  public modalRisk: Risk;

  constructor(private riskService: RiskService,
              private router: Router) { }

  ngOnInit() {
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

  ngOnChanges() {
    this.updateRelatedIndicators(this.risks);
  }

  goToIndicators() {
    this.indicatorsModal.close();
    this.router.navigate(['/indicators']);
  }

  numberOfActionsAssessed() {
    return this.risks.reduce((acc, risk) => {
      const assessed = risk.action && risk.action.isAssessed() ? 1 : 0;
      return acc + assessed;
    }, 0);
  }

  numberOfRisksAssessed() {
    return this.risks.reduce((acc, risk) => {
      const assessed = risk.isAssessed() ? 1 : 0;
      return acc + assessed;
    }, 0);
  }

  openModal() {
    if (this.canShowIndicators) {
      this.indicatorsModal.open();
    }
  }

  percentActionsAssessed() {
    return Math.floor(this.numberOfActionsAssessed() / this.risks.length * 100);
  }

  percentRisksAssessed() {
    return Math.floor(this.numberOfRisksAssessed() / this.risks.length * 100);
  }

  private updateRelatedIndicators(risks: Risk[]) {
    if (risks && risks.length) {
      this.modalRisk = risks[0];
      this.riskService.getRiskIndicators(this.modalRisk).subscribe(indicators => {
        this.indicators = indicators;
        this.canShowIndicators = !!(this.modalRisk.weather_event.indicators &&
                                    this.modalRisk.weather_event.indicators.length);
      });
    } else {
      this.indicators = [];
      this.canShowIndicators = false;
    }
  }
}
