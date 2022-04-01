import { InvalidParamError, MissingParamError } from '../errors';
import { badRequest, serverError } from '../helpers/http-helpers';
import { Controller, EmailValidator, HttpRequest, HttpResponse } from '../protocols';

export class SignUpController implements Controller {
    constructor(private readonly emailValidator: EmailValidator) {}

    handle(httpRequest: HttpRequest): HttpResponse {
        try {
            const requiredFields = [
                'email',
                'name',
                'password',
                'passwordConfirmation',
            ];

            for (const field of requiredFields) {
                if (!httpRequest.body[field]) {
                    return badRequest(new MissingParamError(field));
                }
            }

            if (
                httpRequest.body.password !== httpRequest.body.passwordConfirmation
            ) {
                return badRequest(new InvalidParamError('passwordConfirmation'));
            }

            const isEmailValid = this.emailValidator.isValid(httpRequest.body.email);

            if (!isEmailValid) {
                return badRequest(new InvalidParamError('email'));
            }
        } catch (error) {
            return serverError();
        }
    }
}
