import { getRecipesCollection } from "./database.js";
import { ObjectId } from "mongodb";
import s3 from "./s3.js";

const resolvers = {
    recipes: async (args: any) => {
        console.log("asking for recipes");
        const {
            mealType,
            cuisine,
            difficulty,
            tags,
            skip = 0,
            limit = 50,
        } = args;
        const collection = await getRecipesCollection();
        const query: any = {};
        if (mealType && mealType.length > 0) {
            query.mealType = { $in: mealType };
        }
        if (cuisine && cuisine.length > 0) {
            query.cuisine = { $in: cuisine };
        }
        if (difficulty && difficulty.length > 0) {
            query.difficulty = { $in: difficulty };
        }
        if (tags && tags.length > 0) {
            query.tags = { $in: tags };
        }

        const recipes = await collection
            .find(query)
            .skip(skip)
            .limit(limit)
            .toArray();
        const totalCount = await collection.countDocuments(query);
        return {
            recipes,
            totalCount,
        };
    },
    recipe: async (args: { _id: string }) => {
        const collection = await getRecipesCollection();
        const recipe = await collection.findOne({
            _id: new ObjectId(args._id),
        });
        if (!recipe) {
            throw new Error(`Recipe with ID ${args._id} not found`);
        }
        return recipe;
    },
    createRecipe: async (args: any) => {
        // check and match password
        const password = args.password;
        if (password !== process.env.PASSWORD) {
            throw new Error("Invalid password");
        }

        const collection = await getRecipesCollection();
        const newRecipe = await collection.insertOne(args);
        console.log(args);
        return {
            _id: newRecipe.insertedId.toString(),
            name: args.name,
            ingredients: args.ingredients,
            instructions: args.instructions,
            prepTimeMinutes: args.prepTimeMinutes,
            cookTimeMinutes: args.cookTimeMinutes,
            servings: args.servings,
            difficulty: args.difficulty,
            cuisine: args.cuisine,
            caloriesPerServing: args.caloriesPerServing,
            tags: args.tags,
            userId: args.userId,
            image: args.image,
            rating: args.rating,
            reviewCount: args.reviewCount,
            mealType: args.mealType,
        };
    },

    bulkRecipeUpload: async (args: any) => {
        const collection = await getRecipesCollection();
        const result = await collection.insertMany(args.recipes);

        return {
            insertedCount: result.insertedCount,
        };
    },

    createSignedUrls: async (args: { imageCount: number }) => {
        const { imageCount } = args;
        const result = [];

        for (let i = 0; i < imageCount; i++) {
            const signedUrl = await s3.create();
            result.push(signedUrl);
        }

        return result;
    },
};

export default resolvers;
