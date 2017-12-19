import { Component, OnInit } from '@angular/core';

interface SidebarTab {
  name: string;
  link: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public tabs: SidebarTab[] = [{
    name: 'Dashboard',
    link: 'dashboard'
  }, {
    name: 'Indicators',
    link: 'indicators'
  }, {
    name: 'Assessment',
    link: 'assessment'
  }, {
    name: 'Action Steps',
    link: 'actions'
  }];

  constructor() { }

  ngOnInit() {
  }

}
