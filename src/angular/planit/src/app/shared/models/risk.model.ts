export class Risk {
  name: string;
  communitySystem: string;
  hazard: string;
  potentialImpact?: number;
  adaptiveCapacity?: number;

  constructor(object: Object) {
    Object.assign(this, object);
  }
}
