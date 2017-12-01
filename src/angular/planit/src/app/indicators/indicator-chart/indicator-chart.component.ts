import { Component, OnInit, Input } from '@angular/core';
import { ChartData,
         Chart,
         IndicatorRequestOpts,
         IndicatorQueryParams,
         Indicator,
         City,
         ClimateModel,
         Dataset,
         Scenario } from 'climate-change-components';

import { Point } from 'geojson';

@Component({
  selector: 'indicator-chart',
  templateUrl: './indicator-chart.component.html',
  styleUrls: []
})
export class IndicatorChartComponent implements OnInit {

  @Input() indicator: Indicator;
  @Input() city: City;

  public scenario: Scenario;
  public dataset: Dataset;
  public models: ClimateModel[];
  private extraParams: IndicatorQueryParams;


  constructor() {
    this.scenario = {
        name: 'RCP85',
        label: 'RCP 8.5',
        description: 'Rising radiative forcing pathway leading to 8.5 W/m2 in 2100. See https://www.skepticalscience.com/rcp.php'
    };
    this.dataset = {
        name: 'NEX-GDDP',
        label: 'Nasa Earth Exchange Global Daily Downscaled Projections',
        description: 'The NASA Earth Exchange (NEX) Global Daily Downscaled Projections (NEX-GDDP) dataset is comprised of downscaled climate scenarios that are derived from the General Circulation Model (GCM) runs conducted under the Coupled Model Intercomparison Project Phase 5 (CMIP5) [Taylor et al. 2012] and across the two of the four greenhouse gas emissions scenarios known as Representative Concentration Pathways (RCPs) [Meinshausen et al. 2011] developed for the Fifth Assessment Report of the Intergovernmental Panel on Climate Change (IPCC AR5). The dataset is an ensemble of projections from 21 different models and two RCPs (RCP 4.5 and RCP 8.5), and provides daily estimates of maximum and minimum temperatures and precipitation using a daily Bias-Correction - Spatial Disaggregation (BCSD) method (Thrasher, et al., 2012). The data spans the entire globe with a 0.25 degree (~25-kilometer) spatial resolution for the periods from 1950 through 2005 (Historical) and from 2006 to 2100 (Climate Projections).',
        url: 'https://nex.nasa.gov/nex/projects/1356/',
        models: ["ACCESS1-0", "BNU-ESM", "CCSM4", "CESM1-BGC", "CNRM-CM5", "CSIRO-Mk3-6-0", "CanESM2", "GFDL-CM3", "GFDL-ESM2G", "GFDL-ESM2M", "IPSL-CM5A-LR", "IPSL-CM5A-MR", "MIROC-ESM-CHEM", "MIROC-ESM", "MIROC5", "MPI-ESM-LR", "MPI-ESM-MR", "MRI-CGCM3", "NorESM1-M", "bcc-csm1-1", "inmcm4"]
    };
    this.extraParams = {
      dataset: 'NEX-GDDP'
    };
    this.models = [{
      datasets: ['NEX-GDDP'],
      name: 'BNU-ESM',
      description: 'BNU-ESM',
      base_time: null,
      enabled: true
    }];
  }

  ngOnInit() {
  }

  public addTopConcern(concern: any) {
    console.log(concern);
  }

  public collapsed(event: any) {
    console.log(event);
  }

  public expanded(event: any) {
    console.log(event);
  }
}
