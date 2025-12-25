import {Client , Account, TablesDB, Avatars, Storage} from 'appwrite';
import env from '@/env';

const client = new Client().setEndpoint(env.appwrite.endpoint).setProject(env.appwrite.projectId);

const tableDB = new TablesDB(client);
const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

// const result = await account.get();
// console.log(result);

export {client, account, tableDB, storage, avatars};