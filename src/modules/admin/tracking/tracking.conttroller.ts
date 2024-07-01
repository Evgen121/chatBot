import { EmailTracking } from '@/src/db/entities';
import {
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@Controller('admin/trackings')
export class TrackingController {
	constructor(private readonly trackingService: TrackingService) {}

	@Get()
	async allTracking(
		@Query() query: any
	): Promise<{ total: number; data: EmailTracking[] }> {
		const { data, total } = await this.trackingService.allTracking(query);
		return { total, data };
	}

	@Delete(':id')
	async deleteTrackingById(@Param('id') id: string) {
		const deleteTracking = await this.trackingService.deleteTracking(id);
		if (!deleteTracking) {
			throw new NotFoundException(`Tracking not found`);
		}
		return { message: 'Tracking deleted successfully' };
	}
}
