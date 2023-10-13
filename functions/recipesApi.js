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
app.get('/recipes', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  const queryObject = req.query;
  const category = queryObject['category'] ? queryObject['category'] : '';
  const orderByField = queryObject['orderByField'] ? queryObject['orderByField'] : '';
  const orderByDirection = queryObject['orderByDirection']
    ? queryObject['orderByDirection']
    : 'asc';
  const pageNumber = queryObject['pageNumber'] ? queryObject['pageNumber'] : '';
  const perPage = queryObject['perPage'] ? queryObject['perPage'] : '';

  let isAuth = false;
  let collectionRef = firestore.collection('recipes');

  try {
    await Utilities.authorizeUser(authorizationHeader, auth);
    isAuth = true;
  } catch (error) {
    collectionRef = collectionRef.where('isPublished', '==', true);
    console.log(error.message);
  }

  if (category) collectionRef = collectionRef.where('category', '==', category);
  if (orderByField) collectionRef.orderBy(orderByField, orderByDirection);
  if (perPage) collectionRef = collectionRef.limit(Number(perPage));
  if (pageNumber > 0 && perPage) {
    const pageNumberMultiplier = pageNumber - 1;
    const offset = pageNumberMultiplier * perPage;
    collectionRef = collectionRef.offset(offset);
  }

  let recipeCount = 0;
  let countDocRef;

  if (isAuth) {
    countDocRef = firestore.collection('recipeCounts').doc('all');
  } else {
    countDocRef = firestore.collection('recipeCounts').doc('published');
  }

  const countDoc = await countDocRef.get();

  if (countDoc.exists) {
    const countDocData = countDoc.data();
    if (countDocData) recipeCount = countDocData.count;
  }

  try {
    const firestoreResponse = await collectionRef.get();
    console.log('______firestoreResponse.size______', firestoreResponse.size);
    // const countFetchedRecipes = firestoreResponse
    const fetchedRecipes = firestoreResponse.docs.map((recipe) => {
      const id = recipe.id;
      const data = recipe.data();
      data.publishDate = data.publishDate._seconds;

      return { ...data, id };
    });

    const payload = {
      recipeCount,
      documents: fetchedRecipes,
    };

    res.status(200).send(payload);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.put('/recipes/:id', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];

  if (!authorizationHeader) {
    res.status(401).send('Missing auth header');
    return;
  }

  try {
    await Utilities.authorizeUser(authorizationHeader, auth);
  } catch (error) {
    res.status(401).send(error.message);
    return;
  }

  const id = req.params.id;
  const newRecipe = req.body;
  const missingFields = Utilities.validateRecipePostPut(newRecipe);

  if (missingFields) {
    res.status(400).send(`Recipe is not valid. Missing/invalid fields: ${missingFields}`);
    return;
  }

  const recipe = Utilities.sanitizeRecipePostPut(newRecipe);

  try {
    await firestore.collection('recipes').doc(id).set(recipe);

    res.status(200).send({ id });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.delete('/recipes/:id', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];

  if (!authorizationHeader) {
    res.status(401).send('Missing auth header');
    return;
  }

  console.log('______authorizationHeader______', authorizationHeader);

  try {
    await Utilities.authorizeUser(authorizationHeader, auth);
  } catch (error) {
    console.log('______error______', error);
    res.status(401).send(error.message);
  }

  const id = req.params.id;

  console.log('______id______', id);

  try {
    await firestore.collection('recipes').doc(id).delete();
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error.message);
  }
});

if (process.env.NODE_ENV !== 'production') {
  //Local dev
  app.listen(3005, () => {
    console.log('API started');
  });
}

module.exports = app;
