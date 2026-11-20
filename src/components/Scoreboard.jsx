import React from 'react';

const formatTime = totalSeconds => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const Scoreboard = ({ scores, error }) => (
    <section className="scoreboard-card" aria-labelledby="scoreboard-title">
        <div className="section-heading">
            <div>
                <h2 id="scoreboard-title">Top 10 Scores</h2>
                <p>Fastest completed puzzles across all difficulty levels.</p>
            </div>
        </div>
        {error && <p className="scoreboard-error" role="status">{error}</p>}
        <div className="scoreboard-table-wrap">
            <table className="scoreboard-table">
                <thead>
                    <tr>
                        <th scope="col">Rank</th>
                        <th scope="col">Player</th>
                        <th scope="col">Time</th>
                        <th scope="col">Hints</th>
                        <th scope="col">Difficulty</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.length === 0 ? (
                        <tr>
                            <td className="scoreboard-empty" colSpan="5">No scores yet. Complete a puzzle to qualify!</td>
                        </tr>
                    ) : scores.map((score, index) => (
                        <tr key={`${score.name}-${score.timeSeconds}-${index}`}>
                            <td>{index + 1}</td>
                            <td>{score.name}</td>
                            <td>{formatTime(score.timeSeconds)}</td>
                            <td>{score.hintsUsed}</td>
                            <td className="scoreboard-difficulty">{score.difficulty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
);

export default Scoreboard;
