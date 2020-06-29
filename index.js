const { ApolloServer } = require("apollo-server");
const resolvers = require("./src/resolvers").resolvers;
const typeDefs = require("./src/schema").typeDefs;
const dao = require("./postgres-node/dao").dao;

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
