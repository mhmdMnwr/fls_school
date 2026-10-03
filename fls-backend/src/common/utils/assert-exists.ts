import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

export async function assertExists(
  model: Model<any>,
  id: string,
  label: string,
): Promise<void> {
  const doc = await model.findById(id).lean().exec();
  if (!doc) {
    throw new NotFoundException(label + ' not found');
  }
}
