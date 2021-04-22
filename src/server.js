const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cors = require('cors')

const app = express();

const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(cors());


const fetch = require("node-fetch")

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
// const HASURA_AddRecipe_OPERATION = `
// mutation addRecipe($name:String!, $description: String, $image: String!, $user_id: Int!) {
//   insert_recipes_one(object: {
//     name: $name,
//     description: $description,
//     image: $image,
//     user_id: $user_id
//   }) {
//     id
//     name
//     description
//     image
//     user {
//       id
//       fullname
//       email
      
//     }
//   }
// }
// `;

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

// execute the parent operation in Hasura
// const executeAddRecipe = async (variables) => {
//   const fetchResponse = await fetch(
//     "https://receipeapp.hasura.app/v1/graphql",
//     {
//       method: 'POST',
//       headers: {'x-hasura-admin-secret': 'lbZLZrZ7ya8XoEapSn0F07YXka827Xb3QWAAGis2zwoBYEUWZnvjqBKoSRDqiHf8'},
//       body: JSON.stringify({
//         query: HASURA_AddRecipe_OPERATION,
//         variables
//       })
//     }
//   );
//   const data = await fetchResponse.json();
//   console.log('DEBUG: ', data);
//   return data;
// };

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

  // run some business logic
  

  // execute the Hasura operation
  // const secret = req.headers['x-hasura-admin-secret']
  // if Hasura operation errors, then throw error
  const { data, errors } = await executeLogin({ email, password });
  if (errors) {
    return res.status(400).json(errors[0])
  }

  if(data.users.length === 0) {
    console.log("user is not found");
    return res.status(404).json({"err": "user is not found"});
  }
  if(await bcrypt.compare(password, data.users[0].password)) {
    console.log("password is found");
    console.log("user data is: ", data.users)
    // return res.json({"mes": "password is found"});
    return res.status(200).json({...data.users})
  } else {
    console.log("Password is not correct");
    return res.status(401).json({"err": "password is not the correct"})
  }
  // console.log("data is ", data.users[0].password)
  


  // success
  return res.json({
      ...data.users
  })

});

// Request Handler
// app.post('/addRecipe', async (req, res) => {

//   // get request input
//   const { name, description, image, user_id } = req.body;

//   // run some business logic

//   // execute the Hasura operation
//   const { data, errors } = await executeAddRecipe({ name, description, image, user_id });
//   // if Hasura operation errors, then throw error
//   if (errors) {
//     return res.status(400).json(errors[0])
//   }

//   return res.json({
//     ...data.insert_recipes_one
//   })

// });

app.get('/get', (req, res) => {
  res.json({
    wow: "wow"
  })
})

app.post('/hello', async (req, res) => {
  return res.json({
    hello: "world"
  });
});

app.listen(PORT);
