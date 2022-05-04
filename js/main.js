$(() => {
    init();
    NewGame(START_FEN);
})

const InitFilesAndRanks = () => {
    let sq = SQUARES.A1;

    for (let i = 0; i < BOARD_SQ_NUMBER; ++i) {
        FilesBoard[i] = SQUARES.OFF_BOARD
        RanksBoard[i] = SQUARES.OFF_BOARD
    }

    for (let rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (let file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            sq = FR2SQ(file, rank);
            FilesBoard[sq] = file;
            RanksBoard[sq] = rank;
        }
    }
}

const InitHashKeys = () => {
    for (let i = 0; i < 14 * 120; ++i) {
        PieceKeys[i] = RAND_32();
    }

    SideKey = RAND_32();

    for (let i = 0; i < 16; ++i) {
        CastleKeys[i] = RAND_32();
    }
}

const InitSq120To64 = () => {
    let sq64 = 0;
    let sq = SQUARES.A1;

    for (let i = 0; i < BOARD_SQ_NUMBER; ++i) {
        Sq120ToSq64[i] = 65
    }

    for (let i = 0; i < 64; ++i) {
        Sq64ToSq120[i] = 120;
    }

    for (let rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (let file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            sq = FR2SQ(file, rank);
            Sq64ToSq120[sq64] = sq;
            Sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }
}

const InitBoardVars = () => {
    for (let i = 0; i < MAXGAMEMOVES; ++i) {
        GameBoard.history.push({
            move: NOMOVE,
            castlePermision: 0,
            enPas: 0,
            fiftyMove: 0,
            posKey: 0
        })
    }

    for (let i = 0; i < PVENTRIES; ++i) {
        GameBoard.pvTable.push({
            move: NOMOVE,
            posKey: 0
        })
    }
}

const init = () => {
    InitFilesAndRanks()
    InitHashKeys();
    InitSq120To64();
    InitBoardVars();
    InitMvvLva();
}
