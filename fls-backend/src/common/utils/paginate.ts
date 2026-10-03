import { Model, PopulateOptions } from 'mongoose';
import { PaginatedResponse } from '../dto/paginated-response.js';

export interface PaginateOptions {
  page: number;
  limit: number;
  sort?: Record<string, 1 | -1>;
  populate?: PopulateOptions | PopulateOptions[];
}

export function mapLeanDoc(doc: any): any {
  if (!doc || typeof doc !== 'object') return doc;
  if (doc instanceof Date) return doc;

  if (Array.isArray(doc)) {
    return doc.map(mapLeanDoc);
  }

  const mapped: any = { ...doc };
  if (mapped._id) {
    mapped.id = mapped._id.toString();
    delete mapped._id;
  }
  delete mapped.__v;

  for (const key of Object.keys(mapped)) {
    const val = mapped[key];
    if (val && typeof val === 'object' && !(val instanceof Date)) {
      if (Array.isArray(val)) {
        mapped[key] = val.map((item: any) =>
          item && typeof item === 'object' && item._id
            ? mapLeanDoc(item)
            : item,
        );
      } else if (val._id) {
        mapped[key] = mapLeanDoc(val);
      }
    }
  }

  return mapped;
}

export async function paginate<T>(
  model: Model<any>,
  filter: Record<string, any>,
  options: PaginateOptions,
): Promise<PaginatedResponse<T>> {
  const { page, limit, sort, populate } = options;
  const skip = (page - 1) * limit;

  const [total, docs] = await Promise.all([
    model.countDocuments(filter),
    model
      .find(filter)
      .sort(sort ?? {})
      .skip(skip)
      .limit(limit)
      .populate(populate ?? [])
      .lean()
      .exec(),
  ]);

  const data = (docs as any[]).map(mapLeanDoc) as T[];

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
