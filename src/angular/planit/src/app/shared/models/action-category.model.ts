export class ActionCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;

  constructor(object: any) {
    Object.assign(this, object);
  }
}
