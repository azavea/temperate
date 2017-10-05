export class User {
  first_name: string;
  last_name: string;
  email: string;

  constructor(object: Object) {
    Object.assign(this, object);
  }

  public name(): string {
      return this.first_name + ' ' + this.last_name;
  }
}
