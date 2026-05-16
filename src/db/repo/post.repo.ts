import { PostModel, type IPost } from '../models/post.model.js';
import { DBRepo } from './db.repo.js';

class PostRepo extends DBRepo<IPost> {
    constructor() {
        super(PostModel);
    }
}

export const postRepo = new PostRepo();
