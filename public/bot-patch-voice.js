// Temporary patch to add directed voice functions to bot.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'bot.js');
let src = fs.readFileSync(file, 'utf8');

let count = 0;

// 1. Add require for @discordjs/voice at the top
const requireLine = `const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');`;
if (src.includes(requireLine) && !src.includes('@discordjs/voice')) {
  src = src.replace(
    requireLine,
    requireLine + `\nconst { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const VOICE_CONNECTIONS = new Map(); // channelId -> connection`
  );
  count++;
  console.log('voice require added');
}

// 2. Insert the directed voice functions before the "// ---- Exported functions ----" marker
const marker = `// ---- Exported functions ----`;
if (src.includes(marker) && !src.includes('joinDirectedVoice')) {
  const voiceCode = `
// ---- Directed voice (دخول موجه) ----

/** Ensures a directed voice channel exists and returns it (creates if missing). */
async function ensureDirectedChannel(guild, number) {
  const channelName = ` + '`موجه ${number}`' + `;
  let channel = guild.channels.cache.find((c) => c.type === 2 && c.name === channelName);
  if (!channel) {
    channel = await guild.channels.create({
      name: channelName,
      type: 2, // GuildVoice
      // videoQualityMode: 'auto',
    });
  }
  return channel;
}

/** Connects the bot to a voice channel (returns the connection). */
function connectToVoice(channelId, guild) {
  const existing = getVoiceConnection(guild.id);
  if (existing && existing.joinConfig.channelId === channelId) return existing;
  if (existing) existing.destroy();
  const connection = joinVoiceChannel({
    channelId,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: true,
  });
  VOICE_CONNECTIONS.set(channelId, connection);
  return connection;
}

/**
 * Moves a member into a directed voice room by number.
 * @param {string} memberId - Discord user ID
 * @param {number} number - Directed number (1-100)
 */
async function joinDirectedVoice(memberId, number) {
  const n = parseInt(number, 10);
  if (isNaN(n) || n < 1 || n > 100) {
    throw new Error('يجب أن يكون الرقم بين 1 و 100');
  }
  const guild = await client.guilds.fetch(GUILD_ID);
  let member;
  try {
    member = await guild.members.fetch(memberId);
  } catch (e) {
    throw new Error('العضو غير موجود في السيرفر');
  }
  if (!member) throw new Error('العضو غير موجود في السيرفر');

  const channel = await ensureDirectedChannel(guild, n);

  // Bot must be connected to a voice channel to move members
  connectToVoice(channel.id, guild);

  // Wait a short moment for the voice connection to be ready
  await new Promise((r) => setTimeout(r, 700));

  try {
    await member.voice.setChannel(channel.id);
  } catch (e) {
    throw new Error('تعذر نقل العضو إلى الروم الصوتي. تأكد من أن العضو متصل بروم صوتي وأن البوت لديه صلاحية النقل (Connect/Move Members).');
  }

  return { success: true, number: n, channelId: channel.id, channelName: channel.name };
}

/** Removes a member from any directed voice room. */
async function leaveDirectedVoice(memberId) {
  const guild = await client.guilds.fetch(GUILD_ID);
  let member;
  try {
    member = await guild.members.fetch(memberId);
  } catch (e) {
    return { success: true };
  }
  if (member.voice && member.voice.channelId) {
    try {
      await member.voice.disconnect();
    } catch (e) {
      // ignore - member may not be connected
    }
  }
  return { success: true };
}

// Allow replacing the default voice adapter
client.guilds.cache.forEach?.((g) => {});

`;
  src = src.replace(marker, voiceCode + marker);
  count++;
  console.log('voice functions inserted');
}

// 3. Add the functions to module.exports
const exportMarker = `  sendDM,\n  isReady: () => client.isReady(),\n};`;
if (src.includes(exportMarker) && !src.includes('joinDirectedVoice,')) {
  src = src.replace(
    exportMarker,
    `  sendDM,\n  joinDirectedVoice,\n  leaveDirectedVoice,\n  isReady: () => client.isReady(),\n};`
  );
  count++;
  console.log('exports updated');
}

fs.writeFileSync(file, src, 'utf8');
console.log('Done. Applied', count, 'patches.');

