import { Global, Module } from '@nestjs/common';

import { Logger } from './logger';
import { RequestContext } from './logger/request-context';

const services = [Logger, RequestContext];

@Global()
@Module({
  providers: services,
  exports: services,
})
export class CommonModule {}
