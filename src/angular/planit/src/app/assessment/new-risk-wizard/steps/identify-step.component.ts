
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'va-new-risk-step-identify',
    templateUrl: 'identify-step.component.html'
})

export class IdentifyStepComponent implements OnInit {

    public navigationSymbol = "1";
    public title = "Identify risk";

    constructor(private router: Router) { }

    ngOnInit() { }

    cancel() {
        this.router.navigate(['assessment']);
    }
}
