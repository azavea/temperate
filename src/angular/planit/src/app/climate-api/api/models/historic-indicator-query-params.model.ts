import {
  IndicatorDistanceQueryParams,
  IndicatorQueryParams,
} from './indicator-query-params.model';

export interface HistoricIndicatorQueryParams extends IndicatorQueryParams {
  historic_range: number;
}

export interface HistoricIndicatorDistanceQueryParams
  extends IndicatorDistanceQueryParams, HistoricIndicatorQueryParams { }
