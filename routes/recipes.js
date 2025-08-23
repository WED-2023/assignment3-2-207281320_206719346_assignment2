var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const { mockRandomRecipes } = require("../mock/mockRandomRecipes.js");

router.get("/", (req, res) => res.send("im here"));

router.get("/search", async (req, res, next) => {
  console.log("searching for recipes");
  try {
    const query = req.query.query;
    const number = req.query.number || 5; // default to 5 if not provided

    if (!query) {
      return res.status(400).send({ message: "Search query is required" });
    }
    // Save the last search in the user's session
    if (req.session && req.session.username) {
      req.session.lastSearch = query;
    }

    const results = await recipes_utils.searchRecipes(query, number);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

// Get 3 random recipes
router.get("/random", async (req, res, next) => {
  try {
    const number = req.query.number || 3;
    const randomRecipes = await recipes_utils.getRandomRecipesPreview(number);
    res.send(randomRecipes);
  } catch (error) {
    res.send(mockRandomRecipes); // TODO: call mock data instead of spoonacular for development
    next(error);
  }
});

/**
 * This path returns a full details of a recipe by its id
 */

router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    res.send(mockRandomRecipes[0]); // TODO: call mock data instead of spoonacular for development
    next(error);
  }
});

module.exports = router;
