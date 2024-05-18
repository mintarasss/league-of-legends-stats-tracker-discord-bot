export const PlayerData = {
    calculatePlayerData: (data, extra) => {
        if (!data.length) throw new Error('No data provided');

        data.sort((a, b) => new Date(a['DateTime UTC']) - new Date(b['DateTime UTC']));

        const champions = {};
        const totalKDA = { k: 0, d: 0, a: 0 };
        let totalCS = 0;
        const lastGame = data[data.length - 1];
        const { Country, Age, Role, Name, Team, NameFull } = lastGame;

        data.forEach(game => {
            PlayerData.initChampion(champions, game);
            PlayerData.updateChampionStats(champions, game);
            PlayerData.updateTotalKDA(totalKDA, game);
            totalCS += Math.max(game.CS, 0);
        });

        const cleanedName = PlayerData.cleanString(NameFull);
        const [firstName, ...surnameParts] = cleanedName.split(' ');
        const surname = surnameParts.join(' ');

        const mostPlayed = PlayerData.computeMostPlayed(champions);
        const bestKDA = PlayerData.computeBestKDA(mostPlayed);

        return {
            nickname: Name,
            team: Team,
            profile: {
                fullName: { firstName, lastName: surname },
                country: Country || 'Unknown',
                age: Age || 'Unknown',
                role: Role || 'Unknown'
            },
            mostPlayedChampions: extra.most.needed ? mostPlayed.filter(item => item.wins + item.losses >= extra.most.min).slice(0, extra.most.length).map(PlayerData.betterFormat) : undefined,
            highestKdaChampions: extra.kda.needed ? bestKDA.filter(item => item.wins + item.losses >= extra.kda.min).slice(0, extra.kda.length).map(PlayerData.betterFormat) : undefined,
            stats: {
                totalCs: totalCS.toLocaleString("en-US"),
                overallKda: {
                    kills: totalKDA.k.toLocaleString("en-US"),
                    deaths: totalKDA.d.toLocaleString("en-US"),
                    assists: totalKDA.a.toLocaleString("en-US"),
                },
                totalGames: data.length.toLocaleString("en-US"),
                averageKda: totalKDA.d === 0 ? 'PERFECT' : ((totalKDA.k + totalKDA.a) / totalKDA.d).toLocaleString("en-US", { maximumFractionDigits: 2 })
            }
        };
    },
    betterFormat: (item) => ({
        averageKda: item.d === 0 ? 'PERFECT' : ((item.k + item.a) / item.d).toLocaleString("en-US", { maximumFractionDigits: 2 }),
        ...item,
        kills: item.k.toLocaleString("en-US"),
        deaths: item.d.toLocaleString("en-US"),
        assists: item.a.toLocaleString("en-US"),
    }),
    initChampion: (champions, game) => {
        if (!champions[game.Champion]) {
            champions[game.Champion] = { wins: 0, losses: 0, k: 0, d: 0, a: 0 };
        }
    },
    updateChampionStats: (champions, game) => {
        const champ = champions[game.Champion];
        champ.wins += game.PlayerWin === 'Yes' ? 1 : 0;
        champ.losses += game.PlayerWin === 'Yes' ? 0 : 1;
        champ.k += parseInt(game.Kills);
        champ.d += parseInt(game.Deaths);
        champ.a += parseInt(game.Assists);
    },
    updateTotalKDA: (totalKDA, game) => {
        totalKDA.k += parseInt(game.Kills);
        totalKDA.d += parseInt(game.Deaths);
        totalKDA.a += parseInt(game.Assists);
    },
    cleanString: (str) => str.replace(/&(?:amp|nbsp|quot);/g, match => {
        switch (match) {
            case '&amp;': return '&';
            case '&nbsp;': return ' ';
            case '&quot;': return '"';
        }
    }),
    computeMostPlayed: (champions) => {
        return Object.keys(champions).map(champion => ({
            championName: champion,
            ...champions[champion]
        })).sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses));
    },
    computeBestKDA: (data) => {
        return data.sort((a, b) => (b.k + b.a) / (b.d || 1) - (a.k + a.a) / (a.d || 1));
    }
}
