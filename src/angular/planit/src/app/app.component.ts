import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, Renderer } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: any,
              private renderer: Renderer,
              private modalService: BsModalService) {}


  ngAfterViewInit(): void {
    // Add Heap Analytics snippet into document head, using appropriate environment identifier.

    // Apart from the title, manipulation of the DOM outside of the body is currently
    // unsupported in Angular2+. See:
    // https://github.com/angular/universal/issues/309

    const heapSnippet = `window.heap=window.heap||[],heap.load=function(e,t)
    {window.heap.appid=e,window.heap.config=t=t||{};var r=t.forceSSL||"https:"===
    document.location.protocol,a=document.createElement("script");a.type="text/javascript",
    a.async=!0,a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";
    var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);
    for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(
    arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify",
    "removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)
    heap[p[c]]=o(p[c])};heap.load(${environment.heapID}, {forceSSL: true});`;

    const elem = this.renderer.createElement(this.document.head, 'script');
    elem.type = 'text/javascript';
    elem.async = true;
    elem.innerHTML = heapSnippet;
  }

  public modalOpen() {
    return this.modalService.getModalsCount() > 0 ? '' : null;
  }
}
