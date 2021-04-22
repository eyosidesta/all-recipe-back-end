const fetch = require("node-fetch")

const HASURA_AddRecipe_OPERATION = `
mutation addRecipe($name:String!, $description: String, $image: String!, $user_id: Int!) {
  insert_recipes_one(object: {
    name: $name,
    description: $description,
    image: $image,
    user_id: $user_id
  }) {
    id
    name
    description
    image
    user {
      id
      fullname
      email
      
    }
  }
}
`;

const executeAddRecipe = async (variables) => {
  const fetchResponse = await fetch(
    "https://receipeapp.hasura.app/v1/graphql",
    {
      method: 'POST',
      headers: {'x-hasura-admin-secret': 'lbZLZrZ7ya8XoEapSn0F07YXka827Xb3QWAAGis2zwoBYEUWZnvjqBKoSRDqiHf8'},
      body: JSON.stringify({
        query: HASURA_AddRecipe_OPERATION,
        variables
      })
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG: ', data);
  return data;
};

app.post('/addRecipe', async (req, res) => {

  // get request input
  const { name, description, image, user_id } = req.body;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await executeAddRecipe({ name, description, image, user_id });
  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  return res.json({
    ...data.insert_recipes_one
  })

});