const PrintSq = (sq) => {
    return (FileChar[FilesBoard[sq]] + RankChar[RanksBoard[sq]]);
}

const PrintMove = (move) => {
    let MoveString;
    let fileFrom = FilesBoard[FROMSQ(move)];
    let rankFrom = RanksBoard[FROMSQ(move)];
    let fileTo = FilesBoard[TOSQ(move)];
    let rankTo = RanksBoard[TOSQ(move)];

    MoveString = FileChar[fileFrom] + RankChar[rankFrom] + FileChar[fileTo] + RankChar[rankTo];

    let promoted = PROMOTED(move);

    if (promoted !== PIECES.EMPTY) {
        let pieceChar = 'q';

        if (PieceKnight[promoted] === BOOL.TRUE) {
            pieceChar = 'n';
        } else if (PieceRookQueen[promoted] === BOOL.TRUE
            && PieceBishopQueen[promoted] === BOOL.FALSE) {
            pieceChar = 'r';
        } else if (PieceRookQueen[promoted] === BOOL.FALSE
            && PieceBishopQueen[promoted] === BOOL.TRUE) {
            pieceChar = 'b';
        }

        MoveString += pieceChar;
    }

    return MoveString;
}

const PrintMoveList = () => {
    let move;
    let num = 1;
    console.log('Start MoveList');

    for (let i = GameBoard.moveListStart[GameBoard.ply];
        i < GameBoard.moveListStart[GameBoard.ply + 1]; ++i) {
        move = GameBoard.moveList[i];
        console.log(`Move: ${num} : ${PrintMove(move)}`);
        num++
    }

    console.log('End MoveList');
}

const ParseMove = (from, to) => {
    GenerateMoves();

    let Move = NOMOVE;
    let PromPiece = PIECES.EMPTY;
    let found = BOOL.FALSE;

    for (let i = GameBoard.moveListStart[GameBoard.ply];
        i < GameBoard.moveListStart[GameBoard.ply + 1]; ++i) {
        Move = GameBoard.moveList[i];

        if (FROMSQ(Move) === from && TOSQ(Move) === to) {
            PromPiece = PROMOTED(Move);

            if (PromPiece !== PIECES.EMPTY) {
                if ((PromPiece === PIECES.WHITE_QUEEN && GameBoard.side === COLOURS.WHITE) ||
                    (PromPiece === PIECES.BLACK_QUEEN && GameBoard.side === COLOURS.BLACK)) {
                    found = BOOL.TRUE
                    break;
                }

                continue;
            }

            found = BOOL.TRUE;
            break;
        }
    }

    if (found !== BOOL.FALSE) {
        if (MakeMove(Move) === BOOL.FALSE) return NOMOVE
        TakeMove();
        return Move;
    }

    return NOMOVE;
}