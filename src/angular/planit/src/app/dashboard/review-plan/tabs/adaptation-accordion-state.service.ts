import { Injectable } from '@angular/core';

@Injectable()
export class AccordionReviewState {

  // We want all accordion groups to start closed, and for the state to reset when we open
  //  the review page. This is accomplished by storing the state in this simple object,
  //  resetting the object in ReviewPlanComponent.ngOnInit() and injecting this service at the
  //  level of ReviewPlanComponent so that each instance of the component gets its own state.
  // We could pass a simple object via @Input to the adaptation review component, but that
  //  doesn't scale as well if we want to change the behavior later.
  public isOpen = {};

}
