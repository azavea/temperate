import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

export enum LDProgressbarLabelType {
  Percent = 'percent',
  Number = 'number'
}

/**
 * LDProgressbarDirective
 *
 * A directive that can be attached to any div element to create a progressbar using:
 *  https://loading.io/progress/, https://github.com/loadingio/loading-bar
 *
 * Requires that the minified js and css be available globally in the browser scope
 *
 * Default usage:
 *  <div [ldProgressbar]="percentageValue"></div>
 *
 * With the above defaults, a circular progress bar is displayed with a "{{value}}%" label.
 *
 * Additional options:
 *
 * ldProgressbarLabelType: "number" or "percent". Default: "percent"
 *    If set to "number", the default "{{ value }}%" label is replaced with a
 *    "{{ value }} / {{ max }}" label.
 *    This value can only be set when the directive is initialized.
 *
 * ldProgressbarMax: The max total value. This can be used to adjust the scale for completion.
 *    If ldProgressbarLabelType === "number" then this value will appear in the label as well.
 *
 * ldProgressbarType: Valid values are any of the available "data-preset" options of the original
 *    library, such as "circle", "line" or "fan".
 *    This value can only be set when the directive is initialized.
 */
@Directive({ selector: '[ldProgressbar]' })
export class LDProgressbarDirective implements AfterViewInit, OnChanges {

  // tslint:disable:no-input-rename
  @Input('ldProgressbar') value: number;
  @Input('ldProgressbarLabelType') labelType = LDProgressbarLabelType.Percent;
  @Input('ldProgressbarMax') max = 100;
  @Input('ldProgressbarType') type = 'circle';

  private ldBar: any;

  constructor(private element: ElementRef) { }

  ngAfterViewInit() {
    // Setup ldBar according to the documentation:
    //  https://loading.io/progress/
    // Always default to a centered label for now
    this.element.nativeElement.classList.add('ldBar');
    this.element.nativeElement.classList.add('label-center');
    this.element.nativeElement.setAttribute('data-preset', this.type);
    this.ldBar = new ldBar(this.element.nativeElement);

    // If labeltype is `value / max` instead of percentage, replace default label with new one
    if (this.labelType === LDProgressbarLabelType.Number) {
      const originalLabel = this.element.nativeElement.getElementsByClassName('ldBar-label')[0];
      originalLabel.style.display = 'none';
      const numberLabel = document.createElement('div');
      numberLabel.classList.add('ldBar-label');
      numberLabel.classList.add('ldBar-label-number');
      this.element.nativeElement.appendChild(numberLabel);
    }

    this.update();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  private update() {
    if (!this.ldBar) {
      return;
    }

    const percent = this.value / this.max * 100 || 0;
    if (this.labelType === LDProgressbarLabelType.Percent) {
      this.ldBar.set(percent);
    } else if (this.labelType === LDProgressbarLabelType.Number) {
      const label = `${this.value}/${this.max}`;
      this.ldBar.set(percent);
      const labelElement = this.element.nativeElement
        .getElementsByClassName('ldBar-label-number')[0];
      labelElement.textContent = label;
    } else {
      throw Error('Unsupported label type -- use one of LDProgressbarLabelType');
    }
  }
}
