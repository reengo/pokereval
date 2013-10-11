//PokerEval Test file

//Instantiate PokerEval with hand of:
// 2H, AC, 7C, 2D, 3S, QS

// to do: make a generator out of this one.
var hand = new PokerEval(['21','00','06','31','12','111',]);

console.log( hand );

document.getElementById('result').innerHTML = hand[1];
