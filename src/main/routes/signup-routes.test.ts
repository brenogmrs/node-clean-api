import request from 'supertest';
import app from '../config/app';

describe('SignUp Routes context', () => {
    test('should return an account on success', async () => {
        await request(app)
            .post('/api/signup')
            .send({
                name: 'any_name',
                email: 'any_email@gmail.com',
                password: 'password',
                passwordConfirmation: 'password',
            })
            .expect(200);
    });
});
