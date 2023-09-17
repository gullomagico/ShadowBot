import BotClient from './BotClient.js';

const discordClient = new BotClient();

const start = async () => {
    await discordClient.init();
};

await start();