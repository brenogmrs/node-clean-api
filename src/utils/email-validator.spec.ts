import { EmailValidatorAdapter } from './email-validator';

describe('EmailValidator Adapter', () => {
    test('should return false if validator returns false', async () => {
        const sut = new EmailValidatorAdapter();

        const isValid = sut.isValid('invalid_email@maiç.com');
        expect(isValid).toBeFalsy();
    });
});
