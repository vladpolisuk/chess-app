const ClearPiece = (sq) => {
    let piece = GameBoard.pieces[sq];
    let col = PieceCol[piece];
    let t_pieceNumber = -1;

    HASH_PIECE(piece, sq);

    GameBoard.pieces[sq] = PIECES.EMPTY;
    GameBoard.materialOfPieces[col] -= PieceVal[piece];

    for (let i = 0; i < GameBoard.pieceNumber[piece]; ++i) {
        if (GameBoard.pList[PIECEINDEX(piece, i)] === sq) {
            t_pieceNumber = i;
            break;
        }
    }

    GameBoard.pieceNumber[piece]--;
    GameBoard.pList[PIECEINDEX(piece, t_pieceNumber)] = GameBoard.pList[PIECEINDEX(piece, GameBoard.pieceNumber[piece])]
}

const AddPiece = (sq, piece) => {
    let color = PieceCol[piece];

    HASH_PIECE(piece, sq);

    GameBoard.pieces[sq] = piece;
    GameBoard.materialOfPieces[color] += PieceVal[piece];
    GameBoard.pList[PIECEINDEX(piece, GameBoard.pieceNumber[piece])] = sq;
    GameBoard.pieceNumber[piece]++;
}

const MovePiece = (from, to) => {
    let piece = GameBoard.pieces[from];

    HASH_PIECE(piece, from);
    GameBoard.pieces[from] = PIECES.EMPTY;

    HASH_PIECE(piece, to);
    GameBoard.pieces[to] = piece;

    for (let i = 0; i < GameBoard.pieceNumber[piece]; ++i) {
        if (GameBoard.pList[PIECEINDEX(piece, i)] === from) {
            GameBoard.pList[PIECEINDEX(piece, i)] = to;
            break;
        }
    }
}

const MakeMove = (move) => {
    let from = FROMSQ(move);
    let to = TOSQ(move);
    let side = GameBoard.side;

    GameBoard.history[GameBoard.hisPly].posKey = GameBoard.posKey;

    if ((move & MFLAGEP) !== 0) {
        if (side === COLOURS.WHITE) {
            ClearPiece(to - 10);
        } else {
            ClearPiece(to + 10);
        }
    } else if ((move & MFLAGCA) !== 0) {
        switch (to) {
            case SQUARES.C1: MovePiece(SQUARES.A1, SQUARES.D1); break;
            case SQUARES.C8: MovePiece(SQUARES.A8, SQUARES.D8); break;
            case SQUARES.G1: MovePiece(SQUARES.H1, SQUARES.F1); break;
            case SQUARES.G8: MovePiece(SQUARES.H8, SQUARES.F8); break;
            default: break;
        }
    }

    if (GameBoard.enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CASTLE();

    GameBoard.history[GameBoard.hisPly].move = move;
    GameBoard.history[GameBoard.hisPly].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.hisPly].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.hisPly].castlePermision = GameBoard.castlePermision;

    GameBoard.castlePermision &= CastlePermision[from];
    GameBoard.castlePermision &= CastlePermision[to];
    GameBoard.enPas = SQUARES.NO_SQ;

    HASH_CASTLE();

    let captured = CAPTURED(move);
    GameBoard.fiftyMove++;

    if (captured !== PIECES.EMPTY) {
        ClearPiece(to);
        GameBoard.fiftyMove = 0;
    }

    GameBoard.hisPly++;
    GameBoard.ply++;

    if (PiecePawn[GameBoard.pieces[from]] === BOOL.TRUE) {
        GameBoard.fiftyMove = 0;

        if ((move & MFLAGPS) !== 0) {
            if (side === COLOURS.WHITE) {
                GameBoard.enPas = from + 10;
            } else {
                GameBoard.enPas = from - 10;
            }

            HASH_EP();
        }
    }

    MovePiece(from, to);

    let promotedPiece = PROMOTED(move);

    if (promotedPiece !== PIECES.EMPTY) {
        ClearPiece(to);
        AddPiece(to, promotedPiece);
    }

    GameBoard.side ^= 1;
    HASH_SIDE();

    if (SqAttaked(GameBoard.pList[PIECEINDEX(Kings[side], 0)], GameBoard.side)) {
        TakeMove();
        return BOOL.FALSE;
    }

    return BOOL.TRUE;
}

const TakeMove = () => {
    GameBoard.hisPly--;
    GameBoard.ply--;

    const move = GameBoard.history[GameBoard.hisPly].move;
    const from = FROMSQ(move);
    const to = TOSQ(move);

    if (GameBoard.enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CASTLE();

    GameBoard.castlePermision = GameBoard.history[GameBoard.hisPly].castlePermision;
    GameBoard.fiftyMove = GameBoard.history[GameBoard.hisPly].fiftyMove;
    GameBoard.enPas = GameBoard.history[GameBoard.hisPly].enPas;

    if (GameBoard.enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CASTLE();

    GameBoard.side ^= 1;
    HASH_SIDE();

    if ((MFLAGEP & move) !== 0) {
        if (GameBoard.side === COLOURS.WHITE) {
            AddPiece(to - 10, PIECES.BLACK_PAWN)
        } else {
            AddPiece(to + 10, PIECES.WHITE_PAWN)
        }
    } else if ((MFLAGCA & move) !== 0) {
        switch (to) {
            case SQUARES.C1: MovePiece(SQUARES.D1, SQUARES.A1); break;
            case SQUARES.C8: MovePiece(SQUARES.D8, SQUARES.A8); break;
            case SQUARES.G1: MovePiece(SQUARES.F1, SQUARES.H1); break;
            case SQUARES.G8: MovePiece(SQUARES.F8, SQUARES.H8); break;
            default: break;
        }
    }

    MovePiece(to, from);

    let captured = CAPTURED(move);

    if (captured !== PIECES.EMPTY)
        AddPiece(to, captured);

    if (PROMOTED(move) !== PIECES.EMPTY) {
        ClearPiece(from);
        const piece = PieceCol[PROMOTED(move)] === COLOURS.WHITE ? PIECES.WHITE_PAWN : PIECES.BLACK_PAWN;
        AddPiece(from, piece)
    }
}
