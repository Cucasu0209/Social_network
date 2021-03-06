const { Message, User } = require('../../models');
const { getPresignedImageUrl } = require('../../helpers/image');
const { abort } = require('../../helpers/error');

exports.getFriendMessages = async ({
  friendId, userId, cursor, limit,
}) => {
  const messagesQuery = Message.query();
  const userInfo = await User.query().findById(friendId).select('id', 'full_name', 'avatar_name');

  if (!userInfo) abort('user not found');
  userInfo.avatar_name = getPresignedImageUrl(userInfo.avatar_name || process.env.AWS_DEFAULT_AVATAR);

  if (cursor) {
    messagesQuery.where('id', '<', cursor);
  }

  messagesQuery.where((builder) => builder.where('sender_id', userId).andWhere('receiver_id', friendId))
    .orWhere((builder) => builder.where('sender_id', friendId).andWhere('receiver_id', userId))
    .orderBy('id', 'desc')
    .limit(limit)
    .select('id', 'content', 'sender_id', 'created_at');

  const response = await messagesQuery;

  return {
    userInfo,
    messages: response,
    nextCursor: response.length === limit ? response[response.length - 1].id : false,
  };
};
