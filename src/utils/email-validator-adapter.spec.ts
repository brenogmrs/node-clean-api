import validator from 'validator';

import { EmailValidatorAdapter } from './email-validator-adapter';

jest.mock('validator', () => ({
    isEmail(): boolean {
        return true;
    },
}));

const makeSut = (): EmailValidatorAdapter => {
    return new EmailValidatorAdapter();
};
describe('EmailValidator Adapter', () => {
    test('should return false if validator returns false', async () => {
        const sut = makeSut();
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false);

        const isValid = sut.isValid('invalid_email@gmail.com');

        expect(isValid).toBeFalsy();
    });

    test('should return true if validator returns true', async () => {
        const sut = makeSut();

        const isValid = sut.isValid('invalid_email@mail.com');
        expect(isValid).toBeTruthy();
    });

    test('should call validator with correct email', async () => {
        const sut = makeSut();
        const isEmailSpy = jest.spyOn(validator, 'isEmail');
        sut.isValid('invalid_email@mail.com');
        expect(isEmailSpy).toHaveBeenCalledWith('invalid_email@mail.com');
    });
});
