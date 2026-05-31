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

  type UserType {
    _id: ID!
    userName: String
    email: String
    password: String
    phone: String
    age: Int
    profilePic: String
    coverPics: [String]
    role: String
    provider: String
    gender: String
    isEmailConfirmed: Boolean
    createdAt: String
    updatedAt: String
    friends: [UserType]
  }

  type PostType {
    _id: ID!
    content: String
    attachments: [String]
    likes: [ID]
    tags: [ID]
    privacy: String
    userId: ID
    createdAt: String
    updatedAt: String
    likesCount: Int
    isLikedByMe: Boolean
  }

  type Mutation {
    "React (like/unlike) a post"
    reactToPost(postId: ID!): PostType
  }

  type Query {
    getCommentReplies(commentId: ID!): [Comment]
    
    "this for testing"
    getUserProfile(userId: ID): UserType
  }
`;
