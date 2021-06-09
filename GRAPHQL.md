## GraphQL

---

_To make a quick test server use [json-server](https://github.com/typicode/json-server)_

[React Cache Updates](dev.apollodata.com/react/cache-updates.html)

> Why does GraphQL exist?

### Rest-ful Routing:

---

    -   Given a collection of records on a server, there should be a uniform URL and HTTP request method used to utilize that collection of records
    -   CRUD functionality (Create, Read, Update, Destroy)(POST, GET, PUT/PATCH, DELETE)

Example:

```
URL         Method      Operation
/users      POST        Create a new user
/users      GET         Fetch a list of all users
/users/23   GET         Fetch details on user with ID 23
/users/23   PUT/PATCH   Update details of user with ID 23
/users/23   DELETE      Delete user with ID 23
```

_Put overwrites the entire entry, Patch updates specified pieces_

### Shortcomings of Rest-ful routing:

---

-   Deep nesting can cause issues when showing relational data between structures and multiple users
-   Getting around these issues severely breaks rest-ful conventions in some cases
-   Trying to get around these issues can cause a severe over serve of data to the client

> What is GraphQL?

-   It tries to solve the shortcomings of rest-ful routing
-   Attempts to only pull the data needed for the need instead of entire queries then only using part of the data

> How do we use GraphQL?

-   Normally express just takes a response and sends it back, however with graphql it asks if the request is asking for graphql and if it does it passes the request to graphql to handle before receiving it back to the client

-   It can be used to make http requests to an outside api

## Install and Use

---

1. Traverse to the file you want to put it in then run the command:

```
$ npm init
$ npm install --save express express-graphql graphql lodash
```

2. Set up the file to use graphQl:

```javascript
const express = require("express");
const { graphqlHTTP } = require("express-graphql");

const app = express();
app.use("/graphql", graphqlHTTP({ graphiql: true }));

app.listen(4000, () => {
    console.log("Listening");
});
```

3. setup schema file:

```javascript
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLInt } = graphql;

const UserType = new GraphQLObjectType({
    name: "User",
    fields: {
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
    },
});
```

-   name field tells graphql the name of the model
-   fields tells graphql the data structure of that model
    -   You must tell graphql what the type of the data is inside fields like above

4. Setup rootquery so graphql knows where to start at:

```javascript
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return _.find(users, { id: args.id });
            },
        },
    },
});
```

-   the most important part of the rootquery is the resolve function (parentValue rarely used)

5. Merge into graphql object and export the schema into main file:

```javascript
module.exports = new GraphQLSchema({
    query: RootQuery,
});
// index.js
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");

const app = express();
app.use("/graphql", graphqlHTTP({ schema, graphiql: true }));

app.listen(4000, () => {
    console.log("Listening");
});
```

_graphiql is only used for development purposes_

6. At this point going to localhost:port#/graphql should pull up a user interface graphiql tool:

-   documentation explorer grows as you add more schema to the server
-   you can write queries in the interface to see how data is structured in graphql

```javascript
{
  user(id: "23") {
    firstName
    company {
      id
      name
      description
    }
  }
}
```

_Occasionally graphiql will bug out and stop working right, rewrite the return field object and it should start working again_

-   line 2 specifies the field object, with the argument to find it by id: "23"
-   line 3 tells it which fields you want returned from that object
-   you have to enter some kind of argument in queries or it will not work

7. Resolve can also work asynchronously to call to outside servers through HTTP requests:

```javascript
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios
                    .get(`http://localhost:3000/users/${args.id}`)
                    .then((res) => res.data);
            },
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios
                    .get(`http://localhost:3000/companies/${args.id}`)
                    .then((res) => res.data);
            },
        },
    },
});
```

-   A quirk of using axios with graphql is they both return in data objects
    -   Using them together usually ends with response.data.data
    -   Best practice is to return resp.data and then go to the next step to eliminate the extra nest

8. To add relationships between two schemas we add it in ourselves as follows:

```javascript
const UserType = new GraphQLObjectType({
    name: "User",
    fields: {
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return axios
                    .get(
                        `http://localhost:3000/companies/${parentValue.companyId}`
                    )
                    .then((res) => res.data);
            },
        },
    },
});
```

-   Resolve is only required on issues that have different names between the data model and the data type trying to be used
-   ParentValue looks into the value of the parent
    -   console.log(parentValue) is a good way to see what it is you need to use

9. Resolving circular references in graphql:

```javascript
const CompanyType = new GraphQLObjectType({
    name: "Company",
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios
                    .get(
                        `http://localhost:3000/companies/${parentValue.id}/users`
                    )
                    .then((res) => res.data);
            },
        },
    }),
});
```

-   wrap the references fields section in an arrow function as above

10. You can name queries to specify their use on the frontend:

```javascript
query findCompaniesUsers {
  company(id: "2"){
    name
    description
    users {
      firstName
      age
      company {
        id
      }
    }
  }
}
```

-   Or you can assign nested queries in keys:

```javascript
{
  company(id: "2"){
    name
    description
    users {
      firstName
      age
      company {
        id
      }
    }
  }
  apple(id: "1"){
    name
    description
    users {
      firstName
      age
      company {
        id
      }
    }
  }
}
```

-   Use query fragments as follows:

```javascript
{
  google(id: "2"){
    ...companyDetails
  }
  apple(id: "1"){
    ...companyDetails
  }
}

fragment companyDetails on Company {
    id
    name
    description
}
```

_fragment name on type: type checks the fragment to make sure you aren't breaking data structure rules_

11. Using GraphQL to modify data through mutations:

```javascript
const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, { firstName, age }) {
                return axios
                    .post(`http://localhost:3000/users`, { firstName, age })
                    .then((res) => res.data);
            },
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { id }) {
                return axios
                    .delete(`http://localhost:3000/users/${id}`)
                    .then((res) => res.data);
            },
        },
        editUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, args) {
                return axios
                    .patch(`http://localhost:3000/users/${id}`, args)
                    .then((res) => res.data);
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
});
```

-   GraphQLNonNull makes the item required to create a new entry
-   Be sure to tell the export that you are using a mutation type

-   Mutations are called as below:

```javascript
mutation{
    addUser(firstName: "Stephen", age: 26){
        id
        firstName
        age
    }
}

mutation{
    deleteUser(id: "sMxrg7I"){
    id
  }
}

mutation{
    editUser(id: "23", age: 34){
    id
    firstName
    age
  }
}
```

## Lokka Apollo vs Relay (GraphQL Clients)

---

-   Lokka
    -   As simple as possible
    -   Basic queries, mutations
    -   Some simple caching
-   Apollo
    -   Produced by the same guys as MeteorJS
    -   Good balance between features and complexity
    -   Full stack (Frontend and Backend, no express)
-   Relay
    -   Amazing performance for mobile
    -   By far the most complex

## Apollo vs GraphQL Server

---

-   Neither inherently better than the other
-   GraphQL less likely to get big changes
-   GraphQL maintained by facebook
-   GraphQL co-locates all properties with resolve functions, apollo seperates them in different files

## Client Side (Apollo)

---

-   Apollo Store and Provider are key parts of the apollo client

    -   Apollo Store is the primary storage location for data coming from graphql
    -   Apollo Store is client side agnostic, you need the provider (react-apollo) to make it care
    -   Apollo provider is what takes data from the store and injects it into the React application
    -   Apollo operates on assumptions that you are following the general convention of calling client/graphql

-   Needed packages for apollo use are:
    -   apollo-client
    -   react-apollo

```javascript
import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-client";
import { ApolloProvider } from "react-apollo";

const client = new ApolloClient({});

const Root = () => {
    return (
        <ApolloProvider client={client}>
            <div>Lyrical</div>
        </ApolloProvider>
    );
};

ReactDOM.render(<Root />, document.querySelector("#root"));
```

-   Import the following into a file to make graphql queries:

```javascript
import gql from "graphql-tag";

const query = gql`
    {
        songs {
            title
        }
    }
`;
```

-   Now bond the component and query together as below:

```javascript
import { graphql } from "react-apollo";

export default graphql(query)(SongList);
```

-   The above import is the glue that bonds the query and component together

-   If something has already been rendered once and redirected back to that page, it will not do it again automatically

-   To add variables from inside components to the mutation do the following:

```javascript
import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

const Component = ({ mutate }) => {
    const onSubmit = (e) => {
        e.preventDefault();

        mutate({
            variables: {
                title: this.state.title,
            },
        });
    };

    return <div>React Stuff </div>;
};

const mutation = gql`
    mutation AddSong($title: String) {
        addSong(title: $title) {
            id
            title
        }
    }
`;

export default graphql(mutation)(Component);
```

-   This setup instantiates variables into the mutation
-   When wrapping a mutation you get an object called props.mutate
-   One issue is that Apollo does not automatically know to fetch data again if you add a new record

```javascript
this.props
    .mutate({
        variables: {
            title: this.state.title,
        },
        refetchQueries: [{ query: fetchSongsQuery }],
    })
    .then(() => hashHistory.push("/"));
```

-   This tells it to run this query again before redirecting
-   refetchQueries has two arguments, query variables for the query

```javascript
refetchQueries: [{ query: fetchSongsQuery, variables: { title: "bugga boo" } }];
```

-   Delete mutations with queries, graphql does not take two arguments so you have to nest it

```javascript
export default graphql(mutation)(graphql(fetchSongsQuery)(SongList));
```

-   use refetchQueries when you need to call a query on another component, if it is the same component use the following:

```javascript
onSongDelete(id) {
        this.props
            .mutate({
                variables: { id },
            })
            .then(() => this.props.data.refetch());
    }
```

-   If you call a query that requires a variable, do it like this
    -   queries happen right away
    -   mutations wait until you call them

```javascript
export default graphql(fetchSong, {
    options: (props) => {
        return { variables: { id: props.params.id } };
    },
})(SongDetail);
```
