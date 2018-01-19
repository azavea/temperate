import { Organization } from '../../shared';

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
  }

  public name(): string {
    return this.first_name + ' ' + this.last_name;
  }
}
