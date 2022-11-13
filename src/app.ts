/**
 * The following lines intialize dotenv,
 * so that env vars from the .env file are present in process.env
 */
import * as dotenv from 'dotenv';
import { TwitchInterface } from './TwitchInterface/TwitchInterface';
dotenv.config();

new TwitchInterface(
  process.env.TWITCH_CLIENT_ID ?? '',
  process.env.TWITCH_CLIENT_SECRET ?? '',
  ['themetalfleece', 'bwenty', 'fentheshepherd', 'izzy22x'],
);
