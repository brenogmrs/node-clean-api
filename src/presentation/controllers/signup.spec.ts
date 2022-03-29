import SignUpController from './signup';

const makeSut = (): SignUpController => {
    return new SignUpController();
};

describe('SignUp Controller', () => {
    test('should return 400 if no name is provided', () => {
        const sut = makeSut();

        const httpRequest = {
            body: {
                email: 'any_email@gmail.com',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };

        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new Error('Missing param: name'));
    });

    test('should return 400 if no email is provided', () => {
        const sut = makeSut();

        const httpRequest = {
            body: {
                name: 'any_name',
                password: 'password',
                passwordConfirmation: 'password',
            },
        };

        const httpResponse = sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new Error('Missing param: email'));
    });
});
