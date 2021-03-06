import { DbAddAccount } from './db-add-account';
import {
    AccountModel,
    AddAccountModel,
    AddAccountRepository,
    Encrypter,
} from './db-add-account-protocols';

const makeEncrypter = (): Encrypter => {
    class EncrypterStub implements Encrypter {
        async encrypt(password: string): Promise<string> {
            return new Promise(resolve => resolve('hashed_password'));
        }
    }

    return new EncrypterStub();
};

const makeAddAccountRepository = (): AddAccountRepository => {
    class AddAccountRepositoryStub implements AddAccountRepository {
        async add(accountData: AddAccountModel): Promise<AccountModel> {
            // eslint-disable-next-line no-use-before-define
            return new Promise(resolve => resolve(makeFakeAccount()));
        }
    }

    return new AddAccountRepositoryStub();
};

const makeFakeAccount = (): AccountModel => ({
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email',
    password: 'hashed_password',
});

const makeFakeAccountData = (): AddAccountModel => ({
    name: 'valid_name',
    email: 'valid_email',
    password: 'valid_password',
});
interface SutTypes {
    sut: DbAddAccount;
    encrypterStub: Encrypter;
    addAccountRepositoryStub: AddAccountRepository;
}

const makeSut = (): SutTypes => {
    const encrypterStub = makeEncrypter();
    const addAccountRepositoryStub = makeAddAccountRepository();
    const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub);

    return {
        sut,
        encrypterStub,
        addAccountRepositoryStub,
    };
};
describe('DbAddAccount usecase', () => {
    test('should call Encrypter with correct password', async () => {
        const { sut, encrypterStub } = makeSut();

        const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');

        const accountData = makeFakeAccountData();
        await sut.add(accountData);
        expect(encryptSpy).toHaveBeenCalledWith(accountData.password);
    });

    test('should throw if encrypter throws', async () => {
        const { sut, encrypterStub } = makeSut();

        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error())),
        );

        const accountData = makeFakeAccountData();

        const promise = sut.add(accountData);
        await expect(promise).rejects.toThrow();
    });

    test('should call AddAccountRepository with correct values', async () => {
        const { sut, addAccountRepositoryStub } = makeSut();

        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');

        const accountData = makeFakeAccountData();

        await sut.add(accountData);
        expect(addSpy).toHaveBeenCalledWith({
            ...accountData,
            password: 'hashed_password',
        });
    });

    test('should throw if addAccountRepository throws', async () => {
        const { sut, addAccountRepositoryStub } = makeSut();

        jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error())),
        );

        const accountData = makeFakeAccountData();

        const promise = sut.add(accountData);
        await expect(promise).rejects.toThrow();
    });

    test('should return an account on success', async () => {
        const { sut } = makeSut();

        const accountData = {
            id: 'valid_id',
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password',
        };
        const account = await sut.add(accountData);
        expect(account).toEqual(makeFakeAccount());
    });
});
