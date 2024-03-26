import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: +5432,
  username: 'postgres',
  password: 'Shadowagain6!',
  database: 'excel',
  entities: ['entity/**/.model.ts'],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'custom_migration_table',
  synchronize: true,
});
