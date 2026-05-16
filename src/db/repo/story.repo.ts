import { StoryModel, type IStory } from '../models/story.model.js';
import { DBRepo } from './db.repo.js';

class StoryRepo extends DBRepo<IStory> {
    constructor() {
        super(StoryModel);
    }
}

export const storyRepo = new StoryRepo();
