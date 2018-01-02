import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-action-category-step',
  templateUrl: './category-step.component.html'
})
export class CategoryStepComponent implements OnInit {

  public navigationSymbol = '4';
  public title = 'Categories';

  constructor() { }

  ngOnInit() {
  }

}
