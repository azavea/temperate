import { Injectable } from '@angular/core';

@Injectable()
export class CacheService {
  // A simple in-memory cache for frequently accessed data
  // Kept as a separate service to avoid circular dependency issues

  // Naming convention: MODULE_SERVICE_VAR for clarity and uniqueness
  public static CORE_USERSERVICE_USER = 'user';
  public static CORE_ACTIONTYPESERVICE_LIST = 'core.actiontypeservice.list';

  private data: { [index: string]: any } = {};

  set(key: string, value: any) {
    this.data[key] = value;
  }

  get(key: string): any {
    return this.data[key];
  }

  delete(key: string) {
    delete this.data[key];
  }

}
