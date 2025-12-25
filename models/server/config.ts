import env from '@/env';
import {Client, Account, Storage, Avatars, TablesDB} from 'node-appwrite';

const client = new Client()
    .setEndpoint(env.appwrite.endpoint)
    .setProject(env.appwrite.projectId)
    .setKey(env.appwrite.apikey) 
;

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const tableDB = new TablesDB(client);

export {client, account, storage, avatars, tableDB};
