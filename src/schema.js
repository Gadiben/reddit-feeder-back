const { gql } = require("apollo-server");
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
exports.typeDefs = typeDefs;
