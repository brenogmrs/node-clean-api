import { LogErrorRepository } from '../../data/protocols/log-error-repository';
import { serverError } from '../../presentation/helpers/http-helpers';
import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols';
import { LogControllerDecorator } from './log';

const makeLogErrorRepository = (): LogErrorRepository => {
    class LogErrorRepositoryStub implements LogErrorRepository {
        async log(stack: string): Promise<void> {}
    }

    return new LogErrorRepositoryStub();
};

const makeController = (): Controller => {
    class ControllerSub implements Controller {
        async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
            const httpResponse = {
                statusCode: 200,
                body: {
                    email: 'any_email@gmail.com',
                    name: 'name',
                    password: '123234',
                    passwordConfirmation: '123234',
                },
            };

            // eslint-disable-next-line no-shadow
            return new Promise(resolve => resolve(httpResponse));
        }
    }

    return new ControllerSub();
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

        const httpRequest = {
            body: {
                email: 'any_email@gmail.com',
                name: 'name',
                password: '123234',
                passwordConfirmation: '123234',
            },
        };

        await sut.handle(httpRequest);
        expect(handleSpy).toHaveBeenCalledWith(httpRequest);
    });

    test('should return the same result of the controller', async () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                email: 'any_email@gmail.com',
                name: 'name',
                password: '123234',
                passwordConfirmation: '123234',
            },
        };

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual({
            statusCode: 200,
            body: {
                email: 'any_email@gmail.com',
                name: 'name',
                password: '123234',
                passwordConfirmation: '123234',
            },
        });
    });

    test('should call LogErrorRepository with correct error if controller return an ServerError', async () => {
        const { sut, controllerStub, logErrorRepositoryStub } = makeSut();
        const fakeError = new Error();
        fakeError.stack = 'error_stack_trace';
        const error = serverError(fakeError);

        jest.spyOn(controllerStub, 'handle').mockResolvedValueOnce(error);
        const logSpy = jest.spyOn(logErrorRepositoryStub, 'log');

        const httpRequest = {
            body: {
                email: 'any_email@gmail.com',
                name: 'name',
                password: '123234',
                passwordConfirmation: '123234',
            },
        };

        await sut.handle(httpRequest);
        expect(logSpy).toHaveBeenCalledWith('error_stack_trace');
    });
});
