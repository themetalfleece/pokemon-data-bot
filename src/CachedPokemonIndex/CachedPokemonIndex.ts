import { Cached } from '../Cached/Cached';
import { request, gql } from 'graphql-request';

export type PokemonIndexData = Array<{
  id: number;
  name: string;
}>;

export class CachedPokemonIndex extends Cached {
  private pokeapiGqlEndpoint = 'https://beta.pokeapi.co/graphql/v1beta';
  private data: PokemonIndexData = [];

  constructor() {
    super();
  }

  public async getData() {
    if (this.isExpired()) {
      const query = gql`
        {
          pokemon_v2_pokemon {
            id
            name
          }
        }
      `;

      const data: {
        pokemon_v2_pokemon: Array<{ id: number; name: string }>;
      } = await request(this.pokeapiGqlEndpoint, query);

      this.setData(data.pokemon_v2_pokemon);
    }

    return this.data;
  }

  private setData(data: PokemonIndexData) {
    this.data = data;
    this.refreshExpiration();
  }
}
