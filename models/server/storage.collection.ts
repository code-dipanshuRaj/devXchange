import { questionAttachmentsBucket } from "../name";
import { Permission, Role } from "node-appwrite";
import { storage } from "./config";

let storageInitialized = false;
let storageInitializationPromise: Promise<void> | null = null;

export default async function getOrCreateStorage(): Promise<void> {
    if (storageInitialized) {
        return;
    }

    if (storageInitializationPromise) {
        return storageInitializationPromise;
    }

    storageInitializationPromise = (async () => {
        try {
            // Quick check if bucket exists 
            await storage.getBucket({bucketId : questionAttachmentsBucket});
            console.log("Storage bucket connection verified");
            storageInitialized = true;
        } catch (error) {
            // Bucket doesn't exist, creating bucket
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
                console.log(`Created ${questionAttachmentsBucket} bucket.`);
                storageInitialized = true;
            } catch (createError) {
                console.error("Error creating Storage bucket:", createError);
                throw createError;
            }
        }
    })();

    return storageInitializationPromise;
}