import { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { fetchDataGuild } from '../libs/utils';

export default {
    // The data needed to register slash commands to Discord.
    data: new SlashCommandBuilder()
        .setName('online')
        .setDescription(
            'Mostra i gildani online in questo momento'
        ),

    async execute(interaction: ChatInputCommandInteraction) {

        // Fetch data dal API di armoury e filtra solo i membri online
        const res = await fetchDataGuild();
        const membersOnline = res.roster
            .filter((e: any) => e.online)
            .map((e: any) => e.name);

        // Creat il messaggion embed con i membri online
        const embed = new EmbedBuilder()
            .setColor(0xff0505)
            .setTitle('Membri Online')
            .setDescription(membersOnline.join('\n'))
            .setTimestamp()
            .setFooter({ text: 'ShadowRebirth', iconURL: 'https://cdn.discordapp.com/avatars/957769293158830100/27d944ced04385c196bc99310d2e9a35.png' });


        await interaction.reply({ embeds: [embed] });

    },
};