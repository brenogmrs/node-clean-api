import { resolve } from 'path';
import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols';
import { LogControllerDecorator } from './log';

describe('Log Controller Decorator', () => {
    test('should call controller.handle', async () => {
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

        const controllerStub = new ControllerSub();
        const handleSpy = jest.spyOn(controllerStub, 'handle');
        const sut = new LogControllerDecorator(controllerStub);

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
});
