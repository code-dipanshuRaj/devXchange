import { tableDB } from "./config";
import { db, dbname } from "../name";

export default async function createDBIfNotExists() {
  try {
    await tableDB.create({
      databaseId: db,
      name: dbname,
    });
    console.log(`Database with Database ID '${db}' and name '${dbname}' created successfully.`);
  }catch (error) {
    console.log(`Database with Database ID '${db}' already exists or could not be created.`, error);
  }
}