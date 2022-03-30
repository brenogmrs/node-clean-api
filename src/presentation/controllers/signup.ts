import { InvalidParamError } from '../errors/invalid-param-error';
import { MissingParamError } from '../errors/missing-param-error';
import { badRequest } from '../helpers/http-helpers';
import { Controller } from '../protocols/controller';
import { EmailValidator } from '../protocols/emailValidator';
import { HttpRequest, HttpResponse } from '../protocols/http';

export class SignUpController implements Controller {
    private readonly emailValidator: EmailValidator;

    constructor(emailValidator: EmailValidator) {
        this.emailValidator = emailValidator;
    }

    handle(httpRequest: HttpRequest): HttpResponse {
        const requiredFields = ['email', 'name', 'password', 'passwordConfirmation'];

        for (const field of requiredFields) {
            if (!httpRequest.body[field]) {
                return badRequest(new MissingParamError(field));
            }
        }

        const isEmailValid = this.emailValidator.isValid(httpRequest.body.emal);

        if (!isEmailValid) {
            return badRequest(new InvalidParamError('email'));
        }
    }
}
