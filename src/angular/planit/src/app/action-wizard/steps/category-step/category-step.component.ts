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

  // check if any of the action categories have been selected
  public haveSelectedActionCategory(): boolean {
    if (!this.actionCategories) {
      return false; // when not fully initialized, component has no categories yet
    }

    for (const category of this.actionCategories) {
      if (category.selected) {
        return true;
      }
    }

    return false; // none selected
  }

  // toggle button selections on click
  public selectActionCategory(actionCategory: ActionCategory) {
    actionCategory.selected = !actionCategory.selected;
  }

}
