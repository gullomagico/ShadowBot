import { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { fetchDataPlayer, fetchPlayerItems, getGemsData } from '../libs/utils.js';

const spreadProfessions = (professions: any) => {
    let out = '';
    professions.forEach((p: { name: string, skill: string }) => {
        out += `${p.name}: ${p.skill}\n`;
    });
    if (out == '') out = 'No data.';
    return out;
};

const spreadData = (arr: any[]) => {
    let out = '';

    arr.forEach(team => {
        for (const key of Object.keys(team)) { out += `${key}: ${team[key]}\n`; }
    });
    if (out == '') out = 'No data.';

    return out;
};

export default {
    // The data needed to register slash commands to Discord.
    data: new SlashCommandBuilder()
        .setName('who')
        .setDescription(
            'Trova un pg sull\'armory di Warmane'
        )
        .addStringOption((option) =>
            option
                .setName('nome')
                .setDescription('Nome del pg da cercare')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {

        const input = interaction.options.getString('nome') as string;
        const name = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
        const data = await fetchDataPlayer(name);

        if (data.error) { await interaction.reply(data.error); }
        if (!data.name) { await interaction.reply('Nessun pg trovato.'); }

        const gemsData = getGemsData(name);

        const items = data.equipment.map((e: any) => e.item);
        const playerItems = await fetchPlayerItems(items);
        const sum = playerItems.reduce((a, b) => a + b, 0);
        const avg = (sum / playerItems.length) || 0;

        const embed = new EmbedBuilder()
            .setColor(0xff0505)
            .setURL(`http://armory.warmane.com/character/${data.name}/Lordaeron/summary`)
            .setTitle(data.name)
            .setTimestamp()
            .setFooter({ text: 'La Rinascita Oscura', iconURL: 'https://cdn.discordapp.com/app-icons/957769293158830100/f4357a78b9287a19b03e8df9773c2530.png' })
            .addFields(
                { name: 'Info', value: `Nome: ${data.name}\n` + `Online: ${data.online}\n` + `Level: ${data.level}\n` + `Razza: ${data.race}\n` + `Classe: ${data.class}\n` + `Gilda: ${data.guild}\n` + `Uccisioni PVP: ${data.honorablekills}\n` + `Punti Achivement: ${data.achievementpoints}\n` },
                { name: 'Professioni', value: spreadProfessions(data.professions) },
                { name: 'Teams PVP', value: spreadData(data.pvpteams) },
                { name: 'PVE', value: `Items: ${playerItems}\nAverage Item Level: ${avg}\n` }
            );

        // await interaction.reply({ embeds: [embed] });
    },
};
