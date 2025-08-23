var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

router.use(async function (req, res, next) {
  // Skip authentication for recipe routes - we'll get username from request body/query
  if (req.path === "/myrecipes") {
    next();
    return;
  }

  // For other routes, use session authentication
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM users")
      .then((users) => {
        if (users.find((x) => x.username === req.session.username)) {
          req.username = req.session.username;
          next();
        } else {
          res.sendStatus(401);
        }
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.sendStatus(401);
  }
});

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post("/favorites", async (req, res, next) => {
  try {
    const user_id = req.session.username;
    console.log(user_id);
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id, recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get("/favorites", async (req, res, next) => {
  try {
    const username = req.session.username;

    if (!username) {
      return res
        .status(400)
        .send({ message: "username is required", success: false });
    }
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    if (recipes_id.length === 0) {
      console.log("No favorites");
      return res.status(404).send("No favorites");
    }
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path removes a recipe from the favorites list of the logged-in user
 */
router.delete("/favorites/:recipeId", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.params.recipeId;
    await user_utils.removeFromFavorite(username, recipe_id);
    res.status(200).send("The Recipe successfully removed from favorites");
  } catch (error) {
    next(error);
  }
});

/**
 * This path checks if a specific recipe is favorited by the logged-in user
 */
router.get("/favorites/:recipeId", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.params.recipeId;
    const isFavorited = await user_utils.isRecipeFavorited(username, recipe_id);
    res.status(200).json({ isFavorited });
  } catch (error) {
    next(error);
  }
});

router.get("/last-search", (req, res) => {
  if (!req.session || !req.session.username) {
    return res.status(401).send({ message: "User not logged in" });
  }

  const lastSearch = req.session.lastSearch;
  if (!lastSearch) {
    return res.status(404).send({ message: "No last search found" });
  }

  res.send({ lastSearch });
});

router.post("/myrecipes", async (req, res, next) => {
  try {
    console.log("=== Recipe Creation Request ===");
    console.log("Username from body:", req.body.username);
    console.log("Username from session:", req.session?.username);
    console.log("Recipe data:", req.body.recipe);

    // Try to get username from request body first, then from session
    const username = req.body.username || req.session?.username;
    const recipe = req.body.recipe;

    if (!username) {
      console.log("No username found");
      return res.status(401).send({ message: "User not authenticated" });
    }

    await user_utils.addNewRecipe(username, recipe);
    console.log("Recipe saved successfully");
    res.status(200).send("The Recipe successfully saved as myrecipe table");
  } catch (error) {
    console.error("Error creating recipe:", error);
    next(error);
  }
});

router.get("/myrecipes", async (req, res, next) => {
  try {
    console.log("=== Get My Recipes Request ===");
    console.log("Username from query:", req.query.username);
    console.log("Username from session:", req.session?.username);

    // Try to get username from query parameters first, then from session
    const username = req.query.username || req.session?.username;

    if (!username) {
      console.log("No username found");
      return res.status(401).send({ message: "User not authenticated" });
    }

    const recipes = await user_utils.getMyRecipes(username);
    console.log("Found recipes:", recipes.length);
    res.status(200).send(recipes);
  } catch (error) {
    console.error("Error getting recipes:", error);
    next(error);
  }
});

module.exports = router;
