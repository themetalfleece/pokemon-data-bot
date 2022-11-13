import { Cached } from '../Cached/Cached';
import { request, gql } from 'graphql-request';

export type PokemonIndex = {
  id: number;
  name: string;
};

export type PokemonData = {
  id: number;
  name: string;
};

export class CachedPokemonData extends Cached {
  private pokeapiGqlEndpoint = 'https://beta.pokeapi.co/graphql/v1beta';

  private pokemonIndex: PokemonIndex[] = [];
  private pokemonDataById: Record<string, PokemonData> = {};
  private pokemonIdsByName: Record<string, number> = {};

  private async validateCache() {
    if (this.isActive()) {
      return;
    }

    const query = gql`
      {
        pokemon_v2_pokemon {
          id
          pokemon_v2_pokemonspecy {
            pokemon_v2_pokemonspeciesnames(where: { language_id: { _eq: 9 } }) {
              name
            }
          }
        }
      }
    `;

    const data: {
      pokemon_v2_pokemon: Array<{
        id: number;
        pokemon_v2_pokemonspecy: {
          pokemon_v2_pokemonspeciesnames: [
            {
              name: string;
            },
          ];
        };
      }>;
    } = await request(this.pokeapiGqlEndpoint, query);

    this.pokemonIndex = data.pokemon_v2_pokemon.map((pokemon) => ({
      id: pokemon.id,
      name: pokemon.pokemon_v2_pokemonspecy.pokemon_v2_pokemonspeciesnames[0]
        .name,
    }));

    this.pokemonDataById = {};

    this.pokemonIdsByName = {};

    this.refreshExpiration();
  }

  private async getPokemonIdByName(name: string) {
    await this.validateCache();

    if (this.pokemonIdsByName[name]) {
      return this.pokemonIdsByName[name];
    }

    // TODO find by similarity
    const pokemonIndex = this.pokemonIndex.find(
      (indexEntry) => indexEntry.name === name,
    );

    if (!pokemonIndex) {
      return undefined;
    }

    this.pokemonIdsByName[name] = pokemonIndex?.id;

    return this.pokemonIdsByName[name];
  }

  public async getPokemonDataByName(name: string) {
    if (!name) {
      return;
    }

    await this.validateCache();

    const pokemonId = await this.getPokemonIdByName(name);

    if (typeof pokemonId !== 'number') {
      return;
    }

    if (this.pokemonDataById[pokemonId]) {
      return this.pokemonDataById[pokemonId];
    }

    const query = gql`
      {
        pokemon_v2_pokemon(where: {id: {_eq: ${pokemonId}}}) {
          id
          pokemon_v2_pokemonstats(order_by: {stat_id: asc}) {
            base_stat
            pokemon_v2_stat {
              name
            }
          }
          pokemon_v2_pokemontypes {
            pokemon_v2_type {
              name
            }
          }
          pokemon_v2_pokemonabilities {
            pokemon_v2_ability {
              pokemon_v2_abilitynames(where: {language_id: {_eq: 9}}) {
                name
              }
            }
          }
          pokemon_v2_pokemonspecy {
            pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 9}}) {
              name
            }
          }
        }
      }
    `;

    const data: {
      pokemon_v2_pokemon: Array<{
        id: number;
        pokemon_v2_pokemonstats: Array<{
          base_stat: number;
          pokemon_v2_stat: {
            name: string;
          };
        }>;
        pokemon_v2_pokemontypes: Array<{
          pokemon_v2_type: {
            name: string;
          };
        }>;
        pokemon_v2_pokemonabilities: Array<{
          pokemon_v2_ability: {
            pokemon_v2_abilitynames: {
              name: string;
            };
          };
        }>;
        pokemon_v2_pokemonspecy: {
          pokemon_v2_pokemonspeciesnames: Array<{
            name: string;
          }>;
        };
      }>;
    } = await request(this.pokeapiGqlEndpoint, query);

    this.pokemonDataById[pokemonId] = {
      id: data.pokemon_v2_pokemon[0].id,
      name: data.pokemon_v2_pokemon[0].pokemon_v2_pokemonspecy
        .pokemon_v2_pokemonspeciesnames[0].name,
    };
  }
}
