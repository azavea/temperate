import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Directive({ selector: '[appCircularProgressbar]' })
export class CircularProgressbarDirective implements AfterViewInit, OnChanges {

  // tslint:disable-next-line:no-input-rename
  @Input('appCircularProgressbar') value: number;

  private ldBar: any;

  constructor(private element: ElementRef) { }

  ngAfterViewInit() {
    this.element.nativeElement.classList.add('ldBar');
    this.element.nativeElement.classList.add('label-center');
    this.element.nativeElement.setAttribute('data-preset', 'circle');

    this.ldBar = new ldBar(this.element.nativeElement);
    this.ldBar.set(this.value);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.ldBar) {
      this.ldBar.set(this.value || 0);
    }
  }
}
