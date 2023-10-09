const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const FirebaseConfig = require('./FirebaseConfig');
const Utilities = require('./utilities.js');

const auth = FirebaseConfig.auth;
const firestore = FirebaseConfig.firestore;

const app = express();

app.use(cors({ origin: true }));

app.use(bodyParser.json());

// ~~RESTFUL CRUD WEB API ENDPOINTS ~~~

app.post('/recipes', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];

  if (!authorizationHeader) {
    res.status(401).send('missing auth header');
    return;
  }

  try {
    await Utilities.authorizeUser(authorizationHeader, auth);
  } catch (error) {
    res.status(401).send(error.message);
    return;
  }

  const newRecipe = req.body;
  const missingFields = Utilities.validateRecipePostPut(newRecipe);

  if (missingFields) {
    res.status(400).send(`Recipe is not valid. Missing/invalid fields: ${missingFields}`);
    return;
  }

  const recipe = Utilities.sanitizeRecipePostPut(newRecipe);

  try {
    const firestoreResponse = await firestore.collection('recipes').add(recipe);

    const recipeId = firestoreResponse.id;

    res.status(201).send({ id: recipeId });
  } catch (error) {
    res.status(400).send(error.message);
  }
});
app.get('/', (req, res) => {
  res.send('Hello from firebase function express API');
});

if (process.env.NODE_ENV !== 'production') {
  //Local dev
  app.listen(3005, () => {
    console.log('API started');
  });
}

module.exports = app;
