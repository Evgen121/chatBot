import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { AdminProductModule } from '../admin/product/product.module';

@Module({
	imports: [AdminProductModule],
	controllers: [ProductController],
	providers: [],
})
export class ProductModule {}
