//PokerEval Test file

//Instantiate PokerEval with hand of:
// 2H, AC, 7C, 2D, 3S, QS

// to do: make a generator out of this one.
//var hand = new PokerEval(['21','00','06','31','12','111',]);

//console.log( hand );

//holdem test
var board = [ 'H5', 'S4', 'DA', 'D4', 'D9'];
var players = [
	[ 0, ['H8', 'H3'] ],
	[ 1, ['S3', 'H10'] ]
	// [ 2, ['H2', 'SJ'] ],
	// [ 3, ['S5', 'C3'] ],
	// [ 4, ['HQ', 'S4'] ],
	// [ 5, ['H7', 'CQ'] ],
	// [ 6, ['C7', 'S9'] ],
	// [ 7, ['C5', 'S5'] ],
	// [ 8, ['C9', 'H5'] ],
	// [ 9, ['H8', 'C4'] ]
];
console.log( players );
for( player in players ){
	players[ player ][ 1 ] = convertString( players[ player ][ 1 ] );
}

board = convertString( board );

evaluatePlayerHands( players, board );
getWinners( players, board );

function convertString(cards){
	var suit,rank;
	for ( card in cards ){
		suit = PokerText.suits.indexOf(cards[ card ].substr(0,1));
		rank = PokerText.ranks.indexOf(cards[ card ].substr(1));

		cards[card] = suit+''+rank;
	}
	return cards;
}

function convertID(cards){
	var suit,rank;
	for ( card in cards ){
		suit = PokerText.suits[ cards[ card ].substr(0,1) ];
		rank = PokerText.ranks[ cards[ card ].substr(1) ];

		cards[card] = suit+''+rank;
	}
	return cards;
}

function evaluatePlayerHands(players,board){
	for( player in players){
		var cards = players[player][1];
		cards = cards.concat(board);
		var result = new PokerEval( cards );
		var el = document.createElement('div');
		el.innerHTML = 'Player ID ' + players[player][0] + ':  hand [ ' + convertID( players[player][1] ) + ' ] = ' + result[1]; 
		document.getElementById('players').appendChild(el);
	}
	document.getElementById('board').innerHTML = '[ ' + convertID( board ) + ' ]';
}

function getWinners(players,board){
	for( player in players ){
		players[ player ][ 1 ] = convertString( players[ player ][ 1 ] );
	}

	board = convertString( board );

	var holdem = new Holdem( board, players );

	if(holdem.winners.length > 1){
		for( winner in holdem.winners){
			var el = document.createElement('div');
			el.innerHTML = 'Player ' + holdem.winners[winner][0] + ' wins! with ' + holdem.winners[winner][3];
			document.getElementById('result').appendChild(el);
		}
	}else{
		document.getElementById('result').innerHTML = 'Player ' + holdem.winners[0][0] + ' wins! with ' + holdem.winners[0][3];
	}
}