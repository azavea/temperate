import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Observable } from 'rxjs';


@Component({
  selector: 'app-editable-input',
  templateUrl: './editable-input.component.html'
})
export class EditableInputComponent implements OnInit {

  @Input() inputId: string = null;

  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @Output() saved = new EventEmitter<any>();
  @Output() editted = new EventEmitter<EditableInputComponent>();

  public lastSavedValue;
  public isEditing = false;

  constructor() { }

  ngOnInit() {
    this.lastSavedValue = this.value;
  }

  edit() {
    this.isEditing = true;
    this.lastSavedValue = this.value;
    this.editted.emit(this);
  }

  save() {
    this.valueChange.emit(this.value);
    this.saved.emit(null);
  }

  cancel() {
    this.isEditing = false;
    this.value = this.lastSavedValue;
    this.valueChange.emit(this.value);
  }

  input(event) {
    this.value = event.target.value;
  }
}
