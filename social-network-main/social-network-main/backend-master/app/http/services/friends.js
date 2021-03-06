const { raw } = require('objection');

const { FriendRequest, User } = require('../../models');
const friendRequestStatus = require('../../enums/friendRequestStatus');
const { getPresignedImageUrl } = require('../../helpers/image');
const { abort } = require('../../helpers/error');

exports.getFriends = async (userId) => {
  const [{ 'count(`id`)': total }] = await FriendRequest.query()
    .where('status', friendRequestStatus.ACCEPTED)
    .andWhere((builder) => builder.where('sender_id', userId)
      .orWhere('receiver_id', userId))
    .count('id');

  const previewFriends = await FriendRequest.query()
    .where('friend_requests.status', friendRequestStatus.ACCEPTED)
    .andWhere((builder) => builder.where('sender_id', userId)
      .orWhere('receiver_id', userId))
    .limit(9)
    .orderBy('friend_requests.id', 'desc')
    .select(raw(`CASE sender_id WHEN ${userId} THEN receiver_id  ELSE sender_id END as friendId`));

  const previewFriendIds = previewFriends.map((friend) => friend.friendId);
  const previewFriendInfos = await User.query()
    .whereIn('id', previewFriendIds)
    .select('full_name', 'avatar_name', 'id');

  const friends = previewFriendInfos.map((friend) => {
    let imgSign = null;
    if (friend.avatar_name) {
      imgSign = getPresignedImageUrl(friend.avatar_name);
    } else {
      imgSign = getPresignedImageUrl(process.env.AWS_DEFAULT_AVATAR);
    }
    return {
      ...friend, avatar_name: imgSign,
    };
  });

  return { friends: { total, data: friends } };
};

exports.myRequest = async ({ userId }) => {
  const friendRequest = await FriendRequest.query()
    .where('receiver_id', userId)
    .where('status', friendRequestStatus.REQUEST)
    .withGraphFetched('sender')
    .modifyGraph('sender', (builder) => {
      builder.select('id', 'full_name', 'avatar_name');
    })
    .orderBy('id', 'desc');

  friendRequest.forEach((req) => {
    if (req.sender) {
      req.sender.avatar_name = getPresignedImageUrl(req.sender.avatar_name || process.env.AWS_DEFAULT_AVATAR);
    }
  });
  return { friendRequest };
};

exports.addFriend = async ({ userId, friendId }) => {
  await FriendRequest.knexQuery()
    .insert({ sender_id: userId, receiver_id: friendId, status: friendRequestStatus.REQUEST })
    .onConflict(['sender_id', 'receiver_id'])
    .merge();
};

exports.acceptFriendRequest = async ({ userId, friendRequestId }) => {
  const friendRequest = await FriendRequest.query().findById(friendRequestId);

  if (friendRequest.receiver_id === userId) {
    await friendRequest.$query().update({
      status: friendRequestStatus.ACCEPTED,
    });
  } else {
    abort('You not have permission');
  }
};
