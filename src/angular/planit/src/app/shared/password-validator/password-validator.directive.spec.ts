import { FormControl } from '@angular/forms';

import { PasswordValidatorDirective } from './password-validator.directive';

describe('PasswordValidatorDirective', () => {
  let directive: PasswordValidatorDirective;

  beforeEach(() => {
    directive = new PasswordValidatorDirective();
  });

  it('should allow valid passwords', () => {
    expect(directive.validate(new FormControl('mike12345'))).toBeNull();
  });

  it('should disallow entirely numeric passwords', () => {
    expect(directive.validate(new FormControl('11235813'))).toEqual({'entirelyNumeric': true});
  });

  it('should disallow passwords shorter than 8 characters', () => {
    expect(directive.validate(new FormControl('pass1'))).toEqual({
      'minlength': {'requiredLength': 8, 'actualLength': 5}
    });
  });

  it('should disallow passwords similar to user attributes', () => {
    directive.disallowed = ['Alexander'];
    expect(directive.validate(new FormControl('alexander'))).toEqual({'similar': true});
  });

  it('should disallow common passwords', () => {
    expect(directive.validate(new FormControl('password1'))).toEqual({'common': true});
  });

  it('should return multiple errors at once', () => {
    expect(directive.validate(new FormControl('713425'))).toEqual({
      'entirelyNumeric': true, 'minlength': {'requiredLength': 8, 'actualLength': 6}
    });
  });
});
