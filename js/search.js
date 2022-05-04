const SearchController = {};

SearchController.nodes;
SearchController.failHigh;
SearchController.failHighFirst;
SearchController.depth;
SearchController.time;
SearchController.start;
SearchController.stop;
SearchController.best;
SearchController.thinking;

const PickNextMove = (moveNumber) => {
    let bestScore = -1;
    let bestNumber = moveNumber;

    for (let i = moveNumber; i < GameBoard.moveListStart[GameBoard.ply + 1]; ++i) {
        if (GameBoard.moveScores[i] > bestScore) {
            bestScore = GameBoard.moveScores[i]
            bestNumber = i;
        }
    }

    if (bestNumber !== moveNumber) {
        let temp = 0;
        temp = GameBoard.moveScores[moveNumber];
        GameBoard.moveScores[moveNumber] = GameBoard.moveScores[bestNumber];
        GameBoard.moveScores[bestNumber] = temp;

        temp = GameBoard.moveList[moveNumber];
        GameBoard.moveList[moveNumber] = GameBoard.moveList[bestNumber];
        GameBoard.moveList[bestNumber] = temp;
    }
}

const ClearPvTable = () => {
    for (let i = 0; i < PVENTRIES; i++) {
        GameBoard.pvTable[i].move = NOMOVE;
        GameBoard.pvTable[i].posKey = 0;
    }
}

const CheckUp = () => {
    if (($.now() - SearchController.start) > SearchController.time) {
        SearchController.stop = BOOL.TRUE;
    }
}

const IsRepetition = () => {
    for (let i = GameBoard.hisPly - GameBoard.fiftyMove; i < GameBoard.hisPly - 1; ++i) {
        if (GameBoard.posKey === GameBoard.history[i].posKey) {
            return BOOL.TRUE
        }
    }

    return BOOL.FALSE
}

const Quiescence = (alpha, beta) => {
    if ((SearchController.nodes & 2047) === 0) CheckUp();

    SearchController.nodes++;

    if ((IsRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply !== 0) return 0
    if (GameBoard.ply > MAXDEPTH - 1) return EvalPosition();

    let Score = EvalPosition();

    if (Score >= beta) return beta;
    if (Score > alpha) alpha = Score;

    GenerateCaptures();

    let Legal = 0;
    let OldAlpha = alpha;
    let BestMove = NOMOVE;
    let Move = NOMOVE;

    for (let i = GameBoard.moveListStart[GameBoard.ply];
        i < GameBoard.moveListStart[GameBoard.ply + 1]; ++i) {
        PickNextMove(i);

        Move = GameBoard.moveList[i];

        if (MakeMove(Move) === BOOL.FALSE) continue;

        Legal++;
        Score = -Quiescence(-beta, -alpha);

        TakeMove()

        if (SearchController.stop === BOOL.TRUE) return 0;

        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal === 1) SearchController.failHighFirst++;
                SearchController.failHigh++;
                return beta;
            }

            alpha = Score;
            BestMove = Move;
        }
    }

    if (alpha !== OldAlpha) StorePvMove(BestMove);

    return alpha;
}

const AlphaBeta = (alpha, beta, depth) => {
    if (depth <= 0) return Quiescence(alpha, beta);
    if ((SearchController.nodes & 2047) === 0) CheckUp();

    SearchController.nodes++;

    if ((IsRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply !== 0) return 0
    if (GameBoard.ply > MAXDEPTH - 1) return EvalPosition();

    const InCheck = SqAttaked(GameBoard.pList[PIECEINDEX(Kings[GameBoard.side], 0)], GameBoard.side ^ 1);
    if (InCheck === BOOL.TRUE) depth++;

    let Score = -INFINITE;

    GenerateMoves();

    let Legal = 0;
    let OldAlpha = alpha;
    let BestMove = NOMOVE;
    let Move = NOMOVE;
    let PvMove = ProbePvTable();

    if (PvMove !== NOMOVE) {
        for (let i = GameBoard.moveListStart[GameBoard.ply];
            i < GameBoard.moveListStart[GameBoard.ply + 1]; ++i) {
            if (GameBoard.moveList[i] === PvMove) {
                GameBoard.moveScores[i] = 2_000_000;
                break;
            }
        }
    }

    for (let i = GameBoard.moveListStart[GameBoard.ply];
        i < GameBoard.moveListStart[GameBoard.ply + 1]; ++i) {
        PickNextMove(i);

        Move = GameBoard.moveList[i];

        if (MakeMove(Move) === BOOL.FALSE) continue;

        Legal++;
        Score = -AlphaBeta(-beta, -alpha, depth - 1);

        TakeMove()

        if (SearchController.stop === BOOL.TRUE) return 0;

        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal === 1) SearchController.failHighFirst++;
                SearchController.failHigh++;

                if ((Move & MFLAGCAP) === 0) {
                    GameBoard.searchKillers[MAXDEPTH + GameBoard.ply] =
                        GameBoard.searchKillers[GameBoard.ply];

                    GameBoard.searchKillers[GameBoard.ply] = Move;
                }

                return beta;
            }

            if ((Move & MFLAGCAP) === 0) {
                const i = GameBoard.pieces[FROMSQ(Move)] * BOARD_SQ_NUMBER + TOSQ(Move);
                GameBoard.searchHistory[i] += depth * depth;
            }

            alpha = Score;
            BestMove = Move;
        }
    }

    if (Legal === 0) {
        if (InCheck === BOOL.TRUE) {
            return -MATE + GameBoard.ply;
        } else {
            return 0
        }
    }

    if (alpha !== OldAlpha) StorePvMove(BestMove);

    return alpha;
}

const ClearForSearch = () => {
    for (let i = 0; i < 14 * BOARD_SQ_NUMBER; ++i)
        GameBoard.searchHistory[i] = 0;

    for (let i = 0; i < 3 * MAXDEPTH; ++i)
        GameBoard.searchKillers[i] = 0;


    ClearPvTable();
    GameBoard.ply = 0;
    SearchController.nodes = 0;
    SearchController.failHigh = 0;
    SearchController.failHighFirst = 0;
    SearchController.start = $.now();
    SearchController.stop = BOOL.FALSE;
}

const SearchPosition = () => {
    let bestMove = NOMOVE;
    let bestScore = -INFINITE;
    let Score = -INFINITE;
    let line;
    let pvNumber;
    let currentDepth = 0

    ClearForSearch();

    for (currentDepth = 1; currentDepth <= SearchController.depth; ++currentDepth) {
        Score = AlphaBeta(-INFINITE, INFINITE, currentDepth);
        if (SearchController.stop === BOOL.TRUE) break;
        bestScore = Score;
        bestMove = ProbePvTable();
        line = `Depth: ${currentDepth}, Best: ${PrintMove(bestMove)}, Score: ${bestScore}, nodes: ${SearchController.nodes}`;
        pvNumber = GetPvLine(currentDepth);
        line += ` Pv:`;
        for (let i = 0; i < pvNumber; ++i) line += ` ${PrintMove(GameBoard.pvArray[i])}`;
        if (currentDepth !== 1) line += ` Ordering: ${((SearchController.failHighFirst / SearchController.failHigh) * 100).toFixed(2)}%`;
        console.log(line);
    }

    SearchController.best = bestMove;
    SearchController.thinking = BOOL.FALSE;
    UpdateDOMStats(bestScore, currentDepth);
}

const UpdateDOMStats = (domScore, domDepth) => {
    let scoreText = `Счет - ${(domScore).toFixed(2)}`;
    if (Math.abs(domScore) > MATE - MAXDEPTH) scoreText = `Счет - Мат в ${MATE - Math.abs(domScore) - 1} ход`;
    $('#ordering-out').text(`Шанс поражения - ${((SearchController.failHighFirst / SearchController.failHigh) * 100).toFixed(2)}%`);
    $('#depth-out').text(`Глубина - ${domDepth}`);
    $('#score-out').text(scoreText);
    $('#nodes-out').text(`Все возможные ходы - ${SearchController.nodes}`);
    $('#best-out').text(`Выигрышный ход - ${PrintMove(SearchController.best)}`);
}