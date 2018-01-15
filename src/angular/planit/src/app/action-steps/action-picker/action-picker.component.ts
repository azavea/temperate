import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-action-picker',
  templateUrl: './action-picker.component.html'
})
export class ActionPickerComponent {

  @Output() closed: EventEmitter<string> = new EventEmitter();

  constructor(private router: Router) {}

  closeModal() {
    this.closed.emit('closed');
    this.router.navigateByUrl('/actions');
  }
}
