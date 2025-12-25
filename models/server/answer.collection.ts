import { Permission, Role, IndexType } from "node-appwrite";
import { db, answersCollection } from "../name";
import { tableDB } from "./config";

export default async function createAnswersCollection(){
  await tableDB.createTable({
    databaseId : db,
    tableId: answersCollection,
    name: answersCollection,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
  })

  await Promise.all([
    tableDB.createStringColumn({
      databaseId : db,
      tableId : answersCollection,
      key : 'content',
      size : 10000,
      required : true
    }),
    tableDB.createStringColumn({
      databaseId : db,
      tableId : answersCollection,
      key : 'questionId',
      size : 50,
      required : true
    }),
    tableDB.createStringColumn({
      databaseId : db,
      tableId : answersCollection,
      key : 'authorId',
      size : 50,
      required : true
    })
  ])

  await Promise.all([
    tableDB.createIndex({
      databaseId:db,
      tableId: answersCollection,
      key: 'index_1',
      type : IndexType.Fulltext,
      columns : ['content'],
      orders: ['ASC']
    })
  ])
}