import { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder, Client, Collection } from 'discord.js';

export default {
    // The data needed to register slash commands to Discord.
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription(
            'List all commands of bot or info about a specific command.'
        )
        .addStringOption((option) =>
            option
                .setName('command')
                .setDescription('The specific command to see the info of.')
        ),


    async execute(interaction: ChatInputCommandInteraction) {

        const interactionClient = <Client & { commands: Collection<any, any> }>interaction.client;
        const commands = interactionClient.commands;

        let name = interaction.options.getString('command');

        const helpEmbed = new EmbedBuilder()
            .setColor(0x4286f4);

        if (name) {
            name = name.toLowerCase();
            // If a single command has been asked for, send only this command's help.
            // Added in version 3.1.0
            helpEmbed.setTitle(`Help for \`${name}\` command`);
            if (commands.has(name)) {
                /**
                 * @type {SlashCommandBuilder}
                 * @description The command data
                 */
                const command = commands.get(name).data;
                if (command.description) helpEmbed.setDescription(command.description + '\n\n**Parameters:**');
                command.options.forEach((option: any) => {
                    let content = option.description;
                    if (option.choices) {
                        let choices = '\nChoices: ';
                        option.choices.forEach((choice: any) => choices += choice + ', ');
                        choices = choices.slice(0, -2);
                        content += choices;
                    }
                    if (!option.required) content += '\n*Optional*';
                    helpEmbed.addFields({ name: option.name, value: content.trim(), inline: true });
                });
            }
            else {
                helpEmbed.setDescription(`No slash command with the name \`${name}\` found.`).setColor('Yellow');
            }
        }
        else {
            // Give a list of all the commands
            helpEmbed
                .setTitle('List of all my slash commands')
                .setDescription(
                    '`' + commands.map((command: any) => command.data.name).join('`, `') + '`'
                );
        }

        // Replies to the interaction!

        await interaction.reply({
            embeds: [helpEmbed],
        });
    },
};