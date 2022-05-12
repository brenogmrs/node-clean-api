import { LogErrorRepository } from '../../data/protocols/log-error-repository';
import { AccountModel } from '../../domain/models/account';
import { serverError, ok } from '../../presentation/helpers/http-helpers';
import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols';
import { LogControllerDecorator } from './log';

const makeLogErrorRepository = (): LogErrorRepository => {
    class LogErrorRepositoryStub implements LogErrorRepository {
        async log(stack: string): Promise<void> {
            return new Promise(resolve => resolve());
        }
    }

    return new LogErrorRepositoryStub();
};

const makeController = (): Controller => {
    class ControllerSub implements Controller {
        async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
            // eslint-disable-next-line no-use-before-define
            return new Promise(resolve => resolve(ok(makeFakeAccount())));
        }
    }

    return new ControllerSub();
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

const makeFakeServerError = (): HttpResponse => {
    const fakeError = new Error();
    fakeError.stack = 'error_stack_trace';

    return serverError(fakeError);
};

interface SutTypes {
    sut: LogControllerDecorator;
    controllerStub: Controller;
    logErrorRepositoryStub: LogErrorRepository;
}

const makeSut = (): SutTypes => {
    const controllerStub = makeController();
    const logErrorRepositoryStub = makeLogErrorRepository();
    const sut = new LogControllerDecorator(controllerStub, logErrorRepositoryStub);

    return {
        sut,
        controllerStub,
        logErrorRepositoryStub,
    };
};

describe('Log Controller Decorator', () => {
    test('should call controller.handle', async () => {
        const { sut, controllerStub } = makeSut();

        const handleSpy = jest.spyOn(controllerStub, 'handle');

        const httpRequest = makeFakeRequest();

        await sut.handle(httpRequest);
        expect(handleSpy).toHaveBeenCalledWith(httpRequest);
    });

    test('should return the same result of the controller', async () => {
        const { sut } = makeSut();

        const httpRequest = makeFakeRequest();

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(ok(makeFakeAccount()));
    });

    test('should call LogErrorRepository with correct error if controller return an ServerError', async () => {
        const { sut, controllerStub, logErrorRepositoryStub } = makeSut();

        jest.spyOn(controllerStub, 'handle').mockResolvedValueOnce(
            makeFakeServerError(),
        );
        const logSpy = jest.spyOn(logErrorRepositoryStub, 'log');

        const httpRequest = makeFakeRequest();

        await sut.handle(httpRequest);
        expect(logSpy).toHaveBeenCalledWith('error_stack_trace');
    });
});
