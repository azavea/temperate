import {
  AfterViewChecked,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AgmMap, MapsAPILoader } from '@agm/core';
import { Polygon } from 'geojson';
import { MovingDirection } from 'ng2-archwizard';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { OrganizationService } from '../../../../core/services/organization.service';
import { WeatherEventService } from '../../../../core/services/weather-event.service';
import { WizardSessionService } from '../../../../core/services/wizard-session.service';
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
  implements OnInit {

  public form: FormGroup;
  public navigationSymbol = '1';
  public title = 'Geographic area';
  public areaTab = AreaTabs.EnterCity;
  public areaTabs = AreaTabs;

  public organization: Organization;
  public key: PlanStepKey = PlanStepKey.Area;
  public maxArea = 10000; // sq mi

  public drawingManager?: google.maps.drawing.DrawingManager = null;
  public polygon?: google.maps.Polygon = null;
  public polygonArea: Number = null;

  public polygonOutOfBounds = false;

  public mapStyles = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [
        {
          visibility: 'off'
        }
      ]
    }
  ];

  @Output() wizardCompleted = new EventEmitter();

  constructor(protected session: WizardSessionService<Organization>,
              protected orgService: OrganizationService,
              protected weatherEventService: WeatherEventService,
              protected toastr: ToastrService,
              private mapsApiLoader: MapsAPILoader,
              private fb: FormBuilder) {
    super(session, orgService, weatherEventService, toastr);
  }

  ngOnInit() {
    super.ngOnInit();
    this.organization = this.session.getData();
    this.setupForm(this.fromModel(this.organization));
  }

  onMapReady(map: google.maps.Map) {
    this.setupDrawingManager(map);
    if (this.polygon !== null) {
      this.polygon.setMap(map);
    }
  }

  setupDrawingManager(map: google.maps.Map) {
    const { DrawingManager, OverlayType } = google.maps.drawing;

    const options = {
      drawingControl: false,
      polygonOptions: {
        draggable: true,
        editable: true
      },
      drawingMode: this.polygon === null ? OverlayType.POLYGON : null
    };

    this.drawingManager = new DrawingManager(options);
    google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (polygon) => {
      this.setPolygon(polygon);
    });
    this.drawingManager.setMap(map);
  }

  setPolygon(polygon: google.maps.Polygon) {
    this.polygon = polygon;
    this.checkPolygon();

    polygon.getPaths().forEach(path => {
      google.maps.event.addListener(path, 'insert_at', () => this.checkPolygon());
      google.maps.event.addListener(path, 'remove_at', () => this.checkPolygon());
      google.maps.event.addListener(path, 'set_at', () => this.checkPolygon());
    });
    google.maps.event.addListener(polygon, 'dragend', () => this.checkPolygon());

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null);
    }
  }

  checkPolygon() {
    const { computeArea } = google.maps.geometry.spherical;
    const SQ_M_PER_SQ_MI = 0.0000003861;

    this.polygonArea = computeArea(this.polygon.getPath()) * SQ_M_PER_SQ_MI;

    const LOCA_EXTENT = new google.maps.LatLngBounds(
      { lat: 23.4, lng: -126.0 }, // SW corner
      { lat: 54.0, lng:  -66.0 }, // NE corner
    );
    const vertices = this.polygon.getPath().getArray();
    this.polygonOutOfBounds = !vertices.every(point => {
      return LOCA_EXTENT.contains(point);
    });
    return;
  }

  clearBounds() {
    this.polygon.setMap(null);
    this.polygon = null;
    this.polygonArea = null;
    this.polygonOutOfBounds = false;
    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
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
    return {
      location: this.form.controls.location.value,
      bounds: this.areaTab === AreaTabs.DrawArea ? this.getBounds() : null
    };
  }

  setupForm(data: AreaFormModel) {
    // Note that the bounds are managed outside the form
    this.form = this.fb.group({
      location: [data.location, []]
    });

    if (data.bounds) {
      const coords = data.bounds.coordinates[0].slice(0, -1);
      const paths = coords.map(coord => ({lng: coord[0], lat: coord[1]}));
      this.mapsApiLoader.load().then(() => {
        this.setPolygon(new google.maps.Polygon({ paths, editable: true, draggable: true }));
      });
    }
  }

  fromModel(model: Organization): AreaFormModel {
    return {
      location: model.location,
      bounds: model.bounds
   };
  }

  toModel(data: AreaFormModel, model: Organization): Organization {
    model.location = data.location || null;
    model.bounds = data.bounds || null;
    return model;
  }

  getBounds(): Polygon {
    if (this.polygon === null) {
      return null;
    }
    const coords = this.polygon.getPath().getArray().map(p =>
      [p.lng(), p.lat()]
    );
    coords.push(coords[0]);
    return {
      type: 'Polygon',
      coordinates: [coords]
    };
  }
}
