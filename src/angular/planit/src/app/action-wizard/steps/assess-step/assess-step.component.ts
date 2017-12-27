import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-action-assess-step',
  templateUrl: './assess-step.component.html'
})
export class AssessStepComponent implements OnInit {

  public navigationSymbol = '1';
  public title = 'Assess';

  constructor(private router: Router) { }

  ngOnInit() { }

  finish() {
    this.router.navigate(['assessment']);
  }
}
