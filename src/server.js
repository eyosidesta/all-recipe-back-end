const express = require("express");
const jwt = require('jsonwebtoken')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cors = require('cors')
const ensureToken = require('./authService.js')
const recipe = require('./api-routes/recipes/addRecipe.js')
const getRecipe = require('./api-routes/recipes/getRecipes')
const updateRecipe = require('./api-routes/recipes/updateRecipeById')
const deleteRecipe = require('./api-routes/recipes/deleteRecipe')
const getRecipeById = require('./api-routes/recipes/getRecipeById')

const addIngredient = require('./api-routes/ingredients/addIngredient')
const getIngredients = require('./api-routes/ingredients/getIngredients')
const getIngredient = require('./api-routes/ingredients/getIngredient')
const updateIngredient = require('./api-routes/ingredients/updateIngredient')
const deleteIngredient = require('./api-routes/ingredients/deleteIngredient')

const addDirection = require('./api-routes/directions/addDirection')
const getDirections = require('./api-routes/directions/getDirections')
const getDirectionById = require('./api-routes/directions/getDirectionById')
const updateDirection = require('./api-routes/directions/updateDirection')
const deleteDirection = require('./api-routes/directions/deleteDirection')

const addComment = require('./api-routes/comments/addComment')
const getComments = require('./api-routes/comments/getComments')
const getCommentById = require('./api-routes/comments/getCommentById')
const updateComment = require('./api-routes/comments/updateComment')
const deleteComment = require('./api-routes/comments/deleteComment')

const addFavorite = require('./api-routes/favorites/addFavorite')
const getFavorites = require('./api-routes/favorites/getFavorites')
const getFavoriteById = require('./api-routes/favorites/getFavoriteById')
const deleteFavorite = require('./api-routes/favorites/deleteFavorite')

const addRating = require('./api-routes/ratings/addRating')
const getRatings = require('./api-routes/ratings/getRatings')
const getRatingById = require('./api-routes/ratings/getRatingById')
const deleteRating = require('./api-routes/ratings/deleteRating')

const addNutrition = require('./api-routes/nutritions/addNutritions')
const getNutritions = require('./api-routes/nutritions/getNutritions')
const getNutritionById = require('./api-routes/nutritions/getNutrition')
const updateNutrition = require('./api-routes/nutritions/updateNutrition')
const deleteNutrition = require('./api-routes/nutritions/deleteNutrition')

const addIMadeIt = require('./api-routes/i-made-it/addIMadeIt')
const getImadeIt = require('./api-routes/i-made-it/getIMadeIt')
const getImadeItById = require('./api-routes/i-made-it/getIMadeItById')
const deleteIMadeIt = require('./api-routes/i-made-it/deleteIMadeIt')

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());


const fetch = require("node-fetch");
const { json } = require("body-parser");

const HASURA_OPERATION = `
mutation addUser($fullname: String!, $email: String!, $password: String!) {
  insert_users_one(object:  {
    fullname: $fullname, email: $email,
    password: $password
  }){
      id
      fullname
  }
}
`;

const HASURA_LOGIN_OPERATION = `
query getLogin($email: String!, $password: String!) {
  users(where: {password: {_neq: $password}, email: {_eq: $email}}) {
    fullname
    email
    password
  }
}
`;

// execute the parent operation in Hasura
const execute = async (variables) => {
  const fetchResponse = await fetch(
    "https://receipeapp.hasura.app/v1/graphql",
    {
      method: 'POST',
      headers: {
      	'x-hasura-admin-secret': 'lbZLZrZ7ya8XoEapSn0F07YXka827Xb3QWAAGis2zwoBYEUWZnvjqBKoSRDqiHf8'},
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      })
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG: ', data);
  return data;
};

// execute the parent operation in Hasura
const executeLogin = async (variables) => {
  const fetchResponse = await fetch(
    "https://receipeapp.hasura.app/v1/graphql",
    {
      method: 'POST',
      headers: {'x-hasura-admin-secret': 'lbZLZrZ7ya8XoEapSn0F07YXka827Xb3QWAAGis2zwoBYEUWZnvjqBKoSRDqiHf8'},
      body: JSON.stringify({
        query: HASURA_LOGIN_OPERATION,
        variables
      })
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG: ', data);
  return data;
};


// Request Handler
app.post('/signup', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();

    const { fullname, email } = req.body;
    const password = await bcrypt.hash(req.body.password, salt);
    
    // const secret = req.headers['x-hasura-admin-secret']
    const { data, errors } = await execute({ fullname, email, password });

    if (errors) {
      console.log('error')
      return res.status(400).json(errors[0])
    }
    console.log("data is found")
    return res.json({
      ...data.insert_users_one
    })
  } catch(err){
  	console.log("error is: ", err)
    res.status(500).send();
  }

});

// Request Handler
app.post('/getLogin', async (req, res) => {

  // get request input
  const { email, password } = req.body;

  const { data, errors } = await executeLogin({ email, password });
  if (errors) {
    return res.status(400).json(errors[0])
  }

  if(data.users.length === 0) {
    console.log("user is not found");
    return res.status(404).json({"err": "user is not found"});
  }
  
  if(await bcrypt.compare(password, data.users[0].password)) {
    const token = jwt.sign({users: data.users}, process.env.ACCESS_TOKEN_SECRET)
    console.log("password is found");
    console.log("user data is: ", data.users);
    
    console.log("token is: ",token)
    return res.status(200).json({...data.users, token: token})
  } else {
    console.log("Password is not correct");
    return res.status(401).json({"err": "password is not the correct"})
  }

  
  
  // success
  return res.json({
      ...data.users,
      access_token: token
  })

});

// function ensureToken(req, res, next) {
//   const authHeader = req.get("authHeader")
//   console.log("header", authHeader)
//   console.log("authHeader is_found? ", authHeader===undefined)
//   // return
//   if(authHeader !== undefined) {
//     const barearToken = authHeader.split(" ")
//     const token = barearToken[1]
//     if(!token) {
//       return res.sendStatus(403)
       
//     }
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
//       if(err) {
//         res.sendStatus(403)
//       }
//       req.token = token
//       req.user = data
//       next()
//     })
//   } else {
//     return res.sendStatus(403)
//   }
// }

app.get('/get', ensureToken, function (req, res) {
  res.json({
    get_tey_benatsh: req.user,
    access_token: req.token,
    wow: "wow"
  })
  
})

app.post('/hello', async (req, res) => {
  return res.json({
    hello: "world"
  });
});


app.use('/', recipe)
app.use('/', getRecipe)
app.use('/', updateRecipe)
app.use('/', deleteRecipe)
app.use('/', getRecipeById)

app.use('/', addIngredient)
app.use('/', getIngredients)
app.use('/', getIngredient)
app.use('/', updateIngredient)
app.use('/', deleteIngredient)

app.use('/', addDirection)
app.use('/', getDirections)
app.use('/', getDirectionById)
app.use('/', updateDirection)
app.use('/', deleteDirection)

app.use('/', addComment)
app.use('/', getComments)
app.use('/', getCommentById)
app.use('/', updateComment)
app.use('/', deleteComment)

app.use('/', addFavorite)
app.use('/', getFavorites)
app.use('/', getFavoriteById)
app.use('/', deleteFavorite)

app.use('/', addRating)
app.use('/', getRatings)
app.use('/', getRatingById)
app.use('/', deleteRating)

app.use('/', addNutrition)
app.use('/', getNutritions)
app.use('/', getNutritionById)
app.use('/', updateNutrition)
app.use('/', deleteNutrition)

app.use('/', addIMadeIt)
app.use('/', getImadeIt)
app.use('/', getImadeItById)
app.use('/', deleteIMadeIt)


app.listen(PORT);
