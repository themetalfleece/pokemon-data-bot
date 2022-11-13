import { CachedPokemonIndex } from '../CachedPokemonIndex/CachedPokemonIndex';

class PokeData {
  private cachedPokemonIndex = new CachedPokemonIndex();

  public async getPokemonIndex() {
    return this.cachedPokemonIndex.getData();
  }
}

export const pokeData = new PokeData();
