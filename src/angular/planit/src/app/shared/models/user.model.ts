import { Organization } from '../../shared';

export class User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  organizations?: string[];
  primaryOrganization: Organization;
  city?: number;

  constructor(object: Object) {
    Object.assign(this, object);
  }

  public name(): string {
    return this.firstName + ' ' + this.lastName;
  }
}
