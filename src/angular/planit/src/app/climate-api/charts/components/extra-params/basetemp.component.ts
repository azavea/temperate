import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import {
  BasetempIndicatorQueryParams,
} from '../../../api/models/basetemp-indicator-query-params.model';
import { Indicator } from '../../../api/models/indicator.model';
import { TemperatureUnits } from '../../../shared/extra-params.constants';

/*
 * Basetemp params component
 * Multi-field form to allow user to specify the basetemp params
 */
@Component({
  selector: 'app-basetemp-parameters',
  templateUrl: './basetemp.component.html'
})
export class BasetempComponent implements AfterViewInit, OnInit {

  @Input() indicator: Indicator;
  @Input() extraParams: BasetempIndicatorQueryParams;
  @Output() basetempParamSelected = new EventEmitter<BasetempIndicatorQueryParams>();

  basetempForm: FormGroup;

  // default form values
  public defaultBasetemp = 50;
  public defaultBasetempUnit = 'F';
  public temperatureUnits = TemperatureUnits;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    // must create form on init instead of constructor to capture @Input values
    this.createForm();
  }

  ngAfterViewInit() {
    // Since valueChanges triggers initially before parent is ready, wait until
    // parent is ready here and trigger it to draw chart with extra parameters.
    this.basetempParamSelected.emit({
      basetemp: this.basetempForm.controls.basetempCtl.value,
      basetemp_units: this.basetempForm.controls.basetempUnitCtl.value
    });
  }

  createForm() {
    const basetemp = this.extraParams.basetemp || this.defaultBasetemp;
    const basetempUnit = this.extraParams.basetemp_units || this.defaultBasetempUnit;
    this.basetempForm = this.formBuilder.group({
      basetempCtl: [basetemp, Validators.required],
      basetempUnitCtl: [basetempUnit, Validators.required]
    });

    this.basetempForm.valueChanges
      .pipe(debounceTime(700))
      .subscribe(form => {
        this.basetempParamSelected.emit({
          basetemp: form.basetempCtl,
          basetemp_units: form.basetempUnitCtl
        });
      });
  }
}
