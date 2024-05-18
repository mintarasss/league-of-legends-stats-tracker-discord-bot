import { sendLongMessage, transformArrayToObject, formatPlayerDataForDiscord, sendLongJson } from './utils.js';
import { Client, Intents } from 'discord.js';
import { config } from './config.js';
import { PlayerData } from './playerData.js';
import bent from 'bent';

const { token, prefix } = config;
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => console.log('Ready! v1'));
client.on("messageCreate", handleIncomingMessage);
client.login(token);

async function handleIncomingMessage(message) {
    if (message.author.bot || !message.guild || !message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    if (args[0].length === 0) {
        message.channel.send(getHelpMessage());
        return;
    }

    const nickname = args.shift().toLowerCase();
    try {
        const keys = transformArrayToObject(args);
        const data = await getPlayerData(nickname, keys);
        if (keys.json) {
            sendLongJson(message.channel, JSON.stringify(data, null, 4));
        } else {
            sendLongMessage(message.channel, formatPlayerDataForDiscord(data));
        }
    } catch (e) {
        console.error(e);
        message.channel.send({ content: `We can't find any player with nickname "${nickname}"` });
    }
}

function getHelpMessage() {
    return `**To start the bot you need to follow these instructions:**
  1. **Basic Stats:** Type \`!player\` followed by the player's nickname.
     - Example: \`!player xpeke\`
  2. **Top 10 Best KDA Champions:** After the player's nickname, add \`kda\`.
     - Example: \`!player xpeke kda\`
  3. **Top 10 Most Played Champions:** After the player's nickname, add \`most\`.
     - Example: \`!player xpeke most\`

  **Advanced Options:**
  • Use the format \`command:x:y\` where:
  • 'x' is the minimum number of games played.
  • 'y' is the top number of results you want.
  - Default values: x = 0, y = 10
     - Example (kda with at least 5 games): \`!player xpeke kda:5\`
     - Example (top 15 kda champs with at least 5 games): \`!player xpeke kda:5:15\`
  4. **Get Data in JSON Format:** Simply add \`json\` after your command.
     - Example: \`!player xpeke kda:5:15 json\`

  **Note:** If the player's nickname has a space in it, replace the space with a \`+\`.
  For example: \`!player Shu+Hari\``;
}

async function getPlayerData(player, extra) {
    try {
        const data = await getFullPlayerData(player);
        if (data) {
            return PlayerData.calculatePlayerData(data, extra);
        } else {
            throw new Error('No data received');
        }
    } catch (e) {
        throw e;
    }
}

async function getFullPlayerData(playerName) {
    const getJSON = bent('json');
    const QUERY = {
        table: 'ScoreboardPlayers,Players',
        fields: [
            'Players._ID', 'Players.NameFull', 'Players.Country', 'Players.Age', 'Players.Team', 'Players.Role',
            'ScoreboardPlayers.DateTime_UTC', 'ScoreboardPlayers.OverviewPage', 'ScoreboardPlayers.Name',
            'ScoreboardPlayers.Link', 'ScoreboardPlayers.Champion', 'ScoreboardPlayers.Kills',
            'ScoreboardPlayers.Deaths', 'ScoreboardPlayers.Assists', 'ScoreboardPlayers.SummonerSpells',
            'ScoreboardPlayers.Gold', 'ScoreboardPlayers.CS', 'ScoreboardPlayers.DamageToChampions',
            'ScoreboardPlayers.VisionScore', 'ScoreboardPlayers.Items', 'ScoreboardPlayers.Trinket',
            'ScoreboardPlayers.KeystoneMastery', 'ScoreboardPlayers.KeystoneRune', 'ScoreboardPlayers.PrimaryTree',
            'ScoreboardPlayers.SecondaryTree', 'ScoreboardPlayers.Runes', 'ScoreboardPlayers.TeamKills',
            'ScoreboardPlayers.TeamGold', 'ScoreboardPlayers.Team', 'ScoreboardPlayers.TeamVs', 'ScoreboardPlayers.Time',
            'ScoreboardPlayers.PlayerWin'
        ],
        where: 'Players.Player="*PLAYER-NAME*"',
        order: '&join_on=Players.ID=ScoreboardPlayers.Name',
        limit: 5000,
    };

    let url = 'https://lol.fandom.com/wiki/Special:CargoExport?';
    url += `tables=${QUERY.table}`;
    url += `&&fields=${QUERY.fields.join(',')}`;
    url += `&where=${QUERY.where.replace('*PLAYER-NAME*', playerName)}`;
    url += QUERY.order;
    url += `&limit=${QUERY.limit}&format=json`;
    url = url.split(' ').join('+');

    try {
        return await getJSON(url);
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
}
