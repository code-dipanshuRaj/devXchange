import { Permission,Role,IndexType } from "node-appwrite";

import { db,questionsCollection } from "../name";
import { tableDB } from "./config";
  
export default async function createQuestionsCollection() {
  await tableDB.createTable({
    databaseId: db,
    tableId: questionsCollection,
    name: questionsCollection,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
  });

  await Promise.all([
    tableDB.createStringColumn({
      databaseId: db,
      tableId: questionsCollection,
      key: 'title',
      size: 255,
      required: true
    }),
    tableDB.createStringColumn({
      databaseId: db,
      tableId: questionsCollection,
      key: 'content', 
      size: 10000,
      required: true
    }),
    tableDB.createStringColumn({
      databaseId: db,
      tableId: questionsCollection,
      key: 'authorId',
      size: 100,
      required: true
    }),
    tableDB.createStringColumn({
      databaseId: db,
      tableId: questionsCollection,
      key: 'tags',
      size: 50,
      required: true,
      xdefault: undefined,
      array: true
    }),
    tableDB.createStringColumn({
      databaseId: db,
      tableId: questionsCollection,
      key: 'attachmentId',
      size: 1000,
      required: false
    })
  ]);
  console.log(`Created ${questionsCollection} collection with columns.`);

  await Promise.all([
    tableDB.createIndex({
    databaseId: db,
    tableId: questionsCollection,
    key: 'title_index',
    type: IndexType.Fulltext,
    columns: ['title'],
    orders: ['ASC']
    }),
    tableDB.createIndex({
    databaseId: db,
    tableId: questionsCollection,
    key: 'content_index',
    type: IndexType.Fulltext,
    columns: ['content'],
    orders: ['ASC']
    }),
  ]);
  console.log(`Created indexes for ${questionsCollection} collection.`);
}