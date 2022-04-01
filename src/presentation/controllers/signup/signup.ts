import { InvalidParamError, MissingParamError } from '../../errors';
import { badRequest, serverError, ok } from '../../helpers/http-helpers';
import {
    AddAccount,
    Controller,
    EmailValidator,
    HttpRequest,
    HttpResponse,
} from './signup-protocols';

export class SignUpController implements Controller {
    constructor(
        private readonly emailValidator: EmailValidator,
        private readonly addAccount: AddAccount,
    ) {}

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

            const { name, email, password, passwordConfirmation } = httpRequest.body;

            if (password !== passwordConfirmation) {
                return badRequest(new InvalidParamError('passwordConfirmation'));
            }

            const isEmailValid = this.emailValidator.isValid(email);

            if (!isEmailValid) {
                return badRequest(new InvalidParamError('email'));
            }

            const account = this.addAccount.add({
                name,
                email,
                password,
            });

            return ok(account);
        } catch (error) {
            return serverError();
        }
    }
}
