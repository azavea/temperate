import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdaptiveNeedBoxComponent, Risk } from '../../shared';


@Component({
  selector: 'app-action-picker',
  templateUrl: './action-picker.component.html'
})
export class ActionPickerComponent implements OnInit {

  @Input() risk: Risk;

  @Output() closed: EventEmitter<string> = new EventEmitter();

  public showPrompt = true;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {}

  closeModal() {
    this.closed.emit('closed');
  }

  goToWizard() {
    this.router.navigate(['action/wizard', this.risk.id], {relativeTo: this.route});
    this.closeModal();
  }
}
