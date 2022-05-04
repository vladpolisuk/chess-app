let perft_leafNodes;

const Perft = (depth) => {
    if (depth === 0) {
        perft_leafNodes++;
        return;
    }

    GenerateMoves();

    let move;

    for (let i = GameBoard.moveListStart[GameBoard.ply];
        i < GameBoard.moveListStart[GameBoard.ply + 1]; ++i) {
        move = GameBoard.moveList[i];

        if (MakeMove(move) === BOOL.FALSE) continue;

        Perft(depth - 1);
        TakeMove()
    }

    return
}

const PerftTest = (depth) => {
    PrintBoard();
    console.log(`Starting Test To Death ${depth}`);

    perft_leafNodes = 0;

    let move;
    let moveNumber = 0;

    GenerateMoves();

    for (let i = GameBoard.moveListStart[GameBoard.ply];
        i < GameBoard.moveListStart[GameBoard.ply + 1]; ++i) {
        move = GameBoard.moveList[i];

        if (MakeMove(move) === BOOL.FALSE) continue;

        moveNumber++;

        let cumnodes = perft_leafNodes;

        Perft(depth - 1);
        TakeMove();

        let oldnodes = perft_leafNodes - cumnodes;
        console.log(`move: ${moveNumber} ${PrintMove(move)} ${oldnodes}`);
    }

    console.log(`Test Complete : ${perft_leafNodes} leaf nodes visited`);

    return;
}