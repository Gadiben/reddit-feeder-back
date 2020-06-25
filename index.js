const { ApolloServer, gql } = require("apollo-server");
// const { requestToPromise } = require("./utils");
const Reddit = require("reddit");
const request = require("request");

const BASE_URL = "http://www.reddit.com";

const requestToPromise = (url, deep, verbose) => {
  return new Promise(function (resolve, reject) {
    request(encodeURI(url), {}, function (error, response, body) {
      if (verbose) {
        console.log(url);
        console.log(error);
        // console.log(response.body);
      }
      if (error) {
        return reject(error);
      }
      try {
        // JSON.parse() can throw an exception if not valid JSON
        if (deep) {
          resolve(JSON.parse(response.body));
        } else {
          resolve(JSON.parse(response.body).data);
        }
      } catch (e) {
        console.log("Error parsing json");
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

  type Post {
    title: String! #title
    content: String #selftext ou selftext_html
    author: String! #author_fullname
    #comments: [Comment]
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

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    users: () => users,
    searchReddit: async (parent, args, context, info) => {
      const subReddits = await requestToPromise(
        BASE_URL + "/subreddits/search.json?q=" + args.term
      );
      const posts = await Promise.all(
        subReddits.children.map((item) =>
          requestToPromise(
            BASE_URL +
              "/" +
              item.data.display_name_prefixed +
              "/new.json?limit=3"
          )
        )
      );

      const commentsLink = posts.flatMap((sub) => {
        return sub ? sub.children.map((post) => post.data.permalink) : null;
      });

      const comments = await Promise.all(
        commentsLink.map((link) => {
          return link
            ? requestToPromise(BASE_URL + link + ".json?limit=5&depth=1", true)
            : null;
        })
      );

      // const replies = posts.child
      return posts;

      // return subReddits.children.map(async (el) => {
      //   let posts = await requestToPromise(
      //     "https://www.reddit.com/" +
      //       el.data.display_name_prefixed +
      //       "/new.json"
      //   );
      //   return {
      //     title: el.data.display_name_prefixed,
      //     posts: posts.children.map((el) => {
      //       return {
      //         title: el.title,
      //         content: el.selftext,
      //         author: el.author_fullname,
      //       };
      //     }),
      //   };
      // });
    },
    searchPopularReddit: async () => {
      const res = await requestToPromise(
        BASE_URL + "/subreddits/popular.json?limit=100"
      );
      return res.children.map((el) => {
        return { title: el.data.display_name_prefixed };
      });
    },
    searchNewReddit: async () => {
      const res = await requestToPromise(
        BASE_URL + "/subreddits/new.json?limit=100"
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

  resolvers.Query.searchPopularReddit()
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

  resolvers.Query.searchNewReddit()
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
});
