import validator from 'validator';

import { EmailValidatorAdapter } from './email-validator';

jest.mock('validator', () => ({
    isEmail(): boolean {
        return true;
    },
}));
describe('EmailValidator Adapter', () => {
    test('should return false if validator returns false', async () => {
        const sut = new EmailValidatorAdapter();
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false);

        const isValid = sut.isValid('invalid_email@gmail.com');

        expect(isValid).toBeFalsy();
    });

    test('should return true if validator returns true', async () => {
        const sut = new EmailValidatorAdapter();

        const isValid = sut.isValid('invalid_email@maiç.com');
        expect(isValid).toBeTruthy();
    });
});
