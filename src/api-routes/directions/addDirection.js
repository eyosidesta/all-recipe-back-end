const express = require('express')
const fetch = require("node-fetch");
const router = express.Router()

const HASURA_OPERATION = `
mutation addDirection($description: String!, $recipe_id: Int!) {
  insert_directions_one(object:{
    description: $description
    recipe_id: $recipe_id
  }) {
    id
    description
    recipe_id
    recipe {
      id
      name
      description
      image
      user_id
      user {
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
router.post('/addDirection', async (req, res) => {

  // get request input
  const { description, recipe_id } = req.body;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ description, recipe_id });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.insert_directions_one
  })

});

module.exports = router