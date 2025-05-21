var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM users").then((users) => {
      if (users.find((x) => x.username === req.session.username)) {
        req.username = req.session.username;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.username;
    console.log(user_id);
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;

    if (!username) {
      return res.status(400).send({ message: 'username is required', success: false });
    }
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    if (recipes_id.length === 0){
      console.log("No favorites");
      return res.status(404).send("No favorites");
    }
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
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

module.exports = router;
