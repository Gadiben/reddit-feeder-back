const requestToPromise = require("./utils").requestToPromise;
const dao = require("../postgres-node/dao").dao;
const BASE_URL = "http://www.reddit.com";

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
    bookmarks: async (parent, args, context, info) => {
      const users = await dao.findUserByName(args.userName);
      if (users.length == 1) {
        const bookmarks = await dao.findBookmars(users[0].id);
        return {
          name: args.userName,
          bookmarks: bookmarks.map((el) => el.subreddit),
        };
      } else {
        return {};
      }
    },
    searchReddit: async (parent, args, context, info) => {
      const subReddits = await requestToPromise(
        BASE_URL + "/subreddits/search.json?q=" + args.term
      );
      return fetchPostsComments(subReddits);
    },
    searchPopularReddit: async () => {
      const subReddits = await requestToPromise(
        BASE_URL + "/subreddits/popular.json?limit=100"
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
  Mutation: {
    signup: async (parent, args) => {
      let users = await dao.findUserByName(args.userName);
      if (users.length == 0) {
        await dao.addUser(args.userName);
      }

      users = await dao.findUserByName(args.userName);
      const userId = users[0].id;
      const bookmarks = await dao.findBookmars(userId);
      return {
        name: args.userName,
        bookmarks: bookmarks.map((el) => el.subreddit),
      };
    },
    addBookmark: async (parent, args) => {
      const users = await dao.findUserByName(args.userName);
      if (users.length == 1) {
        const userId = users[0].id;
        await dao.addBookmark(userId, args.subreddit.title);
        const bookmarks = await dao.findBookmars(userId);
        return {
          name: args.userName,
          bookmarks: bookmarks.map((el) => el.subreddit),
        };
      } else {
        return {};
      }
    },
    removeBookmark: async (parent, args) => {
      const users = await dao.findUserByName(args.userName);
      if (users.length == 1) {
        const userId = users[0].id;
        await dao.removeBookmark(userId, args.subreddit.title);
        const bookmarks = await dao.findBookmars(userId);
        return {
          name: args.userName,
          bookmarks: bookmarks.map((el) => el.subreddit),
        };
      } else {
        return {};
      }
    },
  },
};
exports.resolvers = resolvers;
