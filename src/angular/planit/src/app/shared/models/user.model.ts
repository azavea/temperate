export class User {
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  organization: string;
  city: number;
  id: number;

  constructor(object: Object) {
    Object.assign(this, object);
  }

  public name(): string {
      return this.firstName + ' ' + this.lastName;
  }
}
