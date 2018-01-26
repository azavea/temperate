import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdaptiveNeedBoxComponent, Risk, SuggestedAction } from '../../shared';
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

  goToWizard() {
    // route to wizard, passing risk ID in URL, without changing URL
    this.router.navigate(['action/wizard', this.risk.id], {relativeTo: this.route,
                                                           skipLocationChange: true});
    // change URL to wizard path without risk ID and push to browser history
    this.location.go('/actions/action/wizard/');
    this.closeModal();
  }
}
