import { request, gql } from 'graphql-request';
import { distance } from 'fastest-levenshtein';

export type PokemonData = {
  id: number;
  name: string;
  nationalDexNumber: number;
  baseStats: number[];
  types: string[];
  abilities: string[];
};

export class CachedPokemonData {
  private pokeapiGqlEndpoint = 'https://beta.pokeapi.co/graphql/v1beta';
  /** refresh every 1 hour */
  private refreshInterval = 1 * 60 * 60 * 1000;

  private pokemonDataById: Record<number, PokemonData> = {};
  private pokemonIdsByName: Record<string, number> = {};

  private ready = false;

  constructor() {
    this.refreshCache().catch((err) => {
      console.error(`Error while fetching the initial cache`, err);
    });

    setInterval(() => {
      this.refreshCache().catch((err) => {
        console.error(`Error while refreshing cache`, err);
      });
    }, this.refreshInterval);
  }

  public isReady() {
    return this.ready;
  }

  private async refreshCache() {
    console.log('refreshing cache');

    const query = gql`
      {
        pokemon_v2_pokemonform {
          pokemon_v2_pokemonformnames(where: { language_id: { _eq: 9 } }) {
            name
            pokemon_name
          }
          pokemon_v2_pokemon {
            id
            pokemon_v2_pokemonstats(order_by: { stat_id: asc }) {
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
                pokemon_v2_abilitynames(where: { language_id: { _eq: 9 } }) {
                  name
                }
              }
            }
            pokemon_v2_pokemonspecy {
              pokemon_v2_pokemonspeciesnames(
                where: { language_id: { _eq: 9 } }
              ) {
                name
              }
              pokemon_v2_pokemondexnumbers(
                limit: 1
                order_by: { pokedex_id: asc }
              ) {
                pokedex_number
              }
            }
          }
        }
      }
    `;

    const data: {
      pokemon_v2_pokemonform: Array<{
        pokemon_v2_pokemon: {
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
              pokemon_v2_abilitynames: Array<{
                name: string;
              }>;
            };
          }>;
          pokemon_v2_pokemonspecy: {
            pokemon_v2_pokemonspeciesnames: Array<{
              name: string;
            }>;
            pokemon_v2_pokemondexnumbers: Array<{
              pokedex_number: number;
            }>;
          };
        };
        pokemon_v2_pokemonformnames: Array<{
          name: string;
          pokemon_name: string;
        }>;
      }>;
    } = await request(this.pokeapiGqlEndpoint, query);

    for (const pokeData of data.pokemon_v2_pokemonform) {
      const pokemon = pokeData.pokemon_v2_pokemon;
      const name =
        pokeData.pokemon_v2_pokemonformnames[0]?.pokemon_name ??
        pokemon.pokemon_v2_pokemonspecy.pokemon_v2_pokemonspeciesnames[0]
          ?.name ??
        '';

      this.pokemonDataById[pokemon.id] = {
        id: pokemon.id,
        name,
        nationalDexNumber:
          pokemon.pokemon_v2_pokemonspecy.pokemon_v2_pokemondexnumbers[0]
            ?.pokedex_number ?? 0,
        baseStats: pokemon.pokemon_v2_pokemonstats.map(
          (stat) => stat.base_stat,
        ),
        abilities: pokemon.pokemon_v2_pokemonabilities.map(
          (ability) =>
            ability.pokemon_v2_ability.pokemon_v2_abilitynames[0]?.name ?? '',
        ),
        types: pokemon.pokemon_v2_pokemontypes.map(
          (type) =>
            type.pokemon_v2_type.name[0].toUpperCase() +
            type.pokemon_v2_type.name.substring(1),
        ),
      };
    }

    this.pokemonIdsByName = {};

    this.ready = true;

    console.log('Cache updated');
  }

  private async getPokemonIdByName(name: string) {
    if (this.pokemonIdsByName[name]) {
      return this.pokemonIdsByName[name];
    }

    const { pokemonData } = Object.values(this.pokemonDataById).reduce(
      (closestData, currentData) => {
        const currentDistance = distance(
          currentData.name.toLowerCase(),
          name.toLowerCase(),
        );

        if (currentDistance < closestData.distance) {
          closestData = {
            pokemonData: currentData,
            distance: currentDistance,
          };
        }

        return closestData;
      },
      {
        pokemonData: undefined as PokemonData | undefined,
        distance: Infinity,
      },
    );

    if (!pokemonData) {
      return undefined;
    }

    this.pokemonIdsByName[name] = pokemonData.id;

    return this.pokemonIdsByName[name];
  }

  public async getPokemonDataByName(name: string) {
    if (!name) {
      return;
    }

    const pokemonId = await this.getPokemonIdByName(name);

    if (typeof pokemonId !== 'number') {
      return;
    }

    return this.pokemonDataById[pokemonId];
  }
}

export const cachedPokemonData = new CachedPokemonData();
