const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favorites values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipe_id from favorites where username='${username}'`);
    return recipes_id;
}

async function addNewRecipe(username, new_recipe) {
    const timestamp = Math.floor(Date.now() / 1000);

    const title = new_recipe.title;
    const summary = new_recipe.summary;
    const readyInMinutes = new_recipe.readyInMinutes;
    const servings = new_recipe.servings;

    const ingredients = JSON.stringify(new_recipe.ingredients);
    const instructions = new_recipe.instructions;
    const analyzedInstructions = JSON.stringify(new_recipe.analyzedInstructions);

    const vegan = new_recipe.vegan ? 1 : 0;
    const vegetarian = new_recipe.vegetarian ? 1 : 0;
    const glutenFree = new_recipe.glutenFree ? 1 : 0;

    await DButils.execQuery(`
        INSERT INTO myrecipes (
            recipe_id, title, summary, readyInMinutes, servings,
            ingredients, instructions, username, analyzedInstructions,
            vegan, vegetarian, glutenFree
        )
        VALUES (
            ${timestamp}, '${title}', '${summary}', ${readyInMinutes}, ${servings},
            '${ingredients}', '${instructions}', '${username}', '${analyzedInstructions}',
            ${vegan}, ${vegetarian}, ${glutenFree}
        )
    `);
}




exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
