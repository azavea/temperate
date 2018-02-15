import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { City, Indicator } from 'climate-change-components';

import { CityService } from '../../core/services/city.service';
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

  constructor(private cityService: CityService,
              private riskService: RiskService,
              private router: Router) { }

  ngOnInit() {
    this.cityService.current().subscribe(city => { this.city = city; });
  }

  ngOnChanges() {
    this.updateRelatedIndicators(this.risks);
  }

  goToIndicators() {
    this.indicatorsModal.close();
    this.router.navigate(['/indicators']);
  }

  isAdaptiveNeedBoxVisible() {
    return this.risks && this.risks.length &&
        !!this.risks[0].adaptive_capacity && !!this.risks[0].impact_magnitude;
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
