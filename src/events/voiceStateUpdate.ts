import { Events, VoiceState } from 'discord.js';
import { memberJoin, memberLeft } from '../libs/utils';

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState: VoiceState, newState: VoiceState) {
        // Mute or Unmute
        if (oldState.channel == newState.channel) return;
        try {
            // Member left channel
            if (oldState.channel) { await memberLeft(oldState); }

            // Member joins channel
            if (newState.channel) { await memberJoin(newState); }
        }
        catch (e) {
            console.log(e);
        }
    },
};