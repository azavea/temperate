export class ActionCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  selected?: boolean; // added property used for action step selectable buttons

  constructor(object: any) {
    Object.assign(this, object);
  }
}
