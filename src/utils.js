/**
 * Sends long content to a Discord channel by splitting it into chunks.
 * @param {object} channel - The Discord channel object.
 * @param {string} content - The full content to send.
 * @param {object} options - Configuration options for prefix, suffix, and max chars.
 * @param {string} options.prefix - A string to prepend to each chunk.
 * @param {string} options.suffix - A string to append to each chunk.
 * @param {number} options.maxChars - Maximum number of characters allowed per chunk.
 */
const sendLongContent = (channel, content, {prefix = '', suffix = '', maxChars = 1800}) => {
    let remainingContent = content;

    while (remainingContent.length) {
        let chunk = remainingContent.slice(0, maxChars);
        const lastNewline = chunk.lastIndexOf('\n');
        if (lastNewline !== -1 && remainingContent.length > maxChars) {
            // This ensures we cut off at a newline for better formatting
            chunk = chunk.slice(0, lastNewline);
        }
        remainingContent = remainingContent.slice(chunk.length);
        channel.send(prefix + chunk + suffix);
    }
};

export const sendLongJson = (channel, content) => {
    sendLongContent(channel, content, {
        prefix: '```json\n',
        suffix: '\n```',
        maxChars: 1800 // accounting for code fences
    });
};

export const sendLongMessage = (channel, content) => {
    sendLongContent(channel, content, {
        prefix: '\n',
        suffix: '\n',
        maxChars: 1800
    });
};

export const formatPlayerDataForDiscord = (data) => {
    const profile = data.profile || {};
    const fullName = `${profile.fullName?.firstName ?? ''} ${profile.fullName?.lastName ?? ''}`.trim();

    const createChampionList = (champions, emoji) => {
        if (!champions || champions.length === 0) return '';
        return champions.map((champ, index) => {
            return `${emoji} **${index + 1}. ${champ.championName}** - KDA: ${champ.averageKda} | Wins: ${champ.wins} | Losses: ${champ.losses} | Kills: ${champ.kills} | Deaths: ${champ.deaths} | Assists: ${champ.assists}\n`;
        }).join('');
    };

    const mostPlayedChampions = createChampionList(data.mostPlayedChampions, '🎮');
    const highestKdaChampions = createChampionList(data.highestKdaChampions, '🌟');

    return `👤 **Player Profile: ${data.nickname}**
🏆 **Team:** ${data.team}
📛 **Full Name:** ${fullName}
🌍 **Country:** ${profile.country ?? 'Unknown'}
🎂 **Age:** ${profile.age ?? 'Unknown'}
📌 **Role:** ${profile.role ?? 'Unknown'}

📊 **General Stats:**
💼 **Total CS:** ${data.stats.totalCs}
⚔ **Overall KDA:** Kills: ${data.stats.overallKda.kills} | Deaths: ${data.stats.overallKda.deaths} | Assists: ${data.stats.overallKda.assists}
🎮 **Total Games Played:** ${data.stats.totalGames}
📈 **Average KDA:** ${data.stats.averageKda}

${mostPlayedChampions ? `**Most Played Champions:**\n${mostPlayedChampions}` : ''}
${highestKdaChampions ? `**Highest KDA Champions:**\n${highestKdaChampions}` : ''}`;
};

export const transformArrayToObject = (arr) => {
    // Use a more flexible parsing approach and handle defaults via destructuring and fallback values
    return arr.reduce((acc, item) => {
        const [key, min = '0', length = '10'] = item.split(':');
        acc[key] = {
            needed: true,
            min: parseInt(min, 10) || 0,
            length: parseInt(length, 10) || 10
        };
        return acc;
    }, {
        'kda': {needed: false},
        'most': {needed: false}
    });
};
