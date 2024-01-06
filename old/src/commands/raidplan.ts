import { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { fetchRaidHelperEvent, formatGroupSignUps } from '../libs/utils.js';
import { SignUpsItem } from '../types/raidHelper.js';

export default {
    // The data needed to register slash commands to Discord.
    data: new SlashCommandBuilder()
        .setName('raidplan')
        .setDescription(
            'Mostra un raidplan da un raid di RaidHelper'
        )
        .addStringOption((option) =>
            option
                .setName('raid_id')
                .setDescription('Id del raid da pianificare.')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {

        const raidId = interaction.options.getString('raid_id') as string;
        const eventData = await fetchRaidHelperEvent(raidId);
        const groups = [[[], []], [[]], [[]], [[]], [[]]] as SignUpsItem[][][];

        // Create groups
        eventData.signUps.filter(e => e.className != 'Tentative').forEach(e => {
            switch (e.roleName) {
                case 'Tanks':
                    groups[0][0].push(e);
                    break;
                case 'Healers':
                    groups[4][0].push(e);
                    break;
                case 'Ranged':
                    if (groups[2][0].length < 5) { groups[2][0].push(e); }
                    else { groups[3][0].push(e); }
                    break;
                case 'Melee':
                    if (groups[0][1].length < 3) { groups[0][1].push(e); }
                    else { groups[1][0].push(e); }
                    break;
                default:
                    break;
            }
        });

        // Crea il messaggion embed con i gruppi
        const embed = new EmbedBuilder()
            .setColor(0x840000)
            .setTitle(`Raid Plan per ${eventData.title}`)
            .setDescription('Divisione in gruppi per i raider che hanno risposto all\'evento.')
            .addFields(
                {
                    name: 'Gruppo 1',
                    value: formatGroupSignUps(groups[0]),
                    inline: false,
                },
                {
                    name: 'Gruppo 2',
                    value: formatGroupSignUps(groups[1]),
                    inline: false,
                },
                {
                    name: 'Gruppo 3',
                    value: formatGroupSignUps(groups[2]),
                    inline: false,
                },
                {
                    name: 'Gruppo 4',
                    value: formatGroupSignUps(groups[3]),
                    inline: false,
                },
                {
                    name: 'Gruppo 5',
                    value: formatGroupSignUps(groups[4]),
                    inline: false,
                }
            )
            .setTimestamp()
            .setFooter({ text: 'ShadowRebirth', iconURL: 'https://cdn.discordapp.com/avatars/957769293158830100/27d944ced04385c196bc99310d2e9a35.png' });


        await interaction.reply({ embeds: [embed] });
    },
};