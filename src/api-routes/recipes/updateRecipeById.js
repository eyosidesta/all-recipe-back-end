const express = require('express')
const fetch = require("node-fetch")
const ensureToken = require('../../authService.js')
const router = express.Router()

const HASURA_OPERATION = `
mutation updateRecipeById($id: Int!, $changes: recipes_set_input){
  update_recipes_by_pk(pk_columns: {id: $id}, _set: $changes) {
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
router.post('/updateRecipeById', ensureToken, async (req, res) => {

  // get request input
  const id = req.body.id
  const changes = req.body.changes;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ id, changes });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.update_recipes_by_pk
  })

});

module.exports = router