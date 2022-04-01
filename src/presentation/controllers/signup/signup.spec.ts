import { InvalidParamError, MissingParamError, ServerError } from '../../errors';
import { SignUpController } from './signup';
import {
    AccountModel,
    AddAccount,
    AddAccountModel,
    EmailValidator,
} from './signup-protocols';

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }

    return new EmailValidatorStub();
};

const makeAddAccount = (): AddAccount => {
    class AddAccountStub implements AddAccount {
        add(account: AddAccountModel): AccountModel {
            const fakeAccount = {
                id: 'valid_id',
                name: 'valid_name',
                email: 'valid@email.com',
                password: 'valid_password',
            };

            return fakeAccount;
        }
    }

    return new AddAccountStub();
};

interface SutType {
    sut: SignUpController;
    emailValidatorStub: EmailValidator;
    addAccountStub: AddAccount;
}

const makeSut = (): SutType => {
    const emailValidatorStub = makeEmailValidator();
    const addAccountStub = makeAddAccount();
    const sut = new SignUpController(emailValidatorStub, addAccountStub);

    return {
        sut,
        emailValidatorStub,
        addAccountStub,
    };
};

describe('SignUp Controller', () => {
    test('should return 400 if no name is provided', () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                email: 'any_email@gmail.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };

        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError('name'));
    });

    test('should return 400 if no email is provided', () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                name: 'any_name',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };

        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError('email'));
    });

    test('should return 400 if no password is provided', () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any@email.com',

                passwordConfirmation: 'password',
            },
        };

        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError('password'));
    });

    test('should return 400 if no passwordConfirmation is provided', () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any@email.com',
                password: 'password',
            },
        };

        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(
            new MissingParamError('passwordConfirmation'),
        );
    });

    test('should return 400 if passwordConfirmation fails', () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any@email.com',
                password: 'password',
                passwordConfirmation: 'invalid_password',
            },
        };

        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(
            new InvalidParamError('passwordConfirmation'),
        );
    });

    test('should return 400 if an invalid email is provided', () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValue(false);

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'invalid_email',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };

        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new InvalidParamError('email'));
    });

    test('should call EmailValidator with correct email', () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };

        sut.handle(httpRequest);
        expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com');
    });

    test('should return 500 if EmailValidtor throws a exception', () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementation(() => {
            throw new Error();
        });

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@gmail.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };

        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(500);
        expect(httpResponse.body).toEqual(new ServerError());
    });

    test('should call AddAccount with correct data', () => {
        const { sut, addAccountStub } = makeSut();
        const addSpy = jest.spyOn(addAccountStub, 'add');

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };

        sut.handle(httpRequest);
        expect(addSpy).toHaveBeenCalledWith({
            name: 'any_name',
            email: 'any_email@email.com',
            password: 'password',
        });
    });
});
