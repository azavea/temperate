import { HistoricPercentileParam } from './historic-percentile-param.enum';
import {
  IndicatorDistanceQueryParams,
  IndicatorQueryParams,
} from './indicator-query-params.model';

export interface PercentileHistoricIndicatorQueryParams extends IndicatorQueryParams {
  historic_range: number;
  percentile: HistoricPercentileParam;
}

export interface PercentileHistoricIndicatorDistanceQueryParams
  extends IndicatorDistanceQueryParams, PercentileHistoricIndicatorQueryParams { }
