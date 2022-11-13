import { Cached } from '../Cached/Cached';

export type PokemonIndexData = Array<{
  id: number;
  name: string;
}>;

export class CachedPokemonIndex extends Cached {
  constructor(private data: PokemonIndexData) {
    super();
  }

  public getData() {
    return this.data;
  }

  public setData(data: PokemonIndexData) {
    this.data = data;
    this.refreshExpiration();
  }
}
