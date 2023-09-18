import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ChatInputCommandInteraction, Client, Collection, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';
import { getEnv } from './libs/envLoader.js';

const { DISCORD_TOKEN } = getEnv('DISCORD_TOKEN');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type Command = {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
};

class BotClient extends Client {
    commands: Collection<string, Command>;

    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
        });
        this.commands = new Collection();
    }

    async login(token?: string): Promise<string> {
        return super.login(token);
    }

    async init(): Promise<void> {
        console.log('Discord client is starting...');

        // Import events
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = (await import(filePath)).default;
            if (event.once) {
                this.once(event.name, (...args) => event.execute(...args));
            }
            else {
                this.on(event.name, (...args) => event.execute(...args));
            }
        }

        // Import commands
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = (await import(filePath)).default;
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                this.commands.set(command.data.name, command);
            }
            else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

        await this.login(DISCORD_TOKEN);
    }
}

export default BotClient;