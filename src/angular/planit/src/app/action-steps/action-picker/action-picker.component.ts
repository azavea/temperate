import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdaptiveNeedBoxComponent } from '../../assessment/adaptive-need-box/adaptive-need-box.component';
import { Risk } from '../../shared';
import { RiskService } from '../../core/services/risk.service';


@Component({
  selector: 'app-action-picker',
  templateUrl: './action-picker.component.html'
})
export class ActionPickerComponent {

  public risk: Risk;

  @Output() closed: EventEmitter<string> = new EventEmitter();

  constructor(private riskService: RiskService,
              private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit() {
    const riskId: string = this.route.snapshot.paramMap.get('riskid');
    this.riskService.get(riskId).subscribe(risk => this.risk = risk);
  }

  closeModal() {
    this.closed.emit('closed');
    this.router.navigateByUrl('/actions');
  }
}
