import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'va-adaptive-need-box',
  templateUrl: 'adaptive-need-box.component.html'
})
export class AdaptiveNeedBoxComponent implements OnInit {
  @Input() potentialImpact: number;
  @Input() adaptiveCapacity: number;

  constructor () {}

  ngOnInit() {
  }
}
