import type { Model, QueryFilter, UpdateQuery, QueryOptions } from 'mongoose';

/**
 * Generic Database Repository
 * Provides common CRUD operations for Mongoose models.
 * T should be the interface representing the data shape.
 */
export class DBRepo<T> {
    constructor(private model: Model<T>) {}

    async create(data: Partial<T>): Promise<any> {
        return await this.model.create(data);
    }

    async findOne(queryFilter: QueryFilter<T>, options: QueryOptions = {}): Promise<any> {
        return await this.model.findOne(queryFilter, null, options);
    }

    async findById(id: string, options: QueryOptions = {}): Promise<any> {
        return await this.model.findById(id, null, options);
    }

    async findAll(queryFilter: QueryFilter<T> = {}, options: QueryOptions = {}): Promise<any[]> {
        return await this.model.find(queryFilter, null, options);
    }

    async findOneAndUpdate(
        queryFilter: QueryFilter<T>, 
        update: UpdateQuery<T>, 
        options: QueryOptions = { new: true }
    ): Promise<any> {
        return await this.model.findOneAndUpdate(queryFilter, update, options);
    }

    async findOneAndDelete(queryFilter: QueryFilter<T>, options: QueryOptions = {}): Promise<any> {
        return await this.model.findOneAndDelete(queryFilter, options);
    }

    async countDocuments(queryFilter: QueryFilter<T> = {}): Promise<number> {
        return await this.model.countDocuments(queryFilter);
    }

    async exists(queryFilter: QueryFilter<T>): Promise<boolean> {
        const result = await this.model.exists(queryFilter);
        return result !== null;
    }
}
