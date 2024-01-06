import BotClient from './BotClient.js';
import Server from './Server.js';

const start = async () => {
    const discordClient = new BotClient();
    const app = new Server();
    try {
        await discordClient.init();
        await app.start(3000);
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

await start();