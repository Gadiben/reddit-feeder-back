const { ApolloServer, gql } = require("apollo-server");
const resolvers = require("./src/resolvers").resolvers;
const dao = require("./postgres-node/dao").dao;
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  input SubredditInput {
    title: String!
  }

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
    bookmarks(userName: String): User
    searchPopularReddit: [SubReddit]
    searchNewReddit: [SubReddit]
    searchReddit(term: String): [SubReddit]
  }

  type Mutation {
    signup(userName: String!): User
    addBookmark(subreddit: SubredditInput!, userName: String!): User
    removeBookmark(subreddit: SubredditInput!, userName: String!): User
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
  // console.log(typeDefs);
  // resolvers.Mutation.addBookmark(null, {
  //   subreddit: { title: "r/AskReddit" },
  //   userName: "gautier",
  // })
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  resolvers.Mutation.signup(null, {
    userName: "testUser",
  })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
  // resolvers.Mutation.removeBookmark(null, {
  //   subreddit: { title: "r/AskReddit" },
  //   userName: "gautier",
  // })
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  // resolvers.Query.bookmarks(null, { userName: "gutier" })
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  // dao
  //   .findBookmars(1)
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => console.log(err));

  // resolvers.Query.searchPopularReddit()
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  // resolvers.Query.searchNewReddit()
  //   .then((res) => console.log(res))
  //   .catch((err) => console.log(err));
});
