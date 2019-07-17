import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { Indicator } from '../../../api/models/indicator.model';
import {
  ThresholdIndicatorQueryParams,
} from '../../../api/models/threshold-indicator-query-params.model';
import { PrecipitationUnits, TemperatureUnits } from '../../../shared/extra-params.constants';

/*
 * Threshold params component
 * Multi-field form to allow user to specify threshold params
 */
@Component({
  selector: 'app-threshold-parameters',
  templateUrl: './threshold.component.html'
})
export class ThresholdComponent implements AfterViewInit, OnInit {

  @Input() indicator: Indicator;
  @Input() extraParams: ThresholdIndicatorQueryParams;
  @Output() thresholdParamSelected = new EventEmitter<ThresholdIndicatorQueryParams>();

  thresholdForm: FormGroup;

  private thresholdComparators: any[] = [
    {key: 'gte', label: 'greater than or equal to'},
    {key: 'lte', label: 'less than or equal to'},
    {key: 'gt', label: 'greater than'},
    {key: 'lt', label: 'less than'}
  ];

  private temperatureUnits = TemperatureUnits;
  private precipitationUnits = PrecipitationUnits;

  // default form values
  private defaultThreshold = 50;
  private defaultUnit = '';
  private defaultPrecipitationUnit = 'mm/day';
  private defaultTemperatureUnit = 'F';
  private defaultComparator = 'lte';

  @Input() comparators: any[] = this.thresholdComparators;
  @Input() thresholdUnits: any[] = this.temperatureUnits;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    // must create form on init instead of constructor to capture @Input values
    this.createForm();
  }

  ngAfterViewInit() {
    // Since valueChanges triggers initially before parent is ready, wait until
    // parent is ready here and trigger it to draw chart with extra parameters.
    this.thresholdParamSelected.emit({
      threshold_comparator: this.thresholdForm.controls.comparatorCtl.value,
      threshold: this.thresholdForm.controls.thresholdCtl.value,
      threshold_units: this.thresholdForm.controls.thresholdUnitCtl.value
    });
  }

  createForm() {
    this.evaluateVariable();
    const comparator = this.extraParams.threshold_comparator || this.defaultComparator;
    const threshold = this.extraParams.threshold || this.defaultThreshold;
    const thresholdUnit = this.extraParams.threshold_units || this.defaultUnit;
    this.thresholdForm = this.formBuilder.group({
      comparatorCtl: [comparator, Validators.required],
      thresholdCtl: [threshold, Validators.required],
      thresholdUnitCtl: [thresholdUnit, Validators.required]
    });

    this.thresholdForm.valueChanges
      .pipe(debounceTime(700))
      .subscribe(form => {
        this.thresholdParamSelected.emit({
          threshold_comparator: form.comparatorCtl,
          threshold: form.thresholdCtl,
          threshold_units: form.thresholdUnitCtl
        });
      });
  }

  private evaluateVariable() {
    // Set component to precip or temperature
    if (this.indicator.variables.indexOf('pr') >= 0) {
      this.defaultUnit = this.defaultPrecipitationUnit;
      this.thresholdUnits = this.precipitationUnits;
    } else {
      this.defaultUnit = this.defaultTemperatureUnit;
      this.thresholdUnits = this.temperatureUnits;
    }
  }
}
