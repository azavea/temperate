import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Polygon } from 'geojson';
import { MovingDirection } from 'ng2-archwizard';
import {
  DrawInteractionComponent,
  LayerVectorComponent,
  LayerVectorTileComponent,
  MapComponent as OLMapComponent,
  ViewComponent,
} from 'ngx-openlayers';
import { ToastrService } from 'ngx-toastr';
import { applyStyle } from 'ol-mapbox-style';
import Collection from 'ol/Collection';
import { containsCoordinate } from 'ol/extent';
import OLPolygon from 'ol/geom/Polygon';
import { DrawEvent } from 'ol/interaction/Draw';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { transformExtent } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { getArea } from 'ol/sphere';
import { Observable, Subscription, of as observableOf } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

import { WEB_MERCATOR, WGS84 } from '../../../../core/constants/map';
import { OrganizationService } from '../../../../core/services/organization.service';
import { WeatherEventService } from '../../../../core/services/weather-event.service';
import { WizardSessionService } from '../../../../core/services/wizard-session.service';
import { addBasemapToMap, componentLoaded } from '../../../../core/utilities/map.utility';
import { CommunitySystem, Location, Organization } from '../../../../shared/';

import { PlanStepKey } from '../../plan-step-key';
import { PlanWizardStepComponent } from '../../plan-wizard-step.component';

export interface AreaFormModel {
  location: Location;
  bounds?: Polygon;
}

enum AreaTabs {
  EnterCity,
  DrawArea,
}

@Component({
  selector: 'app-plan-step-area',
  templateUrl: 'area-step.component.html'
})

export class AreaStepComponent
  extends PlanWizardStepComponent<AreaFormModel>
  implements OnInit, AfterViewInit {

  @ViewChildren(OLMapComponent) map;
  @ViewChildren('bounds') bounds !: QueryList<LayerVectorComponent>;
  @ViewChildren('draw') draw !: QueryList<DrawInteractionComponent>;

  public wgs84 = WGS84;
  public webMercator = WEB_MERCATOR;

  public form: FormGroup;
  public navigationSymbol = '1';
  public title = 'Geographic area';
  public areaTab = AreaTabs.EnterCity;
  public areaTabs = AreaTabs;

  public organization: Organization;
  public key: PlanStepKey = PlanStepKey.Area;
  public maxArea = 10000; // sq mi

  public polygon: OLPolygon;
  public polygonArea: Number = null;
  public initialLocation: Location = null;

  public drawingStarted = false;
  public polygonOutOfBounds = false;

  @Output() wizardCompleted = new EventEmitter();

  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected weatherEventService: WeatherEventService,
              protected toastr: ToastrService,
              private fb: FormBuilder) {
    super(session, orgService, weatherEventService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    this.organization = this.session.getData();
    this.initialLocation = new Location(this.organization.location);
    this.setupForm(this.fromModel(this.organization));
  }

  ngAfterViewInit() {
    componentLoaded(this.map).subscribe((olmap: OLMapComponent) => {
      addBasemapToMap(olmap.instance, 1);
    });
    componentLoaded(this.bounds).subscribe(bounds => {
      if (this.polygon) {
        bounds.instance.getSource().addFeature(new Feature({ geometry: this.polygon }));
      }
    });
  }

  checkPolygon() {
    const SQ_M_PER_SQ_MI = 0.0000003861;

    this.polygonArea = getArea(this.polygon) * SQ_M_PER_SQ_MI;

    const LOCA_EXTENT = transformExtent([-126.0, 23.4, -66, 54], WGS84, WEB_MERCATOR);
    this.polygonOutOfBounds = !this.polygon.getCoordinates()[0].every(point => {
      return containsCoordinate(LOCA_EXTENT, point);
    });
    return;
  }

  clearBounds() {
    this.polygon = null;
    this.polygonArea = null;
    this.polygonOutOfBounds = false;
    this.bounds.first.instance.getSource().clear();
    if (this.draw.first) {
      this.draw.first.instance.setActive(false);
      this.draw.first.instance.setActive(true);
    }
    this.drawingStarted = false;
    this.form.controls.bounds.setErrors(null);
  }

  isStepComplete() {
    if (this.areaTab === AreaTabs.EnterCity) {
      return this.form.controls.location.value !== null;
    }
    return this.polygon !== null && this.polygonArea < this.maxArea && !this.polygonOutOfBounds;
  }

  shouldSave() {
    return true;
  }

  getFormModel(): AreaFormModel {
    if (this.areaTab === AreaTabs.DrawArea) {
      return {
        location: this.initialLocation,
        bounds: this.getBounds()
      };
    } else {
      return {
        location: this.form.controls.location.value,
        bounds: null
      };
    }
  }

  setupForm(data: AreaFormModel) {
    // Note that the bounds are mostly managed outside the form, but we do
    // funnel server-side validation errors through the FormGroup
    this.form = this.fb.group({
      bounds: [data.bounds, []],
      location: [data.location, []]
    });

    if (data.bounds) {
      this.polygon = new OLPolygon(data.bounds.coordinates);
      this.polygon.transform(WGS84, WEB_MERCATOR);
      this.checkPolygon();
      this.drawingStarted = true;
    }
  }

  fromModel(model: Organization): AreaFormModel {
    return {
      location: new Location({
        geometry: model.location.geometry,
        properties: {
          name: model.location.properties.name || model.creator_location_name,
          admin: model.location.properties.name || model.creator_location_admin,
        }
      }),
      bounds: model.bounds
   };
  }

  toModel(data: AreaFormModel, model: Organization): Organization {
    model.location = data.location || null;
    model.bounds = data.bounds || null;
    return model;
  }

  getBounds(): Polygon {
    return new GeoJSON().writeGeometryObject(this.polygon, {
      dataProjection: WGS84, featureProjection: WEB_MERCATOR
    });
  }

  canDrag = (layer) => {
    return this.bounds.first.instance === layer;
  }

  setPolygon(event: DrawEvent) {
    this.polygon = event.feature.getGeometry() as OLPolygon;
    this.bounds.first.instance.getSource().addFeature(event.feature);
    this.checkPolygon();
    this.drawingStarted = false;
  }

  setTab(tab: AreaTabs) {
    this.areaTab = tab;
    if (tab === AreaTabs.DrawArea) {
      componentLoaded(this.map).subscribe((olmap: OLMapComponent) => {
        addBasemapToMap(olmap.instance);
      });
    }
  }
}
