export const typeDefs = `#graphql
  type Comment {
    id: ID!
    content: String!
    attachments: [String]
    likes: [ID]
    tags: [ID]
    postId: ID!
    commentId: ID
    createdBy: ID!
    createdAt: String!
    updatedAt: String!
    replies: [Comment]
  }

  type Query {
    getCommentReplies(commentId: ID!): [Comment]
  }
`;
