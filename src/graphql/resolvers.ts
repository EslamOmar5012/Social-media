import { commentRepo } from '../db/index.js';
import { Types } from 'mongoose';

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
  }
};
