const MvvLvaValue = [0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600];
const MvvLvaScores = new Array(14 * 14);

const InitMvvLva = () => {
    for (let attacker = PIECES.WHITE_PAWN; attacker <= PIECES.BLACK_KING; ++attacker) {
        for (let victim = PIECES.WHITE_PAWN; victim <= PIECES.BLACK_KING; ++victim) {
            MvvLvaScores[victim * 14 + attacker] = MvvLvaValue[victim] + 6 - (MvvLvaValue[attacker] / 100);
        }
    }
}

const MoveExists = (move) => {
    GenerateMoves();

    let moveFound = NOMOVE;

    for (let i = GameBoard.moveListStart[GameBoard.ply];
        i < GameBoard.moveListStart[GameBoard.ply + 1]; ++i) {
        moveFound = GameBoard.moveList[i];
        if (MakeMove(moveFound) === BOOL.FALSE) continue
        TakeMove();
        if (move === moveFound) return BOOL.TRUE
    }

    return BOOL.FALSE;
}

const MOVE = (from, to, captured, promoted, flag) => {
    return from | (to << 7) | (captured << 14) | (promoted << 20) | flag;
}

const AddCaptureMove = (move) => {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] =
        MvvLvaScores[CAPTURED(move) * 14 + GameBoard.pieces[FROMSQ(move)]] + 1_000_000;
}

const AddQuietMove = (move) => {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 0;

    if (move === GameBoard.searchKillers[GameBoard.ply]) {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 900_000
    } else if (move === GameBoard.searchKillers[GameBoard.ply + MAXDEPTH]) {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 800_000
    } else {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] =
            GameBoard.searchHistory[GameBoard.pieces[FROMSQ(move)] * BOARD_SQ_NUMBER + TOSQ(move)];
    }

    GameBoard.moveListStart[GameBoard.ply + 1]++
}

const AddEnPassantMove = (move) => {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] = 105 + 1_000_000;
}

const AddWhitePawnCaptureMove = (from, to, cap) => {
    if (RanksBoard[from] == RANKS.RANK_7) {
        AddCaptureMove(MOVE(from, to, cap, PIECES.WHITE_QUEEN, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.WHITE_ROOK, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.WHITE_BISHOP, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.WHITE_KNIGHT, 0));
    } else {
        AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

const AddBlackPawnCaptureMove = (from, to, cap) => {
    if (RanksBoard[from] === RANKS.RANK_2) {
        AddCaptureMove(MOVE(from, to, cap, PIECES.BLACK_QUEEN, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.BLACK_ROOK, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.BLACK_BISHOP, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.BLACK_KNIGHT, 0));
    } else {
        AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

const AddWhitePawnQuietMove = (from, to) => {
    if (RanksBoard[from] === RANKS.RANK_7) {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.WHITE_QUEEN, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.WHITE_ROOK, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.WHITE_BISHOP, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.WHITE_KNIGHT, 0));
    } else {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

const AddBlackPawnQuietMove = (from, to) => {
    if (RanksBoard[from] === RANKS.RANK_2) {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.BLACK_QUEEN, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.BLACK_ROOK, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.BLACK_BISHOP, 0));
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.BLACK_KNIGHT, 0));
    } else {
        AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

const GenerateMoves = () => {
    GameBoard.moveListStart[GameBoard.ply + 1] = GameBoard.moveListStart[GameBoard.ply];

    let pieceType;
    let pieceIndex;
    let piece;
    let sq;
    let t_sq;
    let direction;

    if (GameBoard.side === COLOURS.WHITE) {
        pieceType = PIECES.WHITE_PAWN;

        for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[pieceType]; ++pieceNumber) {
            sq = GameBoard.pList[PIECEINDEX(pieceType, pieceNumber)];

            if (GameBoard.pieces[sq + 10] === PIECES.EMPTY) {
                AddWhitePawnQuietMove(sq, sq + 10);

                if (RanksBoard[sq] === RANKS.RANK_2
                    && GameBoard.pieces[sq + 20] === PIECES.EMPTY) {
                    AddQuietMove(MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }

            if (SQOFFBOARD(sq + 9) === BOOL.FALSE
                && PieceCol[GameBoard.pieces[sq + 9]] === COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq + 9])
            }

            if (SQOFFBOARD(sq + 11) === BOOL.FALSE
                && PieceCol[GameBoard.pieces[sq + 11]] === COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq + 11])
            }

            if (GameBoard.enPas !== SQUARES.NO_SQ) {
                if (sq + 9 === GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }

                if (sq + 11 === GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }

        if (GameBoard.castlePermision & CASTLEBIT.WKCA) {
            if (GameBoard.pieces[SQUARES.F1] === PIECES.EMPTY
                && GameBoard.pieces[SQUARES.G1] === PIECES.EMPTY) {
                if (SqAttaked(SQUARES.F1, COLOURS.BLACK) === BOOL.FALSE
                    && SqAttaked(SQUARES.E1, COLOURS.BLACK) === BOOL.FALSE) {
                    AddQuietMove(MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        if (GameBoard.castlePermision & CASTLEBIT.WQCA) {
            if (GameBoard.pieces[SQUARES.D1] === PIECES.EMPTY
                && GameBoard.pieces[SQUARES.C1] === PIECES.EMPTY
                && GameBoard.pieces[SQUARES.B1] === PIECES.EMPTY) {
                if (SqAttaked(SQUARES.D1, COLOURS.BLACK) === BOOL.FALSE
                    && SqAttaked(SQUARES.E1, COLOURS.BLACK) === BOOL.FALSE) {
                    AddQuietMove(MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
    } else {
        pieceType = PIECES.BLACK_PAWN;

        for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[pieceType]; ++pieceNumber) {
            sq = GameBoard.pList[PIECEINDEX(pieceType, pieceNumber)];

            if (GameBoard.pieces[sq - 10] === PIECES.EMPTY) {
                AddBlackPawnQuietMove(sq, sq - 10);

                if (RanksBoard[sq] === RANKS.RANK_7
                    && GameBoard.pieces[sq - 20] === PIECES.EMPTY) {
                    AddQuietMove(MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }

            if (SQOFFBOARD(sq - 9) === BOOL.FALSE
                && PieceCol[GameBoard.pieces[sq - 9]] === COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq - 9])
            }

            if (SQOFFBOARD(sq - 11) === BOOL.FALSE
                && PieceCol[GameBoard.pieces[sq - 11]] === COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq - 11])
            }

            if (GameBoard.enPas !== SQUARES.NO_SQ) {
                if (sq - 9 === GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }

                if (sq - 11 === GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }

        if (GameBoard.castlePermision & CASTLEBIT.BKCA) {
            if (GameBoard.pieces[SQUARES.F8] === PIECES.EMPTY
                && GameBoard.pieces[SQUARES.G8] === PIECES.EMPTY) {
                if (SqAttaked(SQUARES.F8, COLOURS.WHITE) === BOOL.FALSE
                    && SqAttaked(SQUARES.E8, COLOURS.WHITE) === BOOL.FALSE) {
                    AddQuietMove(MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }

        if (GameBoard.castlePermision & CASTLEBIT.BQCA) {
            if (GameBoard.pieces[SQUARES.D8] === PIECES.EMPTY
                && GameBoard.pieces[SQUARES.C8] === PIECES.EMPTY
                && GameBoard.pieces[SQUARES.B8] === PIECES.EMPTY) {
                if (SqAttaked(SQUARES.D8, COLOURS.WHITE) === BOOL.FALSE
                    && SqAttaked(SQUARES.E8, COLOURS.WHITE) === BOOL.FALSE) {
                    AddQuietMove(MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
    }

    pieceIndex = LoopNonSlideIndex[GameBoard.side];
    piece = LoopNonSlidePiece[pieceIndex++];

    while (piece !== 0) {
        for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
            sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];

            for (let i = 0; i < DirectionNumber[piece]; i++) {
                direction = PieceDirection[piece][i];
                t_sq = sq + direction;

                if (SQOFFBOARD(t_sq) === BOOL.TRUE) continue

                if (GameBoard.pieces[t_sq] !== PIECES.EMPTY) {
                    if (PieceCol[GameBoard.pieces[t_sq]] !== GameBoard.side) {
                        AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                    }
                } else {
                    AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                }
            }
        }

        piece = LoopNonSlidePiece[pieceIndex++];
    }

    pieceIndex = LoopSlideIndex[GameBoard.side];
    piece = LoopSlidePiece[pieceIndex++];

    while (piece !== 0) {
        for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
            sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];

            for (let i = 0; i < DirectionNumber[piece]; i++) {
                direction = PieceDirection[piece][i];
                t_sq = sq + direction;

                while (SQOFFBOARD(t_sq) === BOOL.FALSE) {
                    if (GameBoard.pieces[t_sq] !== PIECES.EMPTY) {
                        if (PieceCol[GameBoard.pieces[t_sq]] !== GameBoard.side) {
                            AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                        }

                        break;
                    }

                    AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                    t_sq += direction;
                }
            }
        }

        piece = LoopSlidePiece[pieceIndex++];
    }
}

const GenerateCaptures = () => {
    GameBoard.moveListStart[GameBoard.ply + 1] = GameBoard.moveListStart[GameBoard.ply];

    let pieceType;
    let sq;
    let pieceIndex;
    let piece;
    let t_sq;
    let dir;

    if (GameBoard.side == COLOURS.WHITE) {
        pieceType = PIECES.WHITE_PAWN;

        for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[pieceType]; ++pieceNumber) {
            sq = GameBoard.pList[PIECEINDEX(pieceType, pieceNumber)];

            if (SQOFFBOARD(sq + 9) == BOOL.FALSE
                && PieceCol[GameBoard.pieces[sq + 9]] == COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq + 9]);
            }

            if (SQOFFBOARD(sq + 11) == BOOL.FALSE
                && PieceCol[GameBoard.pieces[sq + 11]] == COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq + 11]);
            }

            if (GameBoard.enPas != SQUARES.NOSQ) {
                if (sq + 9 == GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }

                if (sq + 11 == GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }

        }

    } else {
        pieceType = PIECES.BLACK_PAWN;

        for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[pieceType]; ++pieceNumber) {
            sq = GameBoard.pList[PIECEINDEX(pieceType, pieceNumber)];

            if (SQOFFBOARD(sq - 9) == BOOL.FALSE
                && PieceCol[GameBoard.pieces[sq - 9]] == COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq - 9]);
            }

            if (SQOFFBOARD(sq - 11) == BOOL.FALSE
                && PieceCol[GameBoard.pieces[sq - 11]] == COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq - 11]);
            }

            if (GameBoard.enPas != SQUARES.NOSQ) {
                if (sq - 9 == GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }

                if (sq - 11 == GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
    }

    pieceIndex = LoopNonSlideIndex[GameBoard.side];
    piece = LoopNonSlidePiece[pieceIndex++];

    while (piece != 0) {
        for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
            sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];

            for (let i = 0; i < DirectionNumber[piece]; i++) {
                dir = PieceDirection[piece][i];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq) == BOOL.TRUE) continue;

                if (GameBoard.pieces[t_sq] != PIECES.EMPTY) {
                    if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                        AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                    }
                }
            }
        }

        piece = LoopNonSlidePiece[pieceIndex++];
    }

    pieceIndex = LoopSlideIndex[GameBoard.side];
    piece = LoopSlidePiece[pieceIndex++];

    while (piece != 0) {
        for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
            sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];

            for (let i = 0; i < DirectionNumber[piece]; i++) {
                dir = PieceDirection[piece][i];
                t_sq = sq + dir;

                while (SQOFFBOARD(t_sq) == BOOL.FALSE) {
                    if (GameBoard.pieces[t_sq] != PIECES.EMPTY) {
                        if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                            AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                        }

                        break;
                    }

                    t_sq += dir;
                }
            }
        }

        piece = LoopSlidePiece[pieceIndex++];
    }
}
