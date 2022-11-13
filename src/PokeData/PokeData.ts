import { request, gql } from 'graphql-request';
import { CachedPokemonIndex } from '../CachedPokemonIndex/CachedPokemonIndex';

class PokeData {
  private pokeapiGqlEndpoint = 'https://beta.pokeapi.co/graphql/v1beta';

  private pokemonIndex = new CachedPokemonIndex([]);

  public async getPokemonIndex() {
    if (this.pokemonIndex.isExpired()) {
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

      this.pokemonIndex.setData(data.pokemon_v2_pokemon);
    }

    return this.pokemonIndex;
  }
}

export const pokeData = new PokeData();
