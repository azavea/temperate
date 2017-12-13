export class Risk {
  name: string;
  potentialImpact?: number;
  adaptiveCapacity?: number;

  constructor(object: Object) {
    Object.assign(this, object);
  }
}
