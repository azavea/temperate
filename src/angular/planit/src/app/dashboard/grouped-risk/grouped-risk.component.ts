import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { Indicator } from '../../climate-api';
import { ImpactService } from '../../core/services/impact.service';
import { RiskService } from '../../core/services/risk.service';
import { UserService } from '../../core/services/user.service';
import {
  Impact,
  Location,
  OrgRiskRelativeOption,
  Risk,
  WeatherEvent,
  numberToRelativeOption,
  relativeOptionToNumber,
} from '../../shared/';
import { ImpactMapModalComponent } from '../../shared/impact-map/impact-map-modal.component';
import { ModalTemplateComponent } from '../../shared/modal-template/modal-template.component';

interface AggregateNeed {
  impact: OrgRiskRelativeOption;
  capacity: OrgRiskRelativeOption;
}

@Component({
  selector: 'app-grouped-risk',
  templateUrl: 'grouped-risk.component.html'
})

export class GroupedRiskComponent implements OnChanges, OnInit {

  @ViewChild('indicatorChartModal', {static: true})
  private indicatorsModal: ModalTemplateComponent;

  @ViewChild('impactsMapModal', {static: true})
  private impactsMapModal: ImpactMapModalComponent;

  @Input() risks: Risk[];
  @Input() weatherEvent: WeatherEvent;

  public aggregateNeed: AggregateNeed;
  public canShowIndicators = false;
  public impacts: Impact[];
  public canShowImpacts = false;
  public indicators: Indicator[] = [];
  public modalRisk: Risk;
  public location: Location;
  public onImpactMapModalShown: EventEmitter<any>;

  constructor(private impactService: ImpactService,
              private userService: UserService,
              private riskService: RiskService,
              private router: Router) { }

  ngOnChanges() {
    this.updateRelatedModalData(this.risks);
    this.aggregateNeed = this.getAggregateNeed();
  }

  ngOnInit() {
    this.userService.current().subscribe((user) => {
      this.location = user.primary_organization.location;
    });
  }

  goToIndicators() {
    this.indicatorsModal.close();
    this.router.navigate(['/indicators']);
  }

  isAdaptiveNeedBoxVisible() {
    return this.aggregateNeed &&
        this.aggregateNeed.capacity !== OrgRiskRelativeOption.Unsure &&
        this.aggregateNeed.impact !== OrgRiskRelativeOption.Unsure;
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

  openMapModal() {
    if (this.canShowImpacts) {
      this.impactsMapModal.show();
    }
  }

  percentActionsAssessed() {
    return Math.floor(this.numberOfActionsAssessed() / this.risks.length * 100);
  }

  percentRisksAssessed() {
    return Math.floor(this.numberOfRisksAssessed() / this.risks.length * 100);
  }

  getAggregateNeed(): AggregateNeed {
    // Calculates an average aggregate Adaptive Need using a simple average of all valid scores
    //  along each axis. The average on each axis is then rounded up to the next worst bucket.
    return {
      impact: getRelativeOptionAverage(this.risks, 'impact_magnitude'),
      capacity: getRelativeOptionAverage(this.risks, 'adaptive_capacity')
    };

    function getRelativeOptionAverage(risks: Risk[], property: string): OrgRiskRelativeOption {
      const totals = risks.reduce((accum, risk) => {
        const val = relativeOptionToNumber(risk[property]);
        const total = typeof val === 'number' ? val : 0;
        const count = typeof val === 'number' ? 1 : 0;
        return {
          total: accum.total + total,
          count: accum.count + count
        };
      }, {total: 0, count: 0});
      const average = totals.count ? Math.ceil(totals.total / totals.count) : undefined;
      return numberToRelativeOption(average);
    }
  }

  private updateRelatedModalData(risks: Risk[]) {
    if (risks && risks.length) {
      this.modalRisk = risks[0];
      this.riskService.getRiskIndicators(this.modalRisk).subscribe(indicators => {
        this.indicators = indicators;
        this.canShowIndicators = !!(this.modalRisk.weather_event.indicators &&
                                    this.modalRisk.weather_event.indicators.length);
      });
      this.impactService.rankedFor(this.modalRisk.weather_event).subscribe(rankedImpacts => {
        this.impacts = rankedImpacts.filter(i => i.map_layer);
        this.canShowImpacts = !!(this.impacts &&
                                 this.impacts.length &&
                                 this.impacts.length > 0);
      });
    } else {
      this.indicators = [];
      this.impacts = [];
      this.canShowIndicators = false;
      this.canShowImpacts = false;
    }
  }
}
