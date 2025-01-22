import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PokemonModule } from './pokemon/pokemon.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 5 * 60 * 1000, // 5 minutes
    }),
    PokemonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
