import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('server-health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @ApiResponse({ description: 'Check is server ok' })
  @ApiBearerAuth()
  @Get('/http')
  @HealthCheck()
  checkHTTP() {
    return this.health.check([
      () => this.http.pingCheck('google', 'https://google.com'),
    ]);
  }

  @ApiResponse({ description: 'Check is database ok' })
  @ApiBearerAuth()
  @Get('/database')
  @HealthCheck()
  checkTypeOrm() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }

  // @Get('/disk')
  // @HealthCheck()
  // checkDisk() {
  //   return this.health.check([
  //     () =>
  //       this.disk.checkStorage('storage', {
  //         path: 'C:\\',
  //         thresholdPercent: 250 * 1024 * 1024 * 1024,
  //       }),
  //   ]);
  // }

  @ApiResponse({ description: 'Check is memory ok' })
  @ApiBearerAuth()
  @Get('/memory')
  @HealthCheck()
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
