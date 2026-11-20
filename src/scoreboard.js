export const SCOREBOARD_STORAGE_KEY = 'sudoku-top-scores';
export const SCOREBOARD_LIMIT = 10;

export const rankScores = scores => [...scores]
    .sort((first, second) => first.timeSeconds - second.timeSeconds)
    .slice(0, SCOREBOARD_LIMIT);

export const qualifiesForScoreboard = (score, scores) => {
    const rankedScores = rankScores(scores);
    return rankedScores.length < SCOREBOARD_LIMIT ||
        score.timeSeconds < rankedScores[rankedScores.length - 1].timeSeconds;
};

export const getScores = storage => {
    const storedScores = storage.getItem(SCOREBOARD_STORAGE_KEY);
    if (storedScores === null) return [];

    const scores = JSON.parse(storedScores);
    if (!Array.isArray(scores)) {
        throw new Error('Stored scoreboard data is not a list.');
    }
    return rankScores(scores);
};

export const saveScore = (score, storage) => {
    const scores = getScores(storage);
    if (!qualifiesForScoreboard(score, scores)) {
        return { scores, qualified: false };
    }

    const rankedScores = rankScores([...scores, score]);
    storage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(rankedScores));
    return { scores: rankedScores, qualified: true };
};
