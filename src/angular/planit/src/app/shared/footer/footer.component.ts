import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {

  constructor(public authService: AuthService,
              public router: Router) { }

  ngOnInit() {
  }

  public resetScroll() {
    window.scrollTo(0, 0);
  }

}
