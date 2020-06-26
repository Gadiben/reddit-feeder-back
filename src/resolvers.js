const requestToPromise = require("./utils").requestToPromise;

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
exports.resolvers = resolvers;
