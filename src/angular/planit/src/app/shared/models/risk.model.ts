export class Risk {
  name: string;
  communitySystem: string;
  hazard: string;
  potentialImpact?: number;
  adaptiveCapacity?: number;
  indicators: [{name: string, url: string}];

  constructor(object: Object) {
    Object.assign(this, object);
  }
}
