import { Module } from '@nestjs/common';
import { OpticalOrdersService } from './optical-orders.service';
import { OpticalOrdersController } from './optical-orders.controller';

@Module({
  controllers: [OpticalOrdersController],
  providers: [OpticalOrdersService],
  exports: [OpticalOrdersService],
})
export class OpticalOrdersModule {}
