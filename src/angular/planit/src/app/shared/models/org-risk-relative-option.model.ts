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
    var k = Object.keys(OrgRiskRelativeOption);
    console.log(k);
    return k.slice(0, k.length - 2); // last values are the strings "keys" and "values" for some reason
  }

  export function values(): string[] {
    var vals: string[] = [];
    for (const val in OrgRiskRelativeOption) {
      if (typeof(OrgRiskRelativeOption[val]) === 'string') {
        vals.push(OrgRiskRelativeOption[val]);
      }
    }
    return vals;
  }
}
