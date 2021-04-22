const fetch = require("node-fetch")

const HASURA_OPERATION = `
mutation addIngredient($description: String!, $recipe_id: Int!) {
  insert_ingredients_one(object: {
    description: $description,
    recipe_id: $recipe_id
  }) {
    id
    description
    recipe {
      id
      name
      description
      user {
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
app.post('/addIngredient', async (req, res) => {

  // get request input
  const { description, recipe_id } = req.body.input;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ description, recipe_id });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.insert_ingredients_one
  })

});