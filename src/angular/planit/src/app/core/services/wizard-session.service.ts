/*
 * A generic session service that stores data of any type, intended for managing
 * data across multiple steps of a form wizard.
 */
import { Injectable } from '@angular/core';

import * as cloneDeep from 'lodash.clonedeep';
import * as isEqual from 'lodash.isequal';
import { Subject } from 'rxjs';

interface DataHandler<T> {
  // This handler has official support for editing the passed T object in place, rather than
  //  returning a new copy.
  toData: (any, T) => T;
  fromData: (T) => any;
}

@Injectable()
export class WizardSessionService<T> {

  private _data: T;
  private handlers: Map<string, DataHandler<T>> = new Map<string, DataHandler<T>>();
  public data: Subject<T> = new Subject<T>();

  getData(): T {
    return this._data;
  }

  registerHandlerForKey(key: string, handlers: DataHandler<T>) {
    this.handlers.set(key, handlers);
  }

  // if notify true, will only notify if data changed. if notify false will never notify
  setDataForKey(key: string, data: any, notify: boolean = true) {
    const oldData = cloneDeep(this._data);
    const handler = this.handlers.get(key);
    this._data = handler.toData(data, this._data);
    if (!isEqual(oldData, this._data) && notify) {
        this.data.next(this._data);
    }
  }

  setData(data: T, notify: boolean = true) {
    this._data = data;
    if (notify) {
      this.data.next(this._data);
    }
  }
}
