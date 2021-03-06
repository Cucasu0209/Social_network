/* eslint-disable camelcase */
const { Post, LikePost, Comment } = require('../../models');
const { abort } = require('../../helpers/error');
const postStatusEnum = require('../../enums/postStatus');
const { getPresignedImageUrl } = require('../../helpers/image');

exports.addPost = async ({ userId, content, type }) => {
  try {
    await Post.query().insert({
      user_id: userId,
      content,
      type,
      status: postStatusEnum.OPEN,
    });
  } catch (error) {
    abort(400, 'Cannot add post');
  }
};

exports.getMyPosts = async ({ userId, limit, offset }) => {
  const posts = await Post.query()
    .where({ user_id: userId })
    .andWhereNot('status', postStatusEnum.CLOSED)
    .withGraphFetched('likes')
    .modifyGraph('likes', (builder) => {
      builder.whereNot('user_id', userId).select('id', 'type');
    })
    .withGraphFetched('likes.user')
    .modifyGraph('likes.user', (builder) => {
      builder.select('id', 'full_name');
    })
    .withGraphFetched('me')
    .modifyGraph('me', (builder) => {
      builder.where('user_id', userId);
    })
    .limit(limit)
    .offset(offset)
    .orderBy('id', 'desc');

  const response = posts.map((post) => {
    let imgSign = null;
    if (post.image_name) {
      imgSign = getPresignedImageUrl(post.image_name);
    }
    return {
      ...post, image_name: imgSign,
    };
  });

  return response;
};

exports.likePost = async ({
  type, postId, userId,
}) => {
  await LikePost.knexQuery()
    .insert({ type, post_id: postId, user_id: userId })
    .onConflict(['user_id', 'post_id'])
    .merge();
};

exports.getCommentPost = async ({ postId }) => {
  const comments = await Comment.query()
    .where('post_id', postId)
    .withGraphFetched('user')
    .modifyGraph('user', (builder) => {
      builder.select('id', 'full_name', 'avatar_name');
    })
    .orderBy('id', 'desc');

  const res = comments.map((comment) => (
    {
      ...comment,
      user: {
        ...comment.user,
        avatar_name: getPresignedImageUrl(comment.user.avatar_name || process.env.AWS_DEFAULT_AVATAR),
      },
    }
  ));

  return res;
};

exports.comment = async ({
  content, postId, userId,
}) => {
  await Comment.query()
    .insert({ content, post_id: postId, user_id: userId });
};

exports.getPosts = async ({ userId, limit, offset }) => {
  const posts = await Post.query()
    .whereNot({ user_id: userId })
    .andWhereNot('status', postStatusEnum.CLOSED)
    .withGraphFetched('user')
    .modifyGraph('user', (builder) => {
      builder.select('id', 'full_name', 'avatar_name');
    })
    .withGraphFetched('likes')
    .modifyGraph('likes', (builder) => {
      builder.whereNot('user_id', userId).select('id', 'type');
    })
    .withGraphFetched('likes.user')
    .modifyGraph('likes.user', (builder) => {
      builder.select('id', 'full_name');
    })
    .withGraphFetched('me')
    .modifyGraph('me', (builder) => {
      builder.where('user_id', userId);
    })
    .limit(limit)
    .offset(offset)
    .orderBy('id', 'desc');

  const res = posts.map((post) => ({
    ...post,
    image_name: post.image_name ? getPresignedImageUrl(post.image_name) : null,
    user: {
      ...post.user,
      avatar_name: getPresignedImageUrl(post.user.avatar_name || process.env.AWS_DEFAULT_AVATAR),
    },
  }));

  return res;
};
