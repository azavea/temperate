import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, Validators } from '@angular/forms';

import { SequenceMatcher } from 'difflib';

import COMMON_PASSWORDS from './common-passwords';

@Directive({
  selector: '[appPasswordValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: PasswordValidatorDirective, multi: true}]
})
export class PasswordValidatorDirective implements Validator {
  // tslint:disable-next-line:no-input-rename
  @Input('appPasswordValidator') disallowed: string[];

  static common(control) {
    const isCommon = COMMON_PASSWORDS.indexOf(control.value) !== -1;
    return isCommon ? {'common': true} : null;
  }

  static entirelyNumeric(control) {
    const onlyNumeric = /^\d+$/.test(control.value);
    return onlyNumeric ? {'entirelyNumeric': true} : null;
  }

  // Port of Django's UserAttributeSimilarityValidator
  static similar(disallowed: string[]) {
    return (control) => {
      if (!control.value || !disallowed) {
        return null;
      }
      const isAllowed = disallowed.every(disallowedVal => {
        if (!disallowedVal) {
          return true;
        }
        const parts = disallowedVal.split(/\W+/);
        parts.concat(disallowedVal);
        return parts.every(part => {
          const matcher = new SequenceMatcher(null,
            part.toLowerCase(), control.value.toLowerCase());
          return matcher.quickRatio() < 0.7;
        });
      });
      return isAllowed ? null : {'similar': true};
    };
  }

  validate(control: AbstractControl): {[key: string]: any} {
    return Validators.compose([
      Validators.minLength(8),
      PasswordValidatorDirective.common,
      PasswordValidatorDirective.entirelyNumeric,
      PasswordValidatorDirective.similar(this.disallowed),
    ])(control);
  }
}
