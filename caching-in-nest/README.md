# [Caching in Nest](https://www.tomray.dev/nestjs-caching-redis)
Caching is a great and simple technique that helps improve your app's performance. It acts as a temporary data store providing high performance data access.

## Guide to implement Caching in NEST

**STEP 1:** Install Package
```bash
$ npm install @nestjs/cache-manager cache-manager
$ npm install cache-manager-redis-store@2
$ npm install --save-dev @types/cache-manager-redis-store
```

**STEP 2:** Configure Cache module
```javascript
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
```
**STEP 3:** Use Cache service
```javascript
import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PokemonService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async getPokemons() {
    // check cache
    const pokemonKey = 'pokemons:all';
    const cachedData: any = await this.cacheManager.get(pokemonKey);
    if (cachedData) {
      console.log(
        `CACHE-HIT : data fetched from cache for key: "${pokemonKey}"`,
      );
      return JSON.parse(cachedData);
    }
    // fetch from api if not in cache
    console.log(
      `CACHE-MISS : data not found in cache for key: "${pokemonKey}"`,
    );
    const response = await lastValueFrom(
      this.httpService.get('https://pokeapi.co/api/v2/pokemon/?&limit=20'),
    );

    // store in cache
    await this.cacheManager.set(pokemonKey, JSON.stringify(response.data));
    return response.data;
  }
}
```

## Clear Cache
Clear specific cache keys or flush all cache entries
```javascript
// Clear a specific key
await this.cacheManager.del(pokemonKey);

// Flush all cache
await this.cacheManager.reset();
```

