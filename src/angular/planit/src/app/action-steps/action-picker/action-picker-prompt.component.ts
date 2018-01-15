import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-action-picker-prompt',
  templateUrl: './action-picker-prompt.component.html'
})
export class ActionPickerPromptComponent {

  @Output() closed: EventEmitter<string> = new EventEmitter();

  constructor(private router: Router) {}

  closeModal() {
    this.closed.emit('closed');
    this.router.navigateByUrl('/actions');
  }
}
