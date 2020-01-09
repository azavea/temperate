import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
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
import { pointerMove } from 'ol/events/condition';
import { containsCoordinate } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import OLPolygon from 'ol/geom/Polygon';
import { DrawEvent } from 'ol/interaction/Draw';
import { transformExtent } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorTileSource from 'ol/source/VectorTile';
import { getArea } from 'ol/sphere';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay';
import { Observable, Subscription, of as observableOf } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

import { LOCA_EXTENT, WEB_MERCATOR, WGS84 } from '../../../../core/constants/map';
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
  @ViewChild('overlayPopup', {static: false}) overlayPopup: ElementRef;

  public wgs84 = WGS84;
  public webMercator = WEB_MERCATOR;

  public form: FormGroup;
  public popupOverlay: Overlay;
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
  public showTribalAreas = false;
  public showCounties = false;
  public showOverlayLabel = true;
  public areaNames = [];
  // tslint:disable-next-line:max-line-length
  public tribalAreasVectorUri = 'https://temperate-tiles.s3.amazonaws.com/tribalareas/{z}/{x}/{y}.pbf';
  public countiesVectorUri = 'https://temperate-tiles.s3.amazonaws.com/counties/{z}/{x}/{y}.pbf';

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
    this.setupMap();
  }

  checkPolygon() {
    const SQ_M_PER_SQ_MI = 0.0000003861;

    this.polygonArea = getArea(this.polygon) * SQ_M_PER_SQ_MI;

    const extent = transformExtent(LOCA_EXTENT, WGS84, WEB_MERCATOR);
    this.polygonOutOfBounds = !this.polygon.getCoordinates()[0].every(point => {
      return containsCoordinate(extent, point);
    });
    return;
  }

  onTranslating() {
    this.showOverlayLabel = false;
    this.checkPolygon();
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
    return this.polygon && this.polygonArea < this.maxArea && !this.polygonOutOfBounds;
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
          admin: model.location.properties.admin || model.creator_location_admin,
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

  styleTribalFeature(feature: Feature) {
    return new Style({
      stroke: new Stroke({
        color: '#85c005',
        width: '2'
      }),
      fill: new Fill({
        color: '#dddddd'
      })
    });
  }

  styleCountyFeature(feature: Feature) {
    return new Style({
      stroke: new Stroke({
        color: '#8186d9',
        width: '2'
      }),
      fill: new Fill({
        color: '#dddddd'
      })
    });
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
      this.setupMap();
    }
  }

  private setupMap() {
    this.drawingStarted = false;
    componentLoaded(this.map).subscribe((olmap: OLMapComponent) => {
      addBasemapToMap(olmap.instance, 3);
      this.setupOverlayPopup(olmap);
    });
    componentLoaded(this.bounds).subscribe(bounds => {
      if (this.polygon) {
        bounds.instance.getSource().addFeature(new Feature({ geometry: this.polygon }));
      }
    });
  }

  private setupOverlayPopup(olmap: OLMapComponent) {
    if (this.popupOverlay) {
      olmap.instance.removeOverlay(this.popupOverlay);
    }

    this.popupOverlay = new Overlay({
      element: this.overlayPopup.nativeElement,
      offset: [9, 9]
    });
    // This tells the map where to find the overlay; we control its appearance and content in
    // the event handler below.
    olmap.instance.addOverlay(this.popupOverlay);

    // Populate the overlay with the name(s) of the feature(s) that the cursor is over
    olmap.instance.on('pointermove', (evt) => {
      if (!(this.showTribalAreas || this.showCounties) || evt.dragging) {
        return;
      }
      const pixel = olmap.instance.getEventPixel(evt.originalEvent);
      const tribalFeatures = this.getFeaturesAtPixel(olmap, pixel, this.tribalAreasVectorUri);
      const countyFeatures = this.getFeaturesAtPixel(olmap, pixel, this.countiesVectorUri);
      if ((!tribalFeatures || tribalFeatures.length === 0)
          && (!countyFeatures || countyFeatures.length === 0)) {
        this.showOverlayLabel = false;
        return;
      }

      this.areaNames = [
        ...new Set(tribalFeatures.map((feature) => feature.get('NAMELSAD'))),
        ...new Set(countyFeatures.map((feature) => feature.get('NAME') + ' County'))
      ];
      this.showOverlayLabel = true;
      this.popupOverlay.setPosition(evt.coordinate);
    });
  }

  private getFeaturesAtPixel(olmap: OLMapComponent, pixel, uri) {
    return olmap.instance.getFeaturesAtPixel(pixel, {
      // Don't check features in layers that are not the area layers.
      layerFilter: (layer) => {
        const source = layer.getSource();
        if (source instanceof VectorTileSource) {
          return source.getUrls().includes(uri);
        }
        return false;
      }
    });
  }
}
