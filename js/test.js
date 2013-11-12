//PokerEval Test file

//Instantiate PokerEval with hand of:
// 2H, AC, 7C, 2D, 3S, QS

// to do: make a generator out of this one.
//var hand = new PokerEval(['21','00','06','31','12','111',]);

//console.log( hand );

//holdem test
var players = [
	[ 0, ['20', '112'] ],
	[ 24, ['32', '15'] ],
	[ 5125, ['20', '010'] ],
	[ 1, ['01', '09'] ]
];

var board = [ '11', '05', '13', '00', '17'];

var holdem = new Holdem( board, players );

for (var i = 0; i < players.length; i++){
	var el = document.createElement('div');
	el.innerHTML = 'Player ID: ' + players[i][0] + ' - Cards: [ ' + players[i][1] + ' ]'; 
	document.getElementById('players').appendChild(el);
}

document.getElementById('board').innerHTML = '[ ' + board + ' ]';
document.getElementById('result').innerHTML = 'Player ' + holdem.winners[0][0] + ' won! with ' + holdem.winners[0][3];