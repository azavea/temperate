import { Component, OnInit } from '@angular/core';

import { ActionCategory } from '../../../shared/';
import { ActionCategoryService } from '../../../core/services/action-category.service';

@Component({
  selector: 'app-action-category-step',
  templateUrl: './category-step.component.html'
})
export class CategoryStepComponent implements OnInit {

  public navigationSymbol = '4';
  public title = 'Categories';

  public actionCategories: ActionCategory[];

  constructor(private actionCategoryService: ActionCategoryService) { }

  ngOnInit() {
    this.actionCategoryService.list().subscribe(categories => this.actionCategories = categories);
  }

}
