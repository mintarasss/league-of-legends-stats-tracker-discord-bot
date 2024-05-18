export const sendLongJson = (channel, content) => {
    const maxChar = 1800;  // Account for code block markdown (max is 2k)
    const prefix = '```json\n';
    const suffix = '\n```';

    let currentContent = content;
    while (currentContent.length) {
        let chunk;
        if (currentContent.length > maxChar) {
            chunk = currentContent.slice(0, maxChar);
            let lastNewline = chunk.lastIndexOf("\n");
            if (lastNewline !== -1) {
                chunk = chunk.slice(0, lastNewline);
            }
            currentContent = currentContent.slice(chunk.length);
        } else {
            chunk = currentContent;
            currentContent = '';
        }
        channel.send(prefix + chunk + suffix);
    }
}

export const sendLongMessage = (channel, content) => {
    const maxChar = 1800;  // Account for code block markdown (max is 2k)
    const prefix = '\n';
    const suffix = '\n';

    let currentContent = content;
    while (currentContent.length) {
        let chunk;
        if (currentContent.length > maxChar) {
            chunk = currentContent.slice(0, maxChar);
            let lastNewline = chunk.lastIndexOf("\n");
            if (lastNewline !== -1) {
                chunk = chunk.slice(0, lastNewline);
            }
            currentContent = currentContent.slice(chunk.length);
        } else {
            chunk = currentContent;
            currentContent = '';
        }
        channel.send(prefix + chunk + suffix);
    }
}

export const formatPlayerDataForDiscord = (data) => {
    const profile = data.profile;
    const fullName = `${profile.fullName.firstName} ${profile.fullName.lastName}`;

    const createChampionList = (champions, emoji) => {
        if (!champions) return '';
        return champions.map((champ, index) => (
            `${emoji} **${index + 1}. ${champ.championName}** - KDA: ${champ.averageKda} | Wins: ${champ.wins} | Losses: ${champ.losses} | Kills: ${champ.kills} | Deaths: ${champ.deaths} | Assists: ${champ.assists}\n`
        )).join('');
    };

    const mostPlayedChampions = createChampionList(data.mostPlayedChampions, '🎮');
    const highestKdaChampions = createChampionList(data.highestKdaChampions, '🌟');

    return `👤 **Player Profile: ${data.nickname}**
🏆 **Team:** ${data.team}
📛 **Full Name:** ${fullName}
🌍 **Country:** ${profile.country}
🎂 **Age:** ${profile.age}
📌 **Role:** ${profile.role}

📊 **General Stats:**
💼 **Total CS (Creep Score):** ${data.stats.totalCs}
⚔ **Overall KDA:** Kills: ${data.stats.overallKda.kills} | Deaths: ${data.stats.overallKda.deaths} | Assists: ${data.stats.overallKda.assists}
🎮 **Total Games Played:** ${data.stats.totalGames}
📈 **Average KDA:** ${data.stats.averageKda}
${mostPlayedChampions ? `\n**Most Played Champions:**\n${mostPlayedChampions}` : ''}
${highestKdaChampions ? `\n**Highest KDA Champions:**\n${highestKdaChampions}` : ''}`;
};

export const transformArrayToObject = (arr) => {
    return arr.reduce((acc, item) => {
        let [key, min, length] = item.split(":");
        acc[key] = {
            needed: true,
            min: parseInt(min) || 0,
            length: parseInt(length) || 10
        };
        return acc;
    }, { 'kda': { needed: false }, 'most': { needed: false } });
}
