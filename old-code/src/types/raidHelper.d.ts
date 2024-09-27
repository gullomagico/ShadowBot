export interface GetSingleEventResponse {
    /** The message id of the event. */
    id: string;
    /** The server id of this event. */
    serverId: string;
    /** The user id of this events leader. */
    leaderId: string;
    /** The name of events leader. */
    leaderName: string;
    /** This events channel id. */
    channelId: string;
    /** This events channel name. */
    channelName: string;
    /** The type of this events channel. */
    channelType: string;
    /** The id of this events template. */
    templateId: string;
    templateEmoteId: string;
    /** The event title. */
    title: string;
    /** The event description. */
    description: string;
    /** The unix timestamp of when this event will start. */
    startTime: number;
    /** The unix timestamp of when this event will end. */
    endTime: number;
    /** The unix timestamp of when this event will close and deny further sign-ups. */
    closingTime: number;
    /** The raw date string of when this event will start. */
    date: string;
    /** The raw time string of when this event will start. */
    time: string;
    /** The advanced settings for this event. */
    advancedSettings: object;
    /** The classes that are applied to this event. */
    classes: object[];
    /** The roles that are applied to this event. */
    roles: object[];
    /** The current sign-ups on this event. */
    signUps: SignUpsItem[];
    /** The unix timestamp of when this event was updated last. */
    lastUpdated: number;
    /** The softres id attached to this event. */
    softresId: string;
    /** The current embed color in RGB format. */
    color: string;
}

export type SignUpsItem = {
    name: string;
    id: number;
    /** The Discord id of the user. */
    userId: string;
    className: ClassName|string;
    classEmoteId: string;
    specName?: string;
    specEmoteId?: string;
    roleName?: 'Ranged'|'Melee'|'Tanks'|'Healers';
    roleEmoteId: string;
    /** The status (primary/queued) of the sign-up. */
    status: string;
    entryTime: number;
    position: number;
}

export type ClassName = 'Warlock'|'Priest'|'Shaman'|'Tank'|'Paladin'|'Druid'|'DK'|'Hunter'|'Mage'|'Rogue'|'Warrior';