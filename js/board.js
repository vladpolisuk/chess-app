const getPieceIndex = (piece, pieceNumber) => {
    return (piece * 10 + pieceNumber)
}

const GameBoard = {
    pieces: new Array(BOARD_SQ_NUMBER),
    side: COLOURS.WHITE,
    fiftyMove: 0,
    hisPly: 0,
    history: [],
    ply: 0,
    enPas: 0,
    castlePermision: 0,
    materialOfPieces: new Array(2),
    pieceNumber: new Array(13),
    pList: new Array(14 * 10),
    posKey: 0,
    moveList: new Array(MAXDEPTH * MAXPOSITIONMOVES),
    moveScores: new Array(MAXDEPTH * MAXPOSITIONMOVES),
    moveListStart: new Array(MAXDEPTH),
    pvTable: [],
    pvArray: new Array(MAXDEPTH),
    searchHistory: new Array(14 * BOARD_SQ_NUMBER),
    searchKillers: new Array(3 * MAXDEPTH)
};

function CheckBoard() {
    let t_pieceNumber = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let t_material = [0, 0];
    let sq120, t_piece, t_piece_number, colour, pieceCount;

    for (t_piece = PIECES.WHITE_PAWN; t_piece <= PIECES.BLACK_KING; ++t_piece) {
        for (t_piece_number = 0; t_piece_number < GameBoard.pieceNumber[t_piece]; ++t_piece_number) {
            sq120 = GameBoard.pList[PIECEINDEX(t_piece, t_piece_number)];

            if (GameBoard.pieces[sq120] !== t_piece) {
                console.log('Error Piece Lists');
                return BOOL.FALSE;
            }
        }
    }

    for (let sq64 = 0; sq64 < 64; ++sq64) {
        sq120 = SQ120(sq64);
        t_piece = GameBoard.pieces[sq120];
        t_pieceNumber[t_piece]++;
        t_material[PieceCol[t_piece]] += PieceVal[t_piece];
    }

    for (t_piece = PIECES.WHITE_PAWN; t_piece <= PIECES.BLACK_KING; ++t_piece) {
        if (t_pieceNumber[t_piece] !== GameBoard.pieceNumber[t_piece]) {
            console.log('Error <t_pieceNumber>');
            return BOOL.FALSE;
        }
    }

    if (t_material[COLOURS.WHITE] !== GameBoard.materialOfPieces[COLOURS.WHITE]
        || t_material[COLOURS.BLACK] !== GameBoard.materialOfPieces[COLOURS.BLACK]) {
        console.log('Error <t_material>');
        return BOOL.FALSE;
    }

    if (GameBoard.side !== COLOURS.WHITE && GameBoard.side !== COLOURS.BLACK) {
        console.log('Error <GameBoard.side>');
        return BOOL.FALSE;
    }

    if (GeneratePosKey() !== GameBoard.posKey) {
        console.log('Error <GameBoard.posKey>');
        return BOOL.FALSE;
    }

    return BOOL.TRUE;
}

const PrintBoard = () => {
    let sq, piece;

    console.log("\Game Board:\n");

    for (let rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        let line = `${RankChar[rank]}  `;

        for (let file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file, rank);
            piece = GameBoard.pieces[sq];
            line += ` ${PieceChar[piece]} `;
        }

        console.log(line);
    }

    console.log("");

    let line = "   ";

    for (let file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
        line += ` ${FileChar[file]} `;
    }

    console.log(line);
    console.log("");
    console.log(`side: ${SideChar[GameBoard.side]}`);
    console.log(`enPas: ${GameBoard.enPas}`);
    line = "";


    if (GameBoard.castlePermision & CASTLEBIT.WKCA) line += 'K';
    if (GameBoard.castlePermision & CASTLEBIT.WQCA) line += 'Q';
    if (GameBoard.castlePermision & CASTLEBIT.BKCA) line += 'k';
    if (GameBoard.castlePermision & CASTLEBIT.BQCA) line += 'q';

    console.log(`castle: ${line}`);
    console.log(`key: ${GameBoard.posKey.toString(16)}`);
    console.log('----------------------------------------');
}

const GeneratePosKey = () => {
    let finalKey = 0;
    let piece = PIECES.EMPTY;

    for (let sq = 0; sq < BOARD_SQ_NUMBER; ++sq) {
        piece = GameBoard.pieces[sq];

        if (piece !== PIECES.EMPTY && piece !== SQUARES.OFF_BOARD) {
            finalKey ^= PieceKeys[(piece * 120) + sq];
        }
    }

    if (GameBoard.side === COLOURS.WHITE) {
        finalKey ^= SideKey;
    }

    if (GameBoard.enPas !== SQUARES.NO_SQ) {
        finalKey ^= PieceKeys[GameBoard.enPas]
    }

    finalKey ^= CastleKeys[GameBoard.castlePermision];

    return finalKey;
}

const PrintPieceLists = () => {
    for (let piece = PIECES.WHITE_PAWN; piece <= PIECES.BLACK_KING; ++piece) {
        for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
            console.log(`Piece ${PieceChar[piece]} on ${PrintSq(GameBoard.pList[PIECEINDEX(piece, pieceNumber)])}`);
        }
    }
}

const UpdateListsMaterial = () => {
    let sq, piece, colour;

    for (let i = 0; i < 14 * 120; ++i)
        GameBoard.pList[i] = PIECES.EMPTY;

    for (let i = 0; i < 2; ++i)
        GameBoard.materialOfPieces[i] = 0;

    for (let i = 0; i < 13; ++i)
        GameBoard.pieceNumber[i] = 0;

    for (let i = 0; i < 64; ++i) {
        sq = SQ120(i);
        piece = GameBoard.pieces[sq];

        if (piece !== PIECES.EMPTY) {
            colour = PieceCol[piece];
            GameBoard.materialOfPieces[colour] += PieceVal[piece];
            GameBoard.pList[PIECEINDEX(piece, GameBoard.pieceNumber[piece])] = sq;
            GameBoard.pieceNumber[piece]++;
        }
    }
}

const ResetBoard = () => {
    for (let i = 0; i < BOARD_SQ_NUMBER; ++i)
        GameBoard.pieces[i] = SQUARES.OFF_BOARD;

    for (let i = 0; i < 64; ++i)
        GameBoard.pieces[SQ120(i)] = PIECES.EMPTY;

    GameBoard.side = COLOURS.BOTH;
    GameBoard.enPas = SQUARES.NO_SQ;
    GameBoard.fiftyMove = 0;
    GameBoard.ply = 0;
    GameBoard.hisPly = 0;
    GameBoard.castlePermision = 0;
    GameBoard.posKey = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0;
}

const ParseFen = (fen) => {
    ResetBoard();

    let rank = RANKS.RANK_8;
    let file = FILES.FILE_A;
    let fenCharIndex = 0;
    let count = 0;
    let sq120 = 0;

    while ((rank >= RANKS.RANK_1) && fenCharIndex < fen.length) {
        count = 1;

        switch (fen[fenCharIndex]) {
            case 'p': piece = PIECES.BLACK_PAWN; break;
            case 'r': piece = PIECES.BLACK_ROOK; break;
            case 'n': piece = PIECES.BLACK_KNIGHT; break;
            case 'b': piece = PIECES.BLACK_BISHOP; break;
            case 'k': piece = PIECES.BLACK_KING; break;
            case 'q': piece = PIECES.BLACK_QUEEN; break;
            case 'P': piece = PIECES.WHITE_PAWN; break;
            case 'R': piece = PIECES.WHITE_ROOK; break;
            case 'N': piece = PIECES.WHITE_KNIGHT; break;
            case 'B': piece = PIECES.WHITE_BISHOP; break;
            case 'K': piece = PIECES.WHITE_KING; break;
            case 'Q': piece = PIECES.WHITE_QUEEN; break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.EMPTY;
                count = fen[fenCharIndex].charCodeAt() - '0'.charCodeAt();
                break;

            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCharIndex++;
                continue;

            default:
                console.log('FEN error');
                return;
        }

        for (let i = 0; i < count; i++) {
            sq120 = FR2SQ(file, rank);
            GameBoard.pieces[sq120] = piece;
            file++;
        }

        fenCharIndex++;
    }

    GameBoard.side = fen[fenCharIndex] === 'w' ? COLOURS.WHITE : COLOURS.BLACK;
    fenCharIndex += 2;

    for (let i = 0; i < 4; i++) {
        if (fen[fenCharIndex] === ' ') break;

        switch (fen[fenCharIndex]) {
            case 'K': GameBoard.castlePermision |= CASTLEBIT.WKCA; break;
            case 'Q': GameBoard.castlePermision |= CASTLEBIT.WQCA; break;
            case 'k': GameBoard.castlePermision |= CASTLEBIT.BKCA; break;
            case 'q': GameBoard.castlePermision |= CASTLEBIT.BQCA; break;
            default: break;
        }

        fenCharIndex++;
    }

    fenCharIndex++;

    if (fen[fenCharIndex] !== '-') {
        file = fen[fenCharIndex].charCodeAt() - 'a'.charCodeAt();
        rank = fen[fenCharIndex + 1].charCodeAt() - '1'.charCodeAt();
        console.log(`fen[fenCharIndex]: ${fen[fenCharIndex]}, File: ${file}, Rank: ${rank}`);
        GameBoard.enPas = FR2SQ(file, rank);
    }

    GameBoard.posKey = GeneratePosKey();
    UpdateListsMaterial();
    PrintSqAttaked()
}

const PrintSqAttaked = () => {
    let sq, piece;

    console.log('\nAttacked:');

    for (let rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        let line = `${rank + 1}  `;

        for (let file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file, rank);
            if (SqAttaked(sq, GameBoard.side ^ 1) === BOOL.TRUE) piece = 'X';
            else piece = '-';
            line += ` ${piece} `;
        }

        console.log(line);
    }

    console.log('');
}

const SqAttaked = (sq, side) => {
    let piece;
    let t_sq;
    let dir;

    if (side === COLOURS.WHITE) {
        if (GameBoard.pieces[sq - 11] === PIECES.WHITE_PAWN
            || GameBoard.pieces[sq - 9] === PIECES.WHITE_PAWN) {
            return BOOL.TRUE;
        }
    } else {
        if (GameBoard.pieces[sq + 11] === PIECES.BLACK_PAWN
            || GameBoard.pieces[sq + 9] === PIECES.BLACK_PAWN) {
            return BOOL.TRUE;
        }
    }

    for (let i = 0; i < 8; i++) {
        piece = GameBoard.pieces[sq + KnightDirections[i]];

        if (piece !== SQUARES.OFF_BOARD
            && PieceCol[piece] === side
            && PieceKnight[piece] === BOOL.TRUE) {
            return BOOL.TRUE
        }
    }

    for (let i = 0; i < 4; ++i) {
        dir = RookDirections[i];
        t_sq = sq + dir
        piece = GameBoard.pieces[t_sq];

        while (piece !== SQUARES.OFF_BOARD) {
            if (piece !== PIECES.EMPTY) {
                if (PieceRookQueen[piece] === BOOL.TRUE
                    && PieceCol[piece] === side) {
                    return BOOL.TRUE;
                }

                break;
            }

            t_sq += dir;
            piece = GameBoard.pieces[t_sq];
        }
    }

    for (let i = 0; i < 4; ++i) {
        dir = BishopDirections[i];
        t_sq = sq + dir
        piece = GameBoard.pieces[t_sq];

        while (piece !== SQUARES.OFF_BOARD) {
            if (piece !== PIECES.EMPTY) {
                if (PieceBishopQueen[piece] === BOOL.TRUE
                    && PieceCol[piece] === side) {
                    return BOOL.TRUE;
                }

                break;
            }

            t_sq += dir;
            piece = GameBoard.pieces[t_sq];
        }
    }

    for (let i = 0; i < 8; i++) {
        piece = GameBoard.pieces[sq + KingDirections[i]];

        if (piece !== SQUARES.OFF_BOARD
            && PieceCol[piece] === side
            && PieceKing[piece] === BOOL.TRUE) {
            return BOOL.TRUE
        }
    }

    return BOOL.FALSE
}