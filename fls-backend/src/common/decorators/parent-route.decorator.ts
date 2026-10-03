import { SetMetadata } from '@nestjs/common';

export const IS_PARENT_ROUTE_KEY = 'isParentRoute';
export const ParentRoute = () => SetMetadata(IS_PARENT_ROUTE_KEY, true);
