let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))

let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

$("#set-fen").click(() => {
    const value = $(".fen-input").val();
    if (!value) return;
    NewGame(value);
})

$('#take-button').click(() => {
    if (GameBoard.hisPly > 0) {
        TakeMove();
        GameBoard.ply = 0;
        SetInitialBoardPieces();
    }
})

$('#newgame-button').click(() => {
    NewGame(START_FEN);
})

const NewGame = (fenString) => {
    ParseFen(fenString);
    PrintBoard();
    SetInitialBoardPieces();
    CheckAndSet();
}

const ClearAllPieces = () => {
    $('.piece').remove();
}

const SetInitialBoardPieces = () => {
    let sq;
    let sq120;
    let piece;

    ClearAllPieces();

    for (sq = 0; sq < 64; ++sq) {
        sq120 = SQ120(sq);
        piece = GameBoard.pieces[sq120];

        if (piece >= PIECES.WHITE_PAWN && piece <= PIECES.BLACK_KING) {
            AddGUIPiece(sq120, piece)
        }
    }
}

const DeselectSq = (sq) => {
    const rank = `rank_${RanksBoard[sq] + 1}`;
    const file = `file_${FilesBoard[sq] + 1}`;
    $(`.${rank}.${file}`).removeClass('board__file-selected')
}

const SelectSq = (sq) => {
    const rank = `rank_${RanksBoard[sq] + 1}`;
    const file = `file_${FilesBoard[sq] + 1}`;
    $(`.${rank}.${file}`).addClass('board__file-selected')
}

const ClickedSquare = (pageX, pageY) => {
    let position = $('.game__board').position();
    let workedX = Math.floor(position.left);
    let workedY = Math.floor(position.top);
    pageX = Math.floor(pageX);
    pageY = Math.floor(pageY);
    let file = Math.floor((pageX - workedX) / 60);
    let rank = 7 - Math.floor((pageY - workedY) / 60);
    let sq = FR2SQ(file, rank);
    console.log(`Clicked sq ${PrintSq(sq)}`);
    SelectSq(sq);
    return sq;
}

$(document).on('click', '.piece', (event) => {
    if (UserMove.from === SQUARES.NO_SQ) {
        UserMove.from = ClickedSquare(event.pageX, event.pageY)
    } else {
        UserMove.to = ClickedSquare(event.pageX, event.pageY)
    }

    MakeUserMove();
})

$(document).on('click', '.board__file', (event) => {
    if (UserMove.from === SQUARES.NO_SQ) return

    if (UserMove.from !== SQUARES.NO_SQ
        && UserMove.from !== ClickedSquare(event.pageX, event.pageY)) {
        UserMove.to = ClickedSquare(event.pageX, event.pageY)
        MakeUserMove();
    }
})

const MakeUserMove = () => {
    if (UserMove.from !== SQUARES.NO_SQ && UserMove.to !== SQUARES.NO_SQ) {
        console.log(`User Move: ${PrintSq(UserMove.from)}${PrintSq(UserMove.to)}`);
        let parsed = ParseMove(UserMove.from, UserMove.to);

        if (parsed !== NOMOVE) {
            MakeMove(parsed);
            PrintBoard();
            MoveGUIPiece(parsed);
            CheckAndSet();
            PreSearch();
        }

        DeselectSq(UserMove.from)
        DeselectSq(UserMove.to)

        UserMove.from = SQUARES.NO_SQ;
        UserMove.to = SQUARES.NO_SQ;
    }
}

const RemoveGUIPiece = (sq) => {
    const rank = `rank_${RanksBoard[sq] + 1}`;
    const file = `file_${FilesBoard[sq] + 1}`;
    $(`.piece.${rank}.${file}`).remove();
}

const AddGUIPiece = (sq, piece) => {
    const rankName = `rank_${RanksBoard[sq] + 1}`;
    const fileName = `file_${FilesBoard[sq] + 1}`;
    const pieceFileName = `images/${SideChar[PieceCol[piece]] + PieceChar[piece].toUpperCase()}.png`;
    const imageString = `<image src="${pieceFileName}" class="piece ${rankName} ${fileName}"/>`;
    $(`.${rankName}.${fileName}`).append(imageString)
}

const MoveGUIPiece = (move) => {
    const from = FROMSQ(move);
    const to = TOSQ(move);

    if (move & MFLAGEP) {
        let epRemove;
        if (GameBoard.side === COLOURS.BLACK) epRemove = to - 10;
        else epRemove = to + 10;
        RemoveGUIPiece(epRemove);
    } else if (CAPTURED(move)) {
        RemoveGUIPiece(to);
    }

    let rankFrom = RanksBoard[from];
    let rankTo = RanksBoard[to]
    const rankNameFrom = `rank_${rankFrom + 1}`;
    const rankNameTo = `rank_${rankTo + 1}`;

    let fileFrom = FilesBoard[from];
    let fileTo = FilesBoard[to]
    const fileNameFrom = `file_${fileFrom + 1}`;
    const fileNameTo = `file_${fileTo + 1}`;

    $('.piece').each(function (index) {
        if ($(this).hasClass(rankNameFrom) && $(this).hasClass(fileNameFrom)) {
            $(this).removeClass();
            $(this).addClass(`piece ${rankNameTo} ${fileNameTo}`)
            $(`.board__file.${rankNameTo}.${fileNameTo}`).append($(this))
        }
    })

    if (move & MFLAGCA) {
        switch (to) {
            case SQUARES.G1:
                RemoveGUIPiece(SQUARES.H1);
                AddGUIPiece(SQUARES.F1, PIECES.WHITE_ROOK);
                break;

            case SQUARES.C1:
                RemoveGUIPiece(SQUARES.A1);
                AddGUIPiece(SQUARES.D1, PIECES.WHITE_ROOK);
                break;

            case SQUARES.G8:
                RemoveGUIPiece(SQUARES.H8);
                AddGUIPiece(SQUARES.F8, PIECES.BLACK_ROOK);
                break;

            case SQUARES.C8:
                RemoveGUIPiece(SQUARES.A8);
                AddGUIPiece(SQUARES.D8, PIECES.BLACK_ROOK);
                break;
        }
    } else if (PROMOTED(move)) {
        RemoveGUIPiece(to);
        AddGUIPiece(to, PROMOTED(move));
    }
}

const DrawMaterial = () => {
    if (GameBoard.pieceNumber[PIECES.WHITE_PAWN] !== 0 ||
        GameBoard.pieceNumber[PIECES.BLACK_PAWN] !== 0)
        return BOOL.FALSE;

    if (GameBoard.pieceNumber[PIECES.WHITE_QUEEN] !== 0 ||
        GameBoard.pieceNumber[PIECES.BLACK_QUEEN] !== 0 ||
        GameBoard.pieceNumber[PIECES.WHITE_ROOK] !== 0 ||
        GameBoard.pieceNumber[PIECES.BLACK_ROOK] !== 0)
        return BOOL.FALSE;

    if (GameBoard.pieceNumber[PIECES.WHITE_BISHOP] > 1 ||
        GameBoard.pieceNumber[PIECES.BLACK_BISHOP] > 1)
        return BOOL.FALSE;

    if (GameBoard.pieceNumber[PIECES.WHITE_KNIGHT] > 1 ||
        GameBoard.pieceNumber[PIECES.BLACK_KNIGHT] > 1)
        return BOOL.FALSE;

    if (GameBoard.pieceNumber[PIECES.WHITE_KNIGHT] !== 0 &&
        GameBoard.pieceNumber[PIECES.WHITE_BISHOP] !== 0)
        return BOOL.FALSE;

    if (GameBoard.pieceNumber[PIECES.BLACK_KNIGHT] !== 0 &&
        GameBoard.pieceNumber[PIECES.BLACK_BISHOP] !== 0)
        return BOOL.FALSE;


    return BOOL.TRUE;
}

const ThreeFoldRep = () => {
    let r = 0;

    for (let i = 0; i < GameBoard.hisPly; ++i) {
        if (GameBoard.history[i].posKey === GameBoard.posKey) {
            r++;
        }
    }

    return r;
}

const CheckResult = () => {
    if (GameBoard.fiftyMove >= 100) {
        $('#game-status').css('display', 'block')
        $('#game-status').text('Game Drawn (fifty move rule)')
        return BOOL.TRUE;
    }

    if (ThreeFoldRep() >= 2) {
        $('#game-status').css('display', 'block')
        $('#game-status').text('Game Drawn (3-fold repetition)')
        return BOOL.TRUE;
    }

    if (DrawMaterial() === BOOL.TRUE) {
        $('#game-status').css('display', 'block')
        $('#game-status').text('Game Drawn (insufficient material to mate)')
        return BOOL.TRUE;
    }

    GenerateMoves();

    let found = 0;

    for (let moveNumber = GameBoard.moveListStart[GameBoard.ply];
        moveNumber < GameBoard.moveListStart[GameBoard.ply + 1]; ++moveNumber) {
        if (MakeMove(GameBoard.moveList[moveNumber]) === BOOL.FALSE) {
            continue
        }

        found++;
        TakeMove();
        break;
    }

    if (found !== 0) return BOOL.FALSE;

    let InCheck = SqAttaked(GameBoard.pList[PIECEINDEX(Kings[GameBoard.side], 0)], GameBoard.side ^ 1);

    if (InCheck === BOOL.TRUE) {
        if (GameBoard.side === COLOURS.WHITE) {
            $('#game-status').css('display', 'block')
            $('#game-status').text('Game Over (black mates)');
            return BOOL.TRUE;
        } else {
            $('#game-status').css('display', 'block')
            $('#game-status').text('Game Over (white mates)');
            return BOOL.TRUE;
        }
    } else {
        $('#game-status').css('display', 'block')
        $('#game-status').text('Game Drawn (stalemate)');
    }

    return BOOL.FALSE;
}

const CheckAndSet = () => {
    if (CheckResult() === BOOL.TRUE) {
        GameController.gameOver = BOOL.TRUE;
    } else {
        GameBoard.gameOver = BOOL.FALSE;
        $('#game-status').text('');
        $('#game-status').css('display', 'none')
    }
}

const PreSearch = () => {
    if (GameController.gameOver === BOOL.FALSE) {
        SearchController.thinking = BOOL.TRUE;
        setTimeout(function () { StartSearch() }, 200)
    }
}

$('#search-button').click(() => {
    GameController.playerSide = GameController.side ^ 1;
    PreSearch();
})

const StartSearch = () => {
    SearchController.depth = MAXDEPTH;
    let time = $.now();
    let thinkingTime = $('.thinkingTimeChoice').val();
    SearchController.time = parseInt(thinkingTime) * 1000;
    SearchPosition();
    MakeMove(SearchController.best);
    MoveGUIPiece(SearchController.best);
    CheckAndSet();
}