# Lyrical-GraphQL

Starter project from a GraphQL course on Udemy.com

## Install

---

1. In command line traverse to the location you want the file stored in then run:

```
$ git clone https://github.com/cbass2404/graphql_apollo_test
$ cd graphql_apollo_test
$ npm install
```

2. In the server > config directory, create a file called dev.js and using MongoDB.com initialize a project, server cluster, and collection. Connect to the collection, set up whitelist IPs, set up user name/password, connect to app. Inside that window it will give you an address. Replace the MONGO_URI value with that string, replacing the <password> section with the password you set up in the connection step. Inside that file add the following:

```javascript
module.exports = {
    MONGO_URI: "mongoGeneratedURL",
};
```

_Note, you must replace the MongoDB URL given in the above entry and include the password_
