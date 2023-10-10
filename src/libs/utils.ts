import { Channel, ChannelType, Collection, VoiceState } from 'discord.js';
import { GetSingleEventResponse, SignUpsItem } from '../types/raidHelper.js';
import * as cheerio from 'cheerio';

export const generatedVoiceChannels = [
    '🔮 Dalaran 🔮',
    '🐗 Orgrimmar 🐗',
    '⚡ Thunder Bluff ⚡',
    '💀 Undercity 💀',
    '🩸 Silvermoon City 🩸',
    '🌠 Shattrath City 🌠',
    '🔸 Argent Tournament 🔸',
    '🔸 Camp Winterhoof 🔸',
    '🔸 New Agamand 🔸',
    '🔸 The Bulwark 🔸',
    '🔸 Warsong Hold 🔸',
    '🔸 Bor\'gorok Outpost 🔸',
    '🔸 Taunka\'le Village 🔸',
    '🔸 Vengeance Landing 🔸',
    '🔸 Apothecary Camp 🔸',
    '🔸 Venomspite 🔸',
    '🔸 Agmar\'s Hammer 🔸',
    '🔸 Kor\'kron Vanguard 🔸',
    '🔸 Conquest Hold 🔸',
    '🔸 Camp Oneqwah 🔸',
    '🔸 Sunreaver\'s Command 🔸',
    '🔸 Warsong Camp 🔸',
    '🔸 Grom\'arsh Crash-Site 🔸',
    '🔸 Camp Tunka\'lo 🔸',
];

export const itemNames = ['Head', 'Neck', 'Shoulders', 'Cloak', 'Chest', 'Shirt', 'Tabard', 'Bracer', 'Gloves', 'Belt', 'Legs', 'Boots', 'Ring #1', 'Ring #2', 'Trinket #1', 'Trinket #2', 'Main-hand', 'Off-hand', 'Ranged'];

export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const fetchDataGuild = async () => {
    const res = await fetch(
        'http://armory.warmane.com/api/guild/Shadow+Rebirth/Lordaeron/summary'
    );

    const parsed = await res.json();
    return parsed;
};

export const fetchDataPlayer = async (player: string) => {
    const res = await fetch(
        `http://armory.warmane.com/api/character/${player}/Lordaeron/summary`
    );
    const parsed = await res.json();

    if (parsed.error) return false;

    return parsed;
};

export const fetchPlayerItems = async (items: string[]) => {
    const ret: number[] = [];
    await Promise.all(items.map(async e => {
        const res = await fetch(
            `https://wotlk.cavernoftime.com/item=${e}&power=false`
        );
        const parsed = await res.blob();
        const buf = await parsed.slice(1).text();
        const start = buf.indexOf('Item Level');
        const end = start + 16;
        const result = buf.substring(start, end);
        const reg = /[0-9]/g;
        const resu = result.match(reg);
        if (resu) {
            const r = parseInt(resu?.join(''));
            if (r > 100) ret.push(r);
        }
    }));
    return ret;
};

export const fetchRaidHelperEvent = async (eventId: string) => {
    const res = await fetch(
        `https://raid-helper.dev/api/v2/events/${eventId}`
    );

    const parsed: GetSingleEventResponse = await res.json();
    return parsed;
};

const getRandomChannelName = (channels: Collection<string, Channel>) => {
    const usedNames = channels
        .filter(e => e.isVoiceBased())
        .map(e => {
            if (e.isVoiceBased()) { return e.name; }
        });
    const remainingNames = generatedVoiceChannels.filter(e => !usedNames.includes(e));
    const rndIndex = Math.floor(Math.random() * 100) % remainingNames.length;
    return remainingNames[rndIndex];
};

const createVocalChannel = async (newState: VoiceState) => {
    await newState.channel?.setName(getRandomChannelName(newState.client.channels.cache));
    console.log(`[${(new Date()).toString().slice(0, 33)}] ${newState.member?.displayName} creates ${newState.channel?.name}`);

    await newState.guild.channels.create({
        name: '\u{2795} Crea taverna \u{1F37B}',
        type: ChannelType.GuildVoice,
        parent: newState.channel?.parentId,
    });
};

export const memberJoin = async (newState: VoiceState) => {
    if (newState.channel?.name.match(/^\u2795/g)) {
        await createVocalChannel(newState);
    } else {
        console.log(`[${(new Date()).toString().slice(0, 33)}] ${newState.member?.displayName} joins ${newState.channel?.name}`);
    }
};

export const memberLeft = async (oldstate: VoiceState) => {
    console.log(`[${(new Date()).toString().slice(0, 33)}] ${oldstate.member?.displayName} left ${oldstate.channel?.name}`);

    if (oldstate.channel?.members.size == 0 && generatedVoiceChannels.includes(oldstate.channel.name)) {
        if (oldstate.channel) { await oldstate.channel.delete(); }
    }

};

export const formatGroupSignUps = (group: SignUpsItem[][]) => {

    const formattedGroup = [] as string[];

    group.flat().forEach(item => {
        formattedGroup.push(`${item.roleName} - ${item.className} - ${item.name}`);
    });

    for (let i = formattedGroup.length; i < 5; i++) { formattedGroup.push('[ vuoto ]'); }

    return formattedGroup.join('\n');

};

function getParams(params: string) {
    const paramsSplitter = params.split('&');
    const paramsMap = {} as { [key: string]: string };
    paramsSplitter.forEach((p) => {
        const v = p.split('=');
        paramsMap[v[0]] = decodeURIComponent(v[1]);
    });
    return paramsMap;
}

export const getGemsData = async (name: string) => {
    let amount;
    const itemIDs = [] as any[];
    const actualItems = [] as any[];

    const res = await fetch(
        `http://armory.warmane.com/character/${name}/Lordaeron/`
    );
    if (res.status != 200) return false;

    const body = await res.text();
    const $ = cheerio.load(body);

    $('.item-model a').each((i: number, e: cheerio.Element) => {
        const rel = e.attribs.rel;
        if (!rel) return;

        const params = getParams(rel);
        if (params['gems']) {
            amount = params['gems'].split(':').filter(x => x != '0').length;
        } else {
            amount = 0;
        }

        actualItems.push({
            'itemID': Number(params['item']),
            'gems': amount,
            'type': itemNames[i],
        });

    });

    actualItems.forEach((item: any) => {
        console.log(item);
    });

};