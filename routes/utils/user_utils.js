const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id) {
  await DButils.execQuery(
    `insert into favorites values ('${user_id}','${recipe_id}')`
  );
}

async function getFavoriteRecipes(username) {
  const recipes_id = await DButils.execQuery(
    `select recipe_id from favorites where username='${username}'`
  );
  return recipes_id;
}

async function removeFromFavorite(username, recipe_id) {
  await DButils.execQuery(
    `delete from favorites where username='${username}' and recipe_id='${recipe_id}'`
  );
}

async function isRecipeFavorited(username, recipe_id) {
  const result = await DButils.execQuery(
    `select count(*) as count from favorites where username='${username}' and recipe_id='${recipe_id}'`
  );
  return result[0].count > 0;
}

async function addNewRecipe(username, new_recipe) {
  const timestamp = Math.floor(Date.now() / 1000);

  const title = new_recipe.title;
  const summary = new_recipe.summary;
  const readyInMinutes = new_recipe.readyInMinutes;
  const servings = new_recipe.servings;
  const image = new_recipe.image || "";

  // Store ingredients as JSON with amount and name structure
  const ingredients = JSON.stringify(new_recipe.ingredients);
  const instructions = new_recipe.instructions;
  const analyzedInstructions = JSON.stringify(
    new_recipe.analyzedInstructions || []
  );

  const vegan = new_recipe.vegan ? 1 : 0;
  const vegetarian = new_recipe.vegetarian ? 1 : 0;
  const glutenFree = new_recipe.glutenFree ? 1 : 0;

  const query = `
        INSERT INTO myrecipes (
            recipe_id, title, summary, readyInMinutes, servings,
            ingredients, instructions, username, analyzedInstructions,
            image, vegan, vegetarian, glutenFree
        )
        VALUES (
            ${timestamp}, '${title}', '${summary}', ${readyInMinutes}, ${servings},
            '${ingredients}', '${instructions}', '${username}', '${analyzedInstructions}',
            '${image}', ${vegan}, ${vegetarian}, ${glutenFree}
        )
     `;

  await DButils.execQuery(query);
}

async function getMyRecipes(username) {
  const query = `SELECT * FROM myrecipes WHERE username = '${username}' ORDER BY recipe_id DESC`;

  const recipes = await DButils.execQuery(query);

  // Parse JSON fields back to objects
  const parsedRecipes = recipes.map((recipe) => {
    let ingredients = [];
    let analyzedInstructions = [];

    // Parse ingredients from JSON string
    try {
      if (typeof recipe.ingredients === "string") {
        ingredients = JSON.parse(recipe.ingredients || "[]");
      } else if (recipe.ingredients) {
        ingredients = recipe.ingredients;
      } else {
        ingredients = [];
      }
    } catch (e) {
      console.error("Error parsing ingredients:", e);
      ingredients = [];
    }

    // Parse analyzedInstructions from JSON string
    try {
      if (typeof recipe.analyzedInstructions === "string") {
        analyzedInstructions = JSON.parse(recipe.analyzedInstructions || "[]");
      } else if (recipe.analyzedInstructions) {
        analyzedInstructions = recipe.analyzedInstructions;
      } else {
        analyzedInstructions = [];
      }
    } catch (e) {
      console.error("Error parsing analyzedInstructions:", e);
      analyzedInstructions = [];
    }

    return {
      ...recipe,
      ingredients,
      analyzedInstructions,
    };
  });

  return parsedRecipes;
}

async function getMyRecipeById(username, recipeId) {
  const query = `SELECT * FROM myrecipes WHERE username = '${username}' AND recipe_id = ${recipeId}`;

  const recipes = await DButils.execQuery(query);

  if (recipes.length === 0) {
    return null;
  }

  const recipe = recipes[0];

  // Parse JSON fields back to objects
  let ingredients = [];
  let analyzedInstructions = [];

  try {
    if (typeof recipe.ingredients === "string") {
      ingredients = JSON.parse(recipe.ingredients || "[]");
    } else if (recipe.ingredients) {
      ingredients = recipe.ingredients;
    }
  } catch (e) {
    console.error("Error parsing ingredients:", e);
    ingredients = [];
  }

  try {
    if (typeof recipe.analyzedInstructions === "string") {
      analyzedInstructions = JSON.parse(recipe.analyzedInstructions || "[]");
    } else if (recipe.analyzedInstructions) {
      analyzedInstructions = recipe.analyzedInstructions;
    }
  } catch (e) {
    console.error("Error parsing analyzedInstructions:", e);
    analyzedInstructions = [];
  }

  return {
    ...recipe,
    ingredients,
    analyzedInstructions,
  };
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.removeFromFavorite = removeFromFavorite;
exports.isRecipeFavorited = isRecipeFavorited;
exports.addNewRecipe = addNewRecipe;
exports.getMyRecipes = getMyRecipes;
exports.getMyRecipeById = getMyRecipeById;
