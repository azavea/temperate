import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public tabs = ['Dashboard', 'Indicators', 'Charts', 'Maps', 'Assessment',
                'Action Steps', 'Resources'];

  constructor() { }

  ngOnInit() {
  }

}
