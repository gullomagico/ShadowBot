import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { getEnv } from '../libs/envLoader';
import { sleep } from '../libs/utils';

const { DISCORD_TOKEN } = getEnv('DISCORD_TOKEN');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

const activityName = 'World of Warcraft';

client.once('ready', async () => {
    console.log(`Setting up ${client.user?.tag} activity!`);
    client.user?.setActivity(activityName, { type: ActivityType.Playing });
    await sleep(1000);
    console.log('Done!');
    client.destroy();
});

client.login(DISCORD_TOKEN);
