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

  describe('similar passwords', () => {
    beforeEach(() => {
      directive.disallowed = ['testclient@example.com', 'Test', 'Client'];
    });

    it('should disallow passwords similar to parts of user attributes', () => {
      expect(directive.validate(new FormControl('example.com'))).toEqual({'similar': true});
      expect(directive.validate(new FormControl('testclien'))).toEqual({'similar': true});
    });

    it('should disallow passwords similar to entirety of any user attributes', () => {
      expect(directive.validate(new FormControl('estclient@example.co'))).toEqual({
        'similar': true
      });
    });

    it('should disallow passwords that exactly match any user attributes', () => {
      expect(directive.validate(new FormControl('testclient@example.com'))).toEqual({
        'similar': true
      });
    });
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
