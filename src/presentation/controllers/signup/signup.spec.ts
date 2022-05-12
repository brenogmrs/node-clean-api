/* eslint-disable no-promise-executor-return */
import { InvalidParamError, MissingParamError, ServerError } from '../../errors';
import { SignUpController } from './signup';
import {
    AccountModel,
    AddAccount,
    AddAccountModel,
    EmailValidator,
    HttpRequest,
} from './signup-protocols';
import { ok, serverError, badRequest } from '../../helpers/http-helpers';

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
        async add(account: AddAccountModel): Promise<AccountModel> {
            // eslint-disable-next-line no-use-before-define
            return new Promise(resolve => resolve(makeFakeAccount()));
        }
    }

    return new AddAccountStub();
};

const makeFakeRequest = (): HttpRequest => ({
    body: {
        name: 'any_name',
        email: 'valid@email.com',
        password: 'password',
        passwordConfirmation: 'password',
    },
});

const makeFakeAccount = (): AccountModel => ({
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid@email.com',
    password: 'valid_password',
});

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
    test('should return 400 if no name is provided', async () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                email: 'any_email@gmail.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(badRequest(new MissingParamError('name')));
    });

    test('should return 400 if no email is provided', async () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                name: 'any_name',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(badRequest(new MissingParamError('email')));
    });

    test('should return 400 if no password is provided', async () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any@email.com',
                passwordConfirmation: 'password',
            },
        };

        const httpResponse = await sut.handle(httpRequest);

        expect(httpResponse).toEqual(badRequest(new MissingParamError('password')));
    });

    test('should return 400 if no passwordConfirmation is provided', async () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any@email.com',
                password: 'password',
            },
        };

        const httpResponse = await sut.handle(httpRequest);

        expect(httpResponse).toEqual(
            badRequest(new MissingParamError('passwordConfirmation')),
        );
    });

    test('should return 400 if passwordConfirmation fails', async () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any@email.com',
                password: 'password',
                passwordConfirmation: 'invalid_password',
            },
        };

        const httpResponse = await sut.handle(httpRequest);

        expect(httpResponse).toEqual(
            badRequest(new InvalidParamError('passwordConfirmation')),
        );
    });

    test('should return 400 if an invalid email is provided', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValue(false);

        const httpRequest = makeFakeRequest();

        const httpResponse = await sut.handle(httpRequest);

        expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')));
    });

    test('should call EmailValidator with correct email', async () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

        const httpRequest = makeFakeRequest();

        await sut.handle(httpRequest);
        expect(isValidSpy).toHaveBeenCalledWith('valid@email.com');
    });

    test('should return 500 if EmailValidtor throws a exception', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementation(() => {
            throw new Error();
        });

        const httpRequest = makeFakeRequest();

        const httpResponse = await sut.handle(httpRequest);

        expect(httpResponse).toEqual(serverError(new ServerError(null)));
    });

    test('should call AddAccount with correct data', async () => {
        const { sut, addAccountStub } = makeSut();
        const addSpy = jest.spyOn(addAccountStub, 'add');

        const httpRequest = makeFakeRequest();

        await sut.handle(httpRequest);
        expect(addSpy).toHaveBeenCalledWith({
            name: 'any_name',
            email: 'valid@email.com',
            password: 'password',
        });
    });

    test('should return 500 if addAccount throws a exception', async () => {
        const { sut, addAccountStub } = makeSut();
        jest.spyOn(addAccountStub, 'add').mockImplementation(async () => {
            return new Promise((resolve, reject) => reject(new Error()));
        });

        const httpRequest = makeFakeRequest();

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(serverError(new ServerError(null)));
    });

    test('should return 200 if valid data is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = makeFakeRequest();

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(ok(makeFakeAccount()));
    });
});
