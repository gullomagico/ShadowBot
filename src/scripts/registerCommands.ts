import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { getEnv } from '../libs/envLoader';

const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = getEnv('CLIENT_ID', 'GUILD_ID', 'DISCORD_TOKEN');
const rest = new REST().setToken(DISCORD_TOKEN);

const commands: string[] = [];

// Grab all the command files from the commands directory you created earlier
(async () => {
    const commandsPath = path.join(__dirname.split('/').slice(0, -1).join('/'), '/commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = (await import(filePath)).default.default;
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        ) as { length: number };

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
    catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();