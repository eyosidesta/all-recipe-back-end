const express = require('express')
const fetch = require("node-fetch")
const router = express.Router()

const HASURA_OPERATION = `
mutation updateIngredientById($id: Int!, $changes: ingredients_set_input) {
  update_ingredients_by_pk(pk_columns:{id: $id}, _set: $changes) {
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
router.post('/updateIngredientById', async (req, res) => {

  // get request input
  const { id, changes } = req.body;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ id, changes });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.update_ingredients_by_pk
  })

});

module.exports = router