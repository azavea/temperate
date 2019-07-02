import { ModuleWithProviders, NgModule } from '@angular/core';

import { ClimateApiConfig } from './config';

import { APICacheService } from './services/api-cache.service';
import { ChartService } from './services/chart.service';
import { DatasetService } from './services/dataset.service';
import { ClimateModelService } from './services/climate-model.service';
import { HistoricRangeService } from './services/historic-range.service';
import { IndicatorService } from './services/indicator.service';
import { ScenarioService } from './services/scenario.service';

@NgModule({
  imports: [],
  declarations: []
})
export class ApiModule {
  static forRoot(config: ClimateApiConfig): ModuleWithProviders {
    return {
      ngModule: ApiModule,
      providers: [
        APICacheService,
        ChartService,
        DatasetService,
        ClimateModelService,
        HistoricRangeService,
        IndicatorService,
        ScenarioService,
        {provide: ClimateApiConfig, useValue: config}
      ]
    };
  }
}
