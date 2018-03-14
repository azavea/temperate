import { DatePipe, Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ActionService } from '../../core/services/action.service';
import { SuggestedActionService } from '../../core/services/suggested-action.service';
import { Action, AdaptiveNeedBoxComponent, Risk, SuggestedAction } from '../../shared';


@Component({
  selector: 'app-action-picker',
  templateUrl: './action-picker.component.html'
})
export class ActionPickerComponent implements OnInit {

  @Input() risk: Risk;

  @Output() closed: EventEmitter<string> = new EventEmitter();

  public loading = true;
  public showPrompt = true;

  constructor(private location: Location,
              private actionService: ActionService,
              private suggestedActionService: SuggestedActionService,
              private route: ActivatedRoute,
              private router: Router) {}

  suggestedActions: SuggestedAction[] = [];

  ngOnInit() {
    this.suggestedActionService.list(this.risk).subscribe(s => {
      this.suggestedActions = s;
      this.loading = false;
    });
  }

  closeModal() {
    this.closed.emit('closed');
  }

  goToWizard(suggestion?: SuggestedAction) {
    // route to wizard, passing risk ID in URL, and suggestion if given, without changing URL
    if (suggestion) {
      this.router.navigate(['action/new', this.risk.id, suggestion.id],
                           {relativeTo: this.route, skipLocationChange: true});
    } else {
      this.router.navigate(['action/new', this.risk.id],
                           {relativeTo: this.route, skipLocationChange: true});
    }
    // change URL to wizard path without risk or suggested action IDs and push to browser history
    this.location.go('/actions/action/new/');
    this.closeModal();
  }
}
