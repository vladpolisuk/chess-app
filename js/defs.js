const FILES = {
    FILE_A: 0,
    FILE_B: 1,
    FILE_C: 2,
    FILE_D: 3,
    FILE_E: 4,
    FILE_F: 5,
    FILE_G: 6,
    FILE_H: 7,
    FILE_NONE: 8,
}

const RANKS = {
    RANK_1: 0,
    RANK_2: 1,
    RANK_3: 2,
    RANK_4: 3,
    RANK_5: 4,
    RANK_6: 5,
    RANK_7: 6,
    RANK_8: 7,
    RANK_NONE: 8,
}

const PIECES = {
    EMPTY: 0,
    WHITE_PAWN: 1,
    WHITE_KNIGHT: 2,
    WHITE_BISHOP: 3,
    WHITE_ROOK: 4,
    WHITE_QUEEN: 5,
    WHITE_KING: 6,
    BLACK_PAWN: 7,
    BLACK_KNIGHT: 8,
    BLACK_BISHOP: 9,
    BLACK_ROOK: 10,
    BLACK_QUEEN: 11,
    BLACK_KING: 12,
}

const SQUARES = {
    A1: 21,
    B1: 22,
    C1: 23,
    D1: 24,
    E1: 25,
    F1: 26,
    G1: 27,
    H1: 28,
    A8: 91,
    B8: 92,
    C8: 93,
    D8: 94,
    E8: 95,
    F8: 96,
    G8: 97,
    H8: 98,
    NO_SQ: 99,
    OFF_BOARD: 100
}

const MAXGAMEMOVES = 2048;
const MAXPOSITIONMOVES = 256;
const MAXDEPTH = 64;
const INFINITE = 30000;
const MATE = 29000;
const PVENTRIES = 10000;

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PieceChar = '.PNBRQKpnbrqk';
const SideChar = 'wb-';
const RankChar = '12345678';
const FileChar = 'abcdefgh';

const CASTLEBIT = { WKCA: 1, WQCA: 2, BKCA: 4, BQCA: 8 };

const COLOURS = { WHITE: 0, BLACK: 1, BOTH: 2 }

const BOOL = { FALSE: 0, TRUE: 1 }

const BOARD_SQ_NUMBER = 120
const FilesBoard = new Array(BOARD_SQ_NUMBER)
const RanksBoard = new Array(BOARD_SQ_NUMBER)

const PieceBig = [BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE];
const PieceMaj = [BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE];
const PieceMin = [BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE];
const PieceVal = [0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000];
const PieceCol = [COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE,
COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK];

const PiecePawn = [BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE];
const PieceKnight = [BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE];
const PieceKing = [BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE];
const PieceRookQueen = [BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE];
const PieceBishopQueen = [BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE];
const PieceSlides = [BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE];

const KnightDirections = [-8, -19, -21, -12, 8, 19, 21, 12];
const RookDirections = [-1, -10, 1, 10];
const BishopDirections = [-9, -11, 11, 9];
const KingDirections = [-1, -10, 1, 10, -9, -11, 11, 9];
const Kings = [PIECES.WHITE_KING, PIECES.BLACK_KING];

const CastlePermision = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 7, 15, 15, 15, 3, 15, 15, 11, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15
];

const Mirror64 = [
    56, 57, 58, 59, 60, 61, 62, 63,
    48, 49, 50, 51, 52, 53, 54, 55,
    40, 41, 42, 43, 44, 45, 46, 47,
    32, 33, 34, 35, 36, 37, 38, 39,
    24, 25, 26, 27, 28, 29, 30, 31,
    16, 17, 18, 19, 20, 21, 22, 23,
    8, 9, 10, 11, 12, 13, 14, 15,
    0, 1, 2, 3, 4, 5, 6, 7
];

const DirectionNumber = [0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8];
const PieceDirection = [0, 0, KnightDirections, BishopDirections, RookDirections, KingDirections, KingDirections, 0, KnightDirections, BishopDirections, RookDirections, KingDirections, KingDirections]
const LoopNonSlidePiece = [PIECES.WHITE_KNIGHT, PIECES.WHITE_KING, 0, PIECES.BLACK_KNIGHT, PIECES.BLACK_KING, 0];
const LoopNonSlideIndex = [0, 3];
const LoopSlidePiece = [PIECES.WHITE_BISHOP, PIECES.WHITE_ROOK, PIECES.WHITE_QUEEN, 0, PIECES.BLACK_BISHOP, PIECES.BLACK_ROOK, PIECES.BLACK_QUEEN, 0]
const LoopSlideIndex = [0, 4];

const PieceKeys = new Array(14 * 120);
let SideKey;
const CastleKeys = new Array(16);

const Sq120ToSq64 = new Array(BOARD_SQ_NUMBER);
const Sq64ToSq120 = new Array(64);

const MFLAGEP = 0x40000;
const MFLAGPS = 0x80000;
const MFLAGCA = 0x1000000;
const MFLAGCAP = 0x7C000;
const MFLAGPROM = 0xF00000;
const NOMOVE = 0;

const RAND_32 = () => {
    return (Math.floor((Math.random() * 255) + 1) << 23)
        | (Math.floor((Math.random() * 255) + 1) << 16)
        | (Math.floor((Math.random() * 255) + 1) << 8)
        | Math.floor((Math.random() * 255) + 1);
}

const FR2SQ = (f, r) => ((21 + (f)) + ((r) * 10));

const SQ64 = (sq120) => Sq120ToSq64[(sq120)];

const SQ120 = (sq64) => Sq64ToSq120[(sq64)]

const PIECEINDEX = (piece, pieceNumber) => (piece * 10 + pieceNumber);

const FROMSQ = (m) => (m & 0x7F);

const TOSQ = (m) => ((m >> 7) & 0x7F);

const CAPTURED = (m) => ((m >> 14) & 0xF);

const PROMOTED = (m) => ((m >> 20) & 0xF);

const SQOFFBOARD = (sq) => {
    if (FilesBoard[sq] === SQUARES.OFF_BOARD) return BOOL.TRUE;
    return BOOL.FALSE;
}

const HASH_PIECE = (piece, sq) => {
    GameBoard.posKey ^= PieceKeys[(piece * 120) + sq];
}

const HASH_CASTLE = () => {
    GameBoard.posKey ^= CastleKeys[GameBoard.castlePermision];
}

const HASH_SIDE = () => {
    GameBoard.posKey ^= SideKey;
}

const HASH_EP = () => {
    GameBoard.posKey ^= PieceKeys[GameBoard.enPas]
}

const MIRROR64 = (sq) => {
    return Mirror64[sq];
}

const GameController = {
    engineSide: COLOURS.BOTH,
    playerSide: COLOURS.BOTH,
    gameOver: BOOL.FALSE,
    flippedBoard: 0
}

const UserMove = {
    from: SQUARES.NO_SQ,
    to: SQUARES.NO_SQ,
    sq: SQUARES.NO_SQ
}