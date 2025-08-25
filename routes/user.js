var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const axios = require("axios"); // Added axios for direct API calls

router.use(async function (req, res, next) {
  if (req.path === "/myrecipes" || req.path.startsWith("/favorites")) {
    next();
    return;
  }

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
 * This path gets body with recipeId and save this recipe in the favorite
 */
router.post("/favorites", async (req, res, next) => {
  try {
    const username = req.body.username || req.session?.username;
    const recipe_id = req.body.recipeId;

    if (!username) {
      return res
        .status(401)
        .send({ message: "Username is required", success: false });
    }

    await user_utils.markAsFavorite(username, recipe_id);
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
    const username = req.query.username || req.session?.username;

    if (!username) {
      return res
        .status(400)
        .send({ message: "username is required", success: false });
    }

    const recipes_id = await user_utils.getFavoriteRecipes(username);

    if (recipes_id.length === 0) {
      return res.status(404).send("No favorites");
    }

    let recipes_id_array = recipes_id.map((element) => ({
      recipeId: element.recipe_id,
    }));

    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path checks if a specific recipe is favorite
 */
router.get("/favorites/:recipeId", async (req, res, next) => {
  try {
    const username = req.query.username || req.session?.username;
    const recipe_id = req.params.recipeId;

    if (!username) {
      return res
        .status(401)
        .send({ message: "Username is required", success: false });
    }

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
    // get username from request body
    const username = req.body.username || req.session?.username;
    const recipe = req.body.recipe;

    if (!username) {
      return res.status(401).send({ message: "User not authenticated" });
    }

    await user_utils.addNewRecipe(username, recipe);
    res.status(200).send("The Recipe successfully saved as myrecipe table");
  } catch (error) {
    next(error);
  }
});

router.get("/myrecipes", async (req, res, next) => {
  try {
    // Try to get username from query
    const username = req.query.username || req.session?.username;

    if (!username) {
      return res.status(401).send({ message: "User not authenticated" });
    }

    const recipes = await user_utils.getMyRecipes(username);
    res.status(200).send(recipes);
  } catch (error) {
    console.error("Error getting recipes:", error);
    next(error);
  }
});

module.exports = router;
