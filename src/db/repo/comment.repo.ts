import { CommentModel, type IComment } from '../models/comment.model.js';
import { DBRepo } from './db.repo.js';

class CommentRepo extends DBRepo<IComment> {
    constructor() {
        super(CommentModel);
    }
}

export const commentRepo = new CommentRepo();
