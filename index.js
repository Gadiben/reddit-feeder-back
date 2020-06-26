const { ApolloServer, gql } = require("apollo-server");
const resolvers = require("./src/resolvers").resolvers;

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type User {
    name: String
    bookmarks: [String]
  }

  type Post {
    title: String!
    content: String
    author: String!
    thumbnail: String
    comments: [Comment]
  }

  type Comment {
    author: String!
    content: String!
  }

  type SubReddit {
    title: String!
    posts: [Post]
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each.
  type Query {
    users: [User]
    searchPopularReddit: [SubReddit]
    searchNewReddit: [SubReddit]
    searchReddit(term: String): [SubReddit]
  }
`;

const users = [
  {
    name: "Paul",
    bookmarks: ["r/AskReddit", "r/AskMen"],
  },
  {
    name: "John",
    bookmarks: ["r/legalAdvice", "r/soccer"],
  },
];
const reddits = [
  {
    title: "r/AskMen",
  },
  {
    title: "r/AskReddit",
  },
];

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);

  // resolvers.Query.searchReddit(null, { term: "earth" })
  //   .then((res) => console.log(res))
  //   .catch((err) => console.log(err));

  resolvers.Query.searchPopularReddit()
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

  // resolvers.Query.searchNewReddit()
  //   .then((res) => console.log(res))
  //   .catch((err) => console.log(err));
});
