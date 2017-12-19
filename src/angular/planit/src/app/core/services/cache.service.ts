import { Injectable } from '@angular/core';

@Injectable()
export class CacheService {
  // A simple in-memory cache for frequently accessed data
  // Kept as a separate service to avoid circular dependency issues

  public static USER = 'user';
  public static ORGANIZATION = 'organization';

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
