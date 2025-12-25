import { questionAttachmentsBucket } from "../name";
import { Permission, Role } from "node-appwrite";
import { storage } from "./config";

export default async function getOrCreateDB(){
    try {
        await storage.getBucket({bucketId : questionAttachmentsBucket})
        console.log("Storage bucket connection established successfully")
    } catch (error) {
        try {
          await storage.createBucket({
            bucketId: questionAttachmentsBucket,
            name: questionAttachmentsBucket,
            permissions: [
              Permission.read(Role.any()),
              Permission.create(Role.users()),
              Permission.update(Role.users()),
              Permission.delete(Role.users())
            ],
            fileSecurity: false,
            allowedFileExtensions: ["jpg", "png", "gif", "jpeg", "webp", "heic"]
          });
          console.log(`Created ${questionAttachmentsBucket} bucket.`)
        } catch (error) {
          console.log("Error connecting or creating Storage bucket", error)
        }
    }
}