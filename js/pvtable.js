const GetPvLine = (depth) => {
    let move = ProbePvTable();
    let count = 0;

    while ((move !== NOMOVE) && (count < depth)) {
        if (MoveExists(move) === BOOL.TRUE) {
            MakeMove(move);
            GameBoard.pvArray[count++] = move;
        } else {
            break;
        }

        move = ProbePvTable();
    }

    while (GameBoard.ply > 0) TakeMove();

    return count;
}

const ProbePvTable = () => {
    const index = GameBoard.posKey % PVENTRIES;

    if (GameBoard.pvTable[index].posKey === GameBoard.posKey) {
        return GameBoard.pvTable[index].move;
    }

    return NOMOVE
}

const StorePvMove = (move) => {
    const index = GameBoard.posKey % PVENTRIES;
    GameBoard.pvTable[index].posKey = GameBoard.posKey;
    GameBoard.pvTable[index].move = move;
}