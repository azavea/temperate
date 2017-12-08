export class Risk {
  // TODO: these should be given types once we find out what acceptable values are
  adaptiveNeed?: any;
  name: string;
  potentialImpact?: any;
  adaptiveCapacity?: any;

  constructor(object: Object) {
    Object.assign(this, object);
  }
}
