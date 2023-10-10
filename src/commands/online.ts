import { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { fetchDataGuild } from '../libs/utils.js';

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
            .setFooter({ text: 'La Rinascita Oscura', iconURL: 'https://cdn.discordapp.com/app-icons/957769293158830100/f4357a78b9287a19b03e8df9773c2530.png' });


        await interaction.reply({ embeds: [embed] });

    },
};