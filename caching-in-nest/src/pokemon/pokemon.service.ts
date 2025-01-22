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
