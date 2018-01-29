import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Action, AdaptiveNeedBoxComponent, Risk, SuggestedAction } from '../../shared';
import { ActionService } from '../../core/services/action.service';
import { SuggestedActionService } from '../../core/services/suggested-action.service';


@Component({
  selector: 'app-action-picker',
  templateUrl: './action-picker.component.html'
})
export class ActionPickerComponent implements OnInit {

  @Input() risk: Risk;

  @Output() closed: EventEmitter<string> = new EventEmitter();

  public showPrompt = true;

  constructor(private location: Location,
              private actionService: ActionService,
              private suggestedActionService: SuggestedActionService,
              private route: ActivatedRoute,
              private router: Router) {}

  suggestedActions: SuggestedAction[] = [];

  ngOnInit() {
    this.suggestedActionService.list(this.risk).subscribe(s => this.suggestedActions = s)
  }

  closeModal() {
    this.closed.emit('closed');
  }

  goToWizard(suggestion?: SuggestedAction) {
    let action = new Action({
      risk: this.risk.id
    });
    if(suggestion) {
      Object.assign(action,
        {
          name: suggestion.name,
          action_type: suggestion.action_type,
          action_goal: suggestion.action_goal,
          implementation_details: suggestion.implementation_details,
          implementation_notes: suggestion.implementation_notes,
          improvements_adaptive_capacity: suggestion.improvements_adaptive_capacity,
          improvements_impacts: suggestion.improvements_impacts,
          collaborators: suggestion.collaborators,
          categories: suggestion.categories
        })
    }
    this.actionService.create(action).subscribe(action => {
      this.router.navigate(['action/', action.id], {relativeTo: this.route});
      this.closeModal();
    });
  }
}
