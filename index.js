const { ApolloServer, gql } = require("apollo-server");
// const { requestToPromise } = require("./utils");
const Reddit = require("reddit");
const request = require("request");

const requestToPromise = (url) => {
  return new Promise(function (resolve, reject) {
    request(url, {}, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      try {
        // JSON.parse() can throw an exception if not valid JSON
        resolve(JSON.parse(response.body).data);
      } catch (e) {
        reject(e);
      }
    });
  });
};

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type User {
    name: String
    bookmarks: [String]
  }

  type SubReddit {
    title: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    users: [User]
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

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    users: () => users,
    searchReddit: async (parent, args, context, info) => {
      // console.log(args);
      // const res = await reddit.post("/api/search_reddit_names", {
      //   query: args.term,
      // });
      // return res.names.map((el) => {
      //   return { title: el };
      // });
      const res = await requestToPromise(
        "https://www.reddit.com/subreddits/search.json?q=" + args.term
      );
      return res.children.map((el) => {
        return { title: el.data.display_name_prefixed };
      });
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

const reddit = new Reddit({
  username: "GautierDervaux",
  password: "In2&9Fam59Ous0%6",
  appId: "p1O8WVt0THqZ5w",
  appSecret: "K2u3SbP-JcgBT6PU1vydVoCHZgo",
  userAgent: "RedditFeeder/1.0.0 (http://gadiben.github.io)",
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
  request(
    "https://www.reddit.com/subreddits/search.json?q=earth",
    { json: true, q: "earth" },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      console.log(res);
      console.log(res.body);
      console.log(body.explanation);
    }
  );
  resolvers.Query.searchReddit(null, { term: "earth" })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
});
