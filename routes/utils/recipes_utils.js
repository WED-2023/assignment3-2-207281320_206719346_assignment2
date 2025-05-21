const axios = require("axios");
const { response } = require("express");
const api_domain = "https://api.spoonacular.com/recipes";
require('dotenv').config();
const apiKey = process.env.spooncular_apiKey;


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: apiKey
        }
    });
}

async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, analyzedInstructions, extendedIngredients } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        analyzedInstructions: analyzedInstructions || [], // Provide default empty array if undefined
        extendedIngredients: extendedIngredients || [],
    }
}

async function getRecipesPreview(recipe_array){
    const results = [];
    // Use a for loop to iterate over each recipe ID in the recipe_array
    for (let recipe_id of recipe_array) {
        // Fetch the recipe details for each recipe ID
        const recipe_details = await getRecipeDetails(recipe_id.recipeId);
        // Push the fetched details to the results array
        results.push(recipe_details);
    }
    // Return the array containing all the recipe previews
    return results;
}

async function searchRecipes(query, number = 5) {
    const apiKey = process.env.spooncular_apiKey; //
    const response = await axios.get(`${api_domain}/complexSearch`, {
    params: {
      query: query,
      number: number,
      apiKey: apiKey
    }
  });
  return response.data.results;
}
async function getRandomRecipesPreview(number = 3) {
    const apiKey = process.env.spooncular_apiKey;
    const response = await axios.get(`${api_domain}/random`, {
      params: {
        number: number,
        apiKey: apiKey
      }
    });
  
    // Format the IDs into the shape required by getRecipesPreview
    const recipeArray = response.data.recipes.map(recipe => ({
      recipeId: recipe.id
    }));
  
    // Use your utility function to get full recipe details
    return await getRecipesPreview(recipeArray);
  }
  

exports.getRandomRecipesPreview = getRandomRecipesPreview;

exports.searchRecipes = searchRecipes;
exports.getRecipeInformation = getRecipeInformation;

exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview=getRecipesPreview;


