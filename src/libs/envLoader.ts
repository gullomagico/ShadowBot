import { readFileSync } from 'node:fs';
import * as yaml from 'js-yaml';
import { EnvSchema } from '../types/env.js';


const state = {
    started: false,
    completed: false,
    type: 'local',
};

type StringKeyEnvSchema = { [K in keyof EnvSchema]: string };
const cache: Partial<StringKeyEnvSchema> = {};

const loadRemoteKeys = () => {
    if (!process.env.SECRETS) throw Error('missing envs');
    const remoteEnvs = JSON.parse(process.env.SECRETS) as Partial<EnvSchema>;
    for (const [key, value] of Object.entries(remoteEnvs)) {
        cache[key as keyof EnvSchema] = value;
    }
};

const loadKeys = () => {
    let fileName: string;

    if (process.env.TESTING) fileName = 'testing';
    else fileName = 'local';
    const localEnvs = yaml.load(readFileSync(`./env.${fileName}.yml`, 'utf8')) as Partial<EnvSchema>;
    for (const [key, value] of Object.entries(localEnvs)) {
        cache[key as keyof EnvSchema] = value;
    }
};

const getEnv = <Key extends keyof EnvSchema>(...listKeys: [...Key[]]) => {
    if (!state.started) {
        state.started = true;
        if (process.env.REMOTE) loadRemoteKeys();
        else loadKeys();
        state.completed = true;
    }

    const values: Partial<EnvSchema> = {};

    for (const key of listKeys) {
        if (!Object.hasOwn(cache, key)) throw Error(`missing env key: ${key}`);
        if (
            typeof cache[key] === 'string' &&
            (cache[key] as string).trim() == ''
        ) { throw Error(`env key: ${key} is empty`); }
        values[key] = cache[key];
    }

    return values as {
        [key in Key]: EnvSchema[key];
    };
};

export { getEnv };