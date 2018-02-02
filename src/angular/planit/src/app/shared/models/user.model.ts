import { Organization } from './organization.model';

export class User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  organizations?: string[];
  primary_organization: Organization;
  city?: number;

  constructor(object: Object) {
    Object.assign(this, object);
    // create new organization object; otherwise it is just JSON
    if (this.primary_organization) {
      this.primary_organization = new Organization(this.primary_organization);
    }
  }

  public name(): string {
    return this.first_name + ' ' + this.last_name;
  }
}
