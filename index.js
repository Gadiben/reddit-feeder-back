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
        reject(e);
      }
    });
  });
};

const fetchPostsComments = async (subReddits) => {
  const posts = await Promise.all(
    subReddits.children.map((item) =>
      requestToPromise(
        BASE_URL + "/" + item.data.display_name_prefixed + "/new.json?limit=3"
      )
    )
  );
  let fullData = {};
  subReddits.children.forEach((item) => {
    fullData[item.data.display_name_prefixed] = {
      title: item.data.display_name_prefixed,
      posts: {},
    };
  });
  posts.forEach((subReddit) => {
    if (!subReddit) return;
    subReddit.children.forEach((post) => {
      const postData = post.data;
      fullData[postData.subreddit_name_prefixed].posts[postData.id] = {
        author: postData.author,
        title: postData.title,
        content: postData.selftext,
        thumbnail: postData.thumbnail,
        comments: [],
      };
    });
  });
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

  comments.forEach((post) => {
    if (!post) {
      return;
    }
    const postId = post[0].data.children[0].data.id;
    post[1].data.children.forEach((comment) => {
      const commentData = comment.data;
      if (!commentData.subreddit_name_prefixed) {
        return;
      }

      fullData[commentData.subreddit_name_prefixed].posts[postId].comments.push(
        {
          author: commentData.author,
          content: commentData.body,
        }
      );
    });
  });
  let finalData = Object.values(fullData);
  for (let index = 0; index < finalData.length; index++) {
    finalData[index].posts = Object.values(finalData[index].posts);
  }
  return finalData;
};
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
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

/*
res = {
  "r/Home":{
    title: "r/Home"
    posts:{
      "hfjadv":{
        author:
        title:
        content:
        comments: [
          {
            author:
            content:
          }
        ]
  
      }
    }
  }
}
*/
const resolvers = {
  Query: {
    users: () => users,
    searchReddit: async (parent, args, context, info) => {
      const subReddits = await requestToPromise(
        BASE_URL + "/subreddits/search.json?q=" + args.term
      );
      return fetchPostsComments(subReddits);
    },
    searchPopularReddit: async () => {
      const subReddits = await requestToPromise(
        BASE_URL + "/subreddits/popular.json?limit=10"
      );
      const data = fetchPostsComments(subReddits);
      return data;
    },
    searchNewReddit: async () => {
      const subReddits = await requestToPromise(
        BASE_URL + "/subreddits/new.json?limit=100"
      );
      const data = fetchPostsComments(subReddits);
      return data;
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
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
