const fetch = require("node-fetch")
const express = require('express')
const router = express.Router() 

const HASURA_OPERATION = `
mutation deleteRating($id: Int!) {
  delete_rating_by_pk(id: $id) {
    id
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
router.post('/deleteRating', async (req, res) => {

  // get request input
  const { id } = req.body;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ id });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.delete_rating_by_pk
  })

});

module.exports = router