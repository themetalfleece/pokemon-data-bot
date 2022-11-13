import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';
import { cachedPokemonData } from '../CachedPokemonData/CachedPokemonData';

export class TwitchInterface {
  private tokenPath: string;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private channels: string[],
  ) {
    this.tokenPath = `./tokens/token-${clientId}.json`;
    this.register();
  }

  private async register() {
    const tokenData = JSON.parse(
      (await fs.readFile(this.tokenPath, 'utf-8')).toString(),
    );

    const authProvider = new RefreshingAuthProvider(
      {
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        onRefresh: async (newTokenData) =>
          await fs.writeFile(
            this.tokenPath,
            JSON.stringify(newTokenData, null, 4),
            'utf-8',
          ),
      },
      tokenData,
    );

    const chatClient = new ChatClient({
      authProvider,
      channels: this.channels,
    });

    await chatClient.connect();

    console.log('Twitch client connected');

    chatClient.onMessage(async (channel, _user, text, msg) => {
      if (text.startsWith('!poke')) {
        const name = text.split('!poke ')[1];
        if (!name) {
          return;
        }

        if (!cachedPokemonData.isReady()) {
          chatClient.say(
            channel,
            `I just restarted and I'm not ready yet, please try again in a few seconds!`,
            {
              replyTo: msg.id,
            },
          );

          return;
        }

        const data = await cachedPokemonData.getPokemonDataByName(name);

        if (!data) {
          return;
        }

        const dex = data.nationalDexNumber;
        const species = data.name;
        const types = data.types.join('/');
        const baseStats = data.baseStats.join('/');
        const abilities = data.abilities.join('/');

        const reply = `#${dex} ${species} - ${types} - Base stats: ${baseStats} - Abilities: ${abilities}`;

        chatClient.say(channel, reply, {
          replyTo: msg.id,
        });
      }

      if (text === '!fleecebot') {
        chatClient.say(channel, 'Looking for @themetalfleece 👀', {
          replyTo: msg.id,
        });
      }
    });
  }
}
