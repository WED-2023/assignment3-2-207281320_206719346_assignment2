CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(255) PRIMARY KEY,
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  country VARCHAR(100),
  password VARCHAR(255),
  email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS myrecipes (
  recipe_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  summary TEXT,
  readyInMinutes INT,
  servings INT,
  ingredients JSON,
  instructions TEXT,
  analyzedInstructions TEXT,
  image VARCHAR(500),
  vegan TINYINT(1),
  vegetarian TINYINT(1),
  glutenFree TINYINT(1),
  username VARCHAR(255),
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  username VARCHAR(255),
  recipe_id VARCHAR(255),
  PRIMARY KEY (username, recipe_id),
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
