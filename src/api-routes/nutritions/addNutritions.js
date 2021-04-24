const express = require('express')
const fetch = require("node-fetch")
const router = express.Router()

const HASURA_OPERATION = `
mutation addNutritionInfo($recipe_id: Int!, $prep: Int!, $cook: Int!, $total: Int!, $serving: Int, $yield: String!) {
  insert_nutritionInfo_one(object: {
    prep: $prep
    cook: $cook
    total: $total
    serving: $serving
    yield: $yield
    recipe_id: $recipe_id
  }) {
    id
    prep
    cook
    serving
    recipe_id
    recipe {
      id
      name
      description
      image
      user_id
      user{
        id
        fullname
        email
      }
    }
  }
}
`;

// execute the parent operation in Hasura
const execute = async (variables) => {
  const fetchResponse = await fetch(
    "https://receipeapp.hasura.app/v1/graphql",
    {
      method: 'POST',
      headers: {'x-hasura-admin-secret': 'lbZLZrZ7ya8XoEapSn0F07YXka827Xb3QWAAGis2zwoBYEUWZnvjqBKoSRDqiHf8'},
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
  

// Request Handler
router.post('/addNutritionInfo', async (req, res) => {

  // get request input
  const { recipe_id, prep, cook, total, serving, yield } = req.body;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ recipe_id, prep, cook, total, serving, yield });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.insert_nutritionInfo_one
  })

});

module.exports = router