import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const mongoUrl = process.env.MONGO_URI!;
const databaseName = "recipes";
const collectionName = "recipes";

let client: MongoClient;

export async function connectToDatabase() {
    try {
        client = await MongoClient.connect(mongoUrl);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

export async function getRecipesCollection() {
    const db = client.db(databaseName);
    return db.collection(collectionName);
}
