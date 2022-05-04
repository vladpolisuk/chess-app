const PawnTable = [
    0, 0, 0, 0, 0, 0, 0, 0,
    10, 10, 0, -10, -10, 0, 10, 10,
    5, 0, 0, 5, 5, 0, 0, 5,
    0, 0, 10, 20, 20, 10, 0, 0,
    5, 5, 5, 10, 10, 5, 5, 5,
    10, 10, 10, 20, 20, 10, 10, 10,
    20, 20, 20, 30, 30, 20, 20, 20,
    0, 0, 0, 0, 0, 0, 0, 0
];

const KnightTable = [
    0, -10, 0, 0, 0, 0, -10, 0,
    0, 0, 0, 5, 5, 0, 0, 0,
    0, 0, 10, 10, 10, 10, 0, 0,
    0, 0, 10, 20, 20, 10, 5, 0,
    5, 10, 15, 20, 20, 15, 10, 5,
    5, 10, 10, 20, 20, 10, 10, 5,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
];

const BishopTable = [
    0, 0, -10, 0, 0, -10, 0, 0,
    0, 0, 0, 10, 10, 0, 0, 0,
    0, 0, 10, 15, 15, 10, 0, 0,
    0, 10, 15, 20, 20, 15, 10, 0,
    0, 10, 15, 20, 20, 15, 10, 0,
    0, 0, 10, 15, 15, 10, 0, 0,
    0, 0, 0, 10, 10, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
];

const RookTable = [
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    25, 25, 25, 25, 25, 25, 25, 25,
    0, 0, 5, 10, 10, 5, 0, 0
];

const BishopPair = 40;

const EvalPosition = () => {
    let score = GameBoard.materialOfPieces[COLOURS.WHITE] - GameBoard.materialOfPieces[COLOURS.BLACK];

    let piece;
    let sq;

    piece = PIECES.WHITE_PAWN;
    for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
        sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];
        score += PawnTable[SQ64(sq)];
    }

    piece = PIECES.BLACK_PAWN;
    for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
        sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];
        score -= PawnTable[MIRROR64(SQ64(sq))];
    }

    piece = PIECES.WHITE_KNIGHT;
    for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
        sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];
        score += KnightTable[SQ64(sq)];
    }

    piece = PIECES.BLACK_KNIGHT;
    for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
        sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];
        score -= KnightTable[MIRROR64(SQ64(sq))];
    }

    piece = PIECES.WHITE_BISHOP;
    for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
        sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];
        score += BishopTable[SQ64(sq)];
    }

    piece = PIECES.BLACK_BISHOP;
    for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
        sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];
        score -= BishopTable[MIRROR64(SQ64(sq))];
    }

    piece = PIECES.WHITE_ROOK;
    for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
        sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];
        score += RookTable[SQ64(sq)];
    }

    piece = PIECES.BLACK_ROOK;
    for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
        sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];
        score -= RookTable[MIRROR64(SQ64(sq))];
    }

    piece = PIECES.WHITE_QUEEN;
    for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
        sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];
        score += RookTable[SQ64(sq)];
    }

    piece = PIECES.BLACK_QUEEN;
    for (let pieceNumber = 0; pieceNumber < GameBoard.pieceNumber[piece]; ++pieceNumber) {
        sq = GameBoard.pList[PIECEINDEX(piece, pieceNumber)];
        score -= RookTable[MIRROR64(SQ64(sq))];
    }

    if (GameBoard.pieceNumber[PIECES.WHITE_BISHOP] >= 2) score += BishopPair;
    if (GameBoard.pieceNumber[PIECES.BLACK_BISHOP] >= 2) score -= BishopPair;
    if (GameBoard.side === COLOURS.WHITE) return score
    else return -score
}