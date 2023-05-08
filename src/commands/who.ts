import { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { fetchDataPlayer, fetchPlayerItems } from '../libs/utils';

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
        for (const key of Object.keys(team)) {out += `${key}: ${team[key]}\n`;}
    });
    if (out == '') out = 'No data.';

    return out;
};

module.exports = {
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

        let name = interaction.options.getString('nome') as any;
        name = name[0].toUpperCase() + name.slice(1);
        const data = await fetchDataPlayer(name);
        const items = data.equipment.map((e: any) => e.item);
        const playerItems = await fetchPlayerItems(items);
        const sum = playerItems.reduce((a, b) => a + b, 0);
        const avg = (sum / playerItems.length) || 0;
        console.log(playerItems);

        if (data.error) {
            await interaction.reply(data.error);
        }
        else if (!data.name) {await interaction.reply('Nessun pg trovato.');}
        else {
            const embed = new EmbedBuilder()
                .setColor(0xff0505)
                .setURL(`http://armory.warmane.com/character/${data.name}/Lordaeron/summary`)
                .setTitle(data.name)
                .setTimestamp()
                .setFooter({ text: 'ShadowRebirth', iconURL: 'https://cdn.discordapp.com/avatars/957769293158830100/27d944ced04385c196bc99310d2e9a35.png' })
                .addFields(
                    { name: 'Info', value: `Nome: ${data.name}\n` + `Online: ${data.online}\n` + `Level: ${data.level}\n` + `Razza: ${data.race}\n` + `Classe: ${data.class}\n` + `Gilda: ${data.guild}\n` + `Uccisioni PVP: ${data.honorablekills}\n` + `Punti Achivement: ${data.achievementpoints}\n` },
                    { name: 'Professioni', value: spreadProfessions(data.professions) },
                    { name: 'Teams PVP', value: spreadData(data.pvpteams) },
                    { name: 'PVE', value: `Items: ${playerItems}\nAverage Item Level: ${avg}\n` }
                );

            await interaction.reply({ embeds: [embed] });
        }
    },
};
