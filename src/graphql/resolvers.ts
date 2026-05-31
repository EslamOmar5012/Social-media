import { commentRepo, User, PostModel } from '../db/index.js';
import { Types } from 'mongoose';
import { decrypt, NotFoundError } from '../common/index.js';

export const resolvers = {
  Query: {
    getCommentReplies: async (_: any, { commentId }: { commentId: string }) => {
      if (!Types.ObjectId.isValid(commentId)) {
        return [];
      }
      return await commentRepo.findAll({ 
        commentId: new Types.ObjectId(commentId),
        deletedAt: null 
      });
    },
    getUserProfile: async (_: any, { userId }: { userId?: string }, context: any) => {
      const targetUserId = userId || context.user?._id;
      if (!targetUserId) {
        throw new Error('Unauthorized or User ID not provided');
      }

      if (!Types.ObjectId.isValid(targetUserId.toString())) {
        throw new Error('Invalid User ID');
      }

      const user = await User.findById(targetUserId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    }
  },
  Mutation: {
    reactToPost: async (_: any, { postId }: { postId: string }, context: any) => {
      // 1. Auth check
      if (!context.user) {
        throw new Error('Unauthorized: Please authenticate');
      }

      // 2. Validate postId
      if (!Types.ObjectId.isValid(postId)) {
        throw new Error('Invalid Post ID');
      }

      const userId = context.user._id;

      // 3. Check if user already liked the post
      const post = await PostModel.findById(postId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      const alreadyLiked = post.likes?.some(
        (id) => id.toString() === userId.toString()
      );

      // 4. Toggle like: add if not liked, remove if already liked
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        alreadyLiked
          ? { $pull: { likes: userId } }
          : { $addToSet: { likes: userId } },
        { new: true }
      );

      return updatedPost;
    }
  },
  Comment: {
    id: (parent: any) => parent._id.toString(),
    replies: async (parent: any) => {
      if (!parent._id || !Types.ObjectId.isValid(parent._id.toString())) {
        return [];
      }
      return await commentRepo.findAll({ 
        commentId: parent._id,
        deletedAt: null 
      });
    }
  },
  UserType: {
    _id: (parent: any) => parent._id.toString(),
    userName: (parent: any) => parent.username,
    password: (parent: any) => parent.password,
    phone: (parent: any) => {
      if (!parent.phone) return null;
      try {
        return decrypt(parent.phone);
      } catch (e) {
        return parent.phone;
      }
    },
    friends: async (parent: any) => {
      if (!parent.friends || parent.friends.length === 0) {
        return [];
      }
      return await User.find({ _id: { $in: parent.friends } });
    }
  },
  PostType: {
    _id: (parent: any) => parent._id.toString(),
    userId: (parent: any) => parent.userId?.toString(),
    likes: (parent: any) => parent.likes?.map((id: any) => id.toString()) ?? [],
    tags: (parent: any) => parent.tags?.map((id: any) => id.toString()) ?? [],
    likesCount: (parent: any) => parent.likes?.length ?? 0,
    isLikedByMe: (parent: any, _: any, context: any) => {
      if (!context.user || !parent.likes) return false;
      return parent.likes.some(
        (id: any) => id.toString() === context.user._id.toString()
      );
    }
  }
};
