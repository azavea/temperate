// The adaptive need tooltip box expects these to be declared in ascending severity
export enum OrgRiskRelativeOption {
  Unsure = 'unsure',
  Low = 'low',
  ModeratelyLow = 'mod low',
  Moderate = 'moderate',
  ModeratelyHigh = 'mod high',
  High = 'high'
}

export namespace OrgRiskRelativeOption {
  // get the enum keys and values. see:
  // https://stackoverflow.com/a/39813213/8202149
  export function keys(): string[] {
    const k = Object.keys(OrgRiskRelativeOption);
    // last two values are the strings "keys" and "values", the function names
    return k.slice(0, k.length - 2);
  }

  export function values(): string[] {
    const vals: string[] = [];
    for (const val in OrgRiskRelativeOption) {
      if (typeof(OrgRiskRelativeOption[val]) === 'string') {
        vals.push(OrgRiskRelativeOption[val]);
      }
    }
    return vals;
  }
}
