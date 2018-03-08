// The adaptive need tooltip box expects these to be declared in ascending severity
export enum OrgRiskRelativeOption {
  Unsure = 'unsure',
  Low = 'low',
  ModeratelyLow = 'mod low',
  Moderate = 'moderate',
  ModeratelyHigh = 'mod high',
  High = 'high'
}

// takes a risk enum value and returns an integer between 0 and 4, or undefined if 'Unsure'
export function relativeOptionToNumber(val: OrgRiskRelativeOption): number | undefined {
  if (val === OrgRiskRelativeOption.Low) {
    return 0;
  } else if (val === OrgRiskRelativeOption.ModeratelyLow) {
    return 1;
  } else if (val === OrgRiskRelativeOption.Moderate) {
    return 2;
  } else if (val === OrgRiskRelativeOption.ModeratelyHigh) {
    return 3;
  } else if (val === OrgRiskRelativeOption.High) {
    return 4;
  } else {
    // unsure
    return undefined;
  }
}

// Takes a number and converts back to OrgRiskRelativeOption
export function numberToRelativeOption(val?: number): OrgRiskRelativeOption {
  if (val === 0) {
    return OrgRiskRelativeOption.Low;
  } else if (val === 1) {
    return OrgRiskRelativeOption.ModeratelyLow;
  } else if (val === 2) {
    return OrgRiskRelativeOption.Moderate;
  } else if (val === 3) {
    return OrgRiskRelativeOption.ModeratelyHigh;
  } else if (val === 4) {
    return OrgRiskRelativeOption.High;
  } else {
    return OrgRiskRelativeOption.Unsure;
  }
}
