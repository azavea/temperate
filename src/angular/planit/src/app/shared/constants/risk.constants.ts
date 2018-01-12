import { Risk } from '../../shared';

export function isRiskAssessed(risk: Risk): boolean {
  if (risk.probability && risk.frequency && risk.intensity
      && risk.impactMagnitude && risk.adaptiveCapacity) {
    return true;
  }
    return false;
}
