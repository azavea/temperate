import { Component, OnInit } from '@angular/core';
import { ChartData,
         Chart,
         IndicatorService,
         IndicatorRequestOpts,
         IndicatorQueryParams,
         Indicator,
         City,
         Dataset,
         Scenario } from 'climate-change-components';

import { Point } from 'geojson';

@Component({
  selector: 'indicator-chart',
  templateUrl: './indicator-chart.component.html',
  styleUrls: ['./indicator-chart.component.scss']
})
export class IndicatorChartComponent implements OnInit {

  public allIndicators: any[];

  public scenario: Scenario;
  public indicator: Indicator;

  public chartData: ChartData;
  public city: City;
  public dataset: Dataset;
  public extraParams: IndicatorQueryParams;

  constructor(private indicatorService: IndicatorService) {
  }

  ngOnInit() {
    this.scenario = {
        name: 'RCP85',
        label: 'RCP 8.5',
        description: 'Rising radiative forcing pathway leading to 8.5 W/m2 in 2100. See https://www.skepticalscience.com/rcp.php'
    };
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
    this.dataset = {
        name: 'NEX-GDDP',
        label: 'Nasa Earth Exchange Global Daily Downscaled Projections',
        description: 'The NASA Earth Exchange (NEX) Global Daily Downscaled Projections (NEX-GDDP) dataset is comprised of downscaled climate scenarios that are derived from the General Circulation Model (GCM) runs conducted under the Coupled Model Intercomparison Project Phase 5 (CMIP5) [Taylor et al. 2012] and across the two of the four greenhouse gas emissions scenarios known as Representative Concentration Pathways (RCPs) [Meinshausen et al. 2011] developed for the Fifth Assessment Report of the Intergovernmental Panel on Climate Change (IPCC AR5). The dataset is an ensemble of projections from 21 different models and two RCPs (RCP 4.5 and RCP 8.5), and provides daily estimates of maximum and minimum temperatures and precipitation using a daily Bias-Correction - Spatial Disaggregation (BCSD) method (Thrasher, et al., 2012). The data spans the entire globe with a 0.25 degree (~25-kilometer) spatial resolution for the periods from 1950 through 2005 (Historical) and from 2006 to 2100 (Climate Projections).',
        url: 'https://nex.nasa.gov/nex/projects/1356/',
        models: ["ACCESS1-0", "BNU-ESM", "CCSM4", "CESM1-BGC", "CNRM-CM5", "CSIRO-Mk3-6-0", "CanESM2", "GFDL-CM3", "GFDL-ESM2G", "GFDL-ESM2M", "IPSL-CM5A-LR", "IPSL-CM5A-MR", "MIROC-ESM-CHEM", "MIROC-ESM", "MIROC5", "MPI-ESM-LR", "MPI-ESM-MR", "MRI-CGCM3", "NorESM1-M", "bcc-csm1-1", "inmcm4"]
    };
    this.indicator = {
      name: 'heat_wave_incidents',
      label: 'Heat Wave Incidents',
      description: 'Number of times daily high temperature exceeds 5C above historic norm for at least 5 consecutive days',
      time_aggregation: 'yearly',
      variables: ['tasmax']
    };
    this.extraParams = {
      dataset: 'NEX-GDDP'
    };
    let queryOpts: IndicatorRequestOpts = {
      indicator: this.indicator,
      city: this.city,
      scenario: this.scenario,
      params: this.extraParams
    };
    this.indicatorService.getData(queryOpts).subscribe(data => {
      this.chartData = data;
    });
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
