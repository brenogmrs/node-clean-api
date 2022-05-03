import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols';
import { LogControllerDecorator } from './log';

interface SutTypes {
    sut: LogControllerDecorator;
    controllerStub: Controller;
}

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

const makeSut = (): SutTypes => {
    const controllerStub = makeController();
    const sut = new LogControllerDecorator(controllerStub);

    return {
        sut,
        controllerStub,
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
});
