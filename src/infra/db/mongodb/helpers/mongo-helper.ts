import { Collection, MongoClient } from 'mongodb';

export const MongoHelper = {
    client: null as MongoClient,
    async connect(uri: string): Promise<void> {
        this.client = await MongoClient.connect(uri);
    },

    async disconnect() {
        this.client.close();
    },

    getCollection(name: string): Collection {
        return this.client.db().collection(name);
    },
    map(dbResponse: any, collection: any): any {
        return {
            id: dbResponse.insertedId.toString(),
            ...collection,
        };
    },
};
