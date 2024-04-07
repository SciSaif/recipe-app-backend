import express, { Express } from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { buildSchema } from "graphql";
import { connectToDatabase } from "./database.js";
import cors from "cors";
import resolvers from "./resolvers.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function startServer() {
    const app: Express = express();

    await connectToDatabase();

    app.use(cors());

    const schemaFile = path.join(__dirname, "schema.graphql");
    const schemaContent = fs.readFileSync(schemaFile, "utf-8");
    const schema = buildSchema(schemaContent);

    app.use(
        "/graphql",
        createHandler({
            schema: schema,
            rootValue: resolvers,
        })
        // graphqlHTTP({
        //     schema: schema,
        //     rootValue: resolvers,
        //     graphiql: true,
        // })
    );

    app.listen(4000, () => {
        console.log("GraphQL server running on http://localhost:4000/graphql");
    });
}

startServer();
