import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-action-picker-prompt',
  templateUrl: './action-picker-prompt.component.html'
})
export class ActionPickerPromptComponent {

  @Output() closed: EventEmitter<string> = new EventEmitter();

  public riskId: string;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.riskId = this.route.snapshot.paramMap.get('riskid');
  }

  closeModal() {
    this.closed.emit('closed');
    this.router.navigateByUrl('/actions');
  }
}
