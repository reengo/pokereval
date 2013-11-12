/* ============================
 * @preserve PokerEval.JS
 *
 * @version 0.1.0
 * author: Ringo Bautista
 * https://github.com/reengo
 * @license MIT License
 * ============================*/

var PokerText = {
	suits:['C','S','H','D'],
	ranks:['A','2','3','4','5','6','7','8','9','10','J','Q','K'],
	words:['Ace','Deus','Trey','4','5','6','7','8','9','10','Jack','Queen','King','Ace'],
	invalid:'invalid value',
	highCard:'high card ',
	pairOf:	'pair of ', 
	twoPairsOf:	'two pairs of ', 
	threeOfAKind:'three of a kind ', 
	highStraight:' high straight', 
	flush:'flush', 
	fullHouse:'full house ', 
	fourOfAKind:'four of a kind ', 
	straightFlush:'straight flush ',
	royalFlush:'royal flush', 
	with:'with',
	over:'over',
	high:'high'
} 

function PokerEval(cards){
	var that = this;
	this.cards = cards;
	this.ranks=[];
	this.suits=PokerText.suits;
	this.value=PokerText.ranks;
	this.valueWords=PokerText.words;
	this.flush=false;
	this.straight=[];
	this.pairs=[];
	this.orderedRanks=[];
	this.rankIndex=0;

	//reset rank array values
	for (var i=0; i<=12; i++) {
        this.ranks[i]=0;
    }

    //set increment rank index values based on hand
    for (var i=0; i<=this.cards.length-1 ;i++) {
        this.ranks[ this.cards[i].substr(1) ]++;
     }

  	//check if ace is present
	if (this.ranks[0]>0) {
	    this.orderedRanks[this.rankIndex]=13; //we set the first orderedranks value with 13 being the highest rank value.
	    this.rankIndex++;
	}

	for (var i=12; i>=0; i--) {
	    if (this.ranks[i]>=1) {
	        this.orderedRanks[this.rankIndex]=i; //if there's an ace there will be 2 entries, 13 geing the heighest and 0 being the lowest (for straights). 
	        this.rankIndex++;
	    }
	}

    return this.getValue();
}

/*
* @param 
* @return Array[
*		0:int - true if straight.
*		1:int - highest rank on the straight.
*	]
*/

PokerEval.prototype.getValue = function(){
	var value = [0];
	
	// before anything else check if we have a flush
    this.flush = this.checkFlush( this.cards );

    if (this.flush){
    	value[0]=6;
        value[1]=this.orderedRanks[0];
        value[2]=this.orderedRanks[1];
        value[3]=this.orderedRanks[2];
        value[4]=this.orderedRanks[3];
        value[5]=this.orderedRanks[4];
    }
   
    // since ranks are checked and ordered. we then check for pairs
	this.pairs = this.checkPair( this.ranks );

	if (this.pairs[0]==4){ //check for four of a kind, 4 cards of the same rank
        value[0]=8;
        value[1]=this.pairs[2];
        value[2]=this.orderedRanks[0];
    }

    if ( this.pairs[0]==3){//check for three of a kind
        value[0]=4;
        value[1]=this.pairs[2];
        value[2]=this.pairs[3];
        if( this.pairs[1] > 1 ){ // check for full house, three of a kind and 1 pair
        	value[0]=7;
	        value[1]=this.pairs[2];
	        value[2]=this.pairs[3];
        }
    }

    if ( this.pairs[0] == 2){ 
    	if(this.pairs[1] == 2){//check for 2 pairs
	        value[0] = 3;
	        value[1] = this.pairs[2]; //highgroup
	        value[2] = this.pairs[3]; //lowpair
	        for( var i = this.orderedRanks.length; i>=0; i-- ){ //for the kicker
	        	if(this.orderedRanks[i] != this.pairs[2] && this.orderedRanks[i] != this.pairs[3]){
	        		if(this.orderedRanks[i] != 13){
	        			value[3] = this.orderedRanks[i];
	        		}else if(this.pairs[2] != 0 && this.pairs[1] != 0){
	        			value[3] = this.orderedRanks[0];
	        		}
	        	}
	        }
	    }else if(this.pairs[1]==1){//check for 1 pair
	    	value[0] = 2;
	        value[1] = this.pairs[2]; //rank of high pair
	        value[2] = this.orderedRanks[0];
	        value[3] = this.orderedRanks[1];
	        value[4] = this.orderedRanks[2];
	    }
    }

	//no good cards? just look for the high card
	if ( this.pairs[0]==1) {
        value[0] = 1;
        value[1] = this.orderedRanks[0];
        value[2] = this.orderedRanks[1];
        value[3] = this.orderedRanks[2];
        value[4] = this.orderedRanks[3];
        value[5] = this.orderedRanks[4];
    }

    // now we check for straights
	this.straight = this.checkStraight( this.ranks );

    if(this.straight[0]){
    	value[0] = 5;
	   	value[1] = this.straight[2];
	    if (this.straight[1]){// check for straight flush
	        value[0] = 9;
	   		value[1] = this.straight[2];
	   		if(this.straight[2] == 13){ // check for royal flush
	   			value[0] = 10;
	   			value[1] = this.orderedRanks[0] == 13 ? 14 : this.straight[1];
	   		}
	    }
	}

    return [ value, this.translateValue( value[0], value[1], value[2], value[3] ) ];
}

/*
* @param ranks:Array
* @return Boolean - true if flush
*/

PokerEval.prototype.checkFlush = function(cards){
	var sameSuit = 0,flush = false, fCards = [0,0,0,0];
	for( var i = 0; i <= cards.length-1; i++ ){
		fCards[cards[i][0]]++;
    };

    for ( card in fCards ){
    	if( fCards[card] >= 5 ){
    		flush = true;
    	}
    }
    return flush;
}

/*
* @param ranks:Array
* @return Array[
*		0:boolean - true if straight.
*		1:int - highest rank on the straight.
*	]
*/

PokerEval.prototype.checkStraight = function(ranks){
	var topStraightValue=0, straight=false, sCards=[], flush=false, aceSuit;
	for (var i = 12; ( i-4 ) >= 0; i--) {
    	//can't have straight with lowest value of more than 10
        if ( ranks[i]>=1 && 
        	ranks[i-1]>=1 && 
        	ranks[i-2]>=1 && 
        	ranks[i-3]>=1 && 
        	ranks[i-4]>=1){

            straight = true;
            topStraightValue = i; //4 above bottom value

            for( var c=0; c<=this.cards.length-1;c++ ){
            	if( this.cards[c].substr(1) == i || 
            		this.cards[c].substr(1) == i-1 ||
            		this.cards[c].substr(1) == i-2 || 
            		this.cards[c].substr(1) == i-3 || 
            		this.cards[c].substr(1) == i-4){
            		sCards.push( this.cards[c] );
            	}
            	aceSuit = this.cards[c].substr(1) == 0 ? this.cards[c][0] : null; //get the suit of ace
            }
            
            break;
        }
    }

    if( straight && ranks[0]>=1 && ranks[12] >= 1 ){
    	sCards.splice(0,1);
    	sCards.push( aceSuit+'0' )
    }

    flush = this.checkFlush(sCards); //is it a straight flush?

    // royal straight
    if (ranks[9]>=1 && ranks[10]>=1 && ranks[11]>=1 && ranks[12]>=1 && ranks[0]>=1){
        straight=true;
        topStraightValue=13;
    }

    return [ straight, flush, topStraightValue ]; 
},

/*
* @param ranks:Array
* @return Array[
*		0:int - number of same cards
*		1:int - number of same cards with a different value (3rd pair is disregarded)
*		2:int - highest rank of the cards with same values
*		3:int - second highest rank of the cards with same values
*	]
*/

PokerEval.prototype.checkPair = function(ranks){
	var same=same2=1;
	var lowPair=highGroup=0;

	for (var i = 12; i >= 0; i--) {
		
		if (ranks[i] > same) {
            same2 = same != 1 ? same : 1; // theres a pair, same1 and same 2 are the same value
            same = ranks[i]; // assign the number of same cards from the current rank
            highGroup = i;
            if(ranks[i] > ranks[highGroup]){	
            	lowPair = highGroup;
            }
		} else if ( ranks[i] > same2 ) {
			same2 = ranks[i];
			lowPair = i;
		}

		if( lowPair == 0 && same2 > 1 && same < 3){
			lowPair = highGroup;
			highGroup = 0;
		}
	}

	// value of ace becomes highest on pairs
	highGroup = highGroup == 0 ? 13 : highGroup;
	lowPair = lowPair == 0 ? 13 : lowPair;

	return [ same, same2, highGroup, lowPair ];
}

/*
* @param id:Int
* @return String - Card Value text
*	
*/

PokerEval.prototype.translateCard =function( rank, suit ){
	var suitString,rankString,cardName;
	rank = rank == 13 ? 0 : rank;
	if ( suit == null ){
		cardName = this.valueWords[ rank ];
	}else{
		suitString = this.valueWords[ suit ];
		rankString = this.valueWords[ rank ];
		cardName = rankString + ' of ' + suitString + 's';
	}
	return this.valueWords[ rank ];
} 

/*
* @param value:Int - hand rank value
* @param rank:Int - highest value / pair, three of a kind, or four of a kind;
* @param spair:Int - second pair
* @param kicker:Int - last single card on a hand with 2 pairs, or four of a kind.
*
* @return String - value of hand.
*/

PokerEval.prototype.translateValue = function( value, rank, spair, kicker ){
	var valueString = [
		PokerText.invalid, //no value
		PokerText.highCard + this.translateCard( rank ),
		PokerText.pairOf + this.translateCard( rank ) + 's', // 1 pair
		PokerText.twoPairsOf + this.translateCard( rank ) + ' ' + this.translateCard( spair ) + PokerText.with + this.translateCard( kicker ) + PokerText.kicker, //2pairs
		PokerText.threeOfAKind + this.translateCard( rank ) + 's', //three of a kind
		this.translateCard( rank ) + PokerText.highStraight, // straight
		PokerText.flush, // flush
		PokerText.fullHouse + this.translateCard( rank ) + PokerText.fullHouse + this.translateCard( spair ), // fullhouse
		PokerText.fourOfAKind + this.translateCard( rank ), //four of a kind
		PokerText.straightFlush + this.translateCard( rank ) + PokerText.high, // straight flush
		PokerText.royalFlush //royal flush
	];

	return valueString[ value ];
}

/* ============================
 * @preserve Holdem.JS
 *
 * @version 0.1.0
 * author: Ringo Bautista
 * https://github.com/reengo
 * @license MIT License
 * ==========================*/

function Holdem(board, players){
	var that = this;
	this.board = board;
	this.players = players;
	this.hands = [];
	this.handRankings = [];
	this.winners = [];
	this.topCardRank;
	
	this.hands = this.getHands();
	this.handRankings = this.getHandRankings();
	
	this.evaluateHands();
	
	this.topCardRank = this.getTopRank();
	this.winners = this.getWinners();
}

/*
* @param 
* @return Array[
*		0:int - id
*		1:Array - Cards Array
*	]
*/

Holdem.prototype.getHands = function(){
	var hands = [];
	// get card values from players and concat community

	for (var i = 0; i < this.players.length; i++) {
		if(this.players[i].length == 2){
			var pcards = this.players[i][1];
			pcards.concat(this.board);
			hands[i] = [ this.players[i][0], pcards.concat(board) ];
		}				
	}

	return hands;
}

/*
* @param 
* @return 
*/

Holdem.prototype.evaluateHands = function(){

	//evaluate all cards and push to players 
	for(var i=0;i<= this.hands.length-1; i++ ){
		var pvalue = new PokerEval( this.hands[i][1] );

		
		this.hands[i] = this.hands[i].concat( pvalue );
		
		//loop through handranks and count similar ranks
		for (var j=0; j<11; j++ ){
			if( pvalue[0][0] == j ){
				this.handRankings[j]++;
			}

		}
	}		

	//sort hands based on hand ranking
	this.hands = this.hands.sort(function (a,b){
		if (a[2][0] > b[2][0]) return -1;
		if (a[2][0] < b[2][0]) return 1;
		return 0;
	});
}


/*
* @param 
* @return Array[
*		0:int - id
*		1:Array - Cards Array
*		2:Array - Hand Value Array
*		3:String - Hand Value String
*	]
*/

Holdem.prototype.getWinners = function(){
	//if the highest rank only has 1 winner. first index wins.
	var winners = [];
	if( this.handRankings[ this.topCardRank ] == 1 ){
		winners.push( this.hands[0] ); //0 being the index of the sole winner.
	}else{
		var sameRankHands = []; //winners with same rank but still needs to be sorted out
		for ( var i = 0; i < this.hands.length; i++){
			var hcard = this.hands[i][2][1] == 0 ? 13 : this.hands[i][2][1];

			//only push hands to winners if value is equal to top rank
			//if there are more than 2 winners of the same rank, sort them
			if( this.hands[i][2][0] == this.topCardRank){
				if( this.handRankings[ this.topCardRank ] > 1 ){
					sameRankHands.push( this.hands[i] );
				}else{
					winners.push( this.hands[i] ); 
				}
			}
		}

		// if we still get more than 1 winner check the higher pair
		var sameRankWinners = [];
		for( var i = 0 ; i < sameRankHands.length-1; i++ ){
			if( sameRankHands[i][2][1] > sameRankHands[i+1][2][1] ){
				sameRankWinners = [];
				sameRankWinners.push( sameRankHands[i] );
			}else{
				sameRankWinners.push( sameRankHands[sameRankHands.length] );
			}
		}

		// if we still get more than 1 winner check the lower pair
		var sameRankWinner = [];
		if( sameRankWinners.length > 1 ){
			for( var i = 0 ; i < sameRankWinners.length-1; i++ ){
				if( sameRankWinners[i][2][2] > sameRankWinners[i+1][2][2] ){
					sameRankWinner.push( sameRankHands[i] );
				}else{
					sameRankWinner.push( sameRankHands[sameRankHands.length] );
				}
			}
		}else{
			winners.push( sameRankWinners[0] );
		}

		//sort winners accoring to highest card value
		winners = winners.sort(function (a,b){
			if( a[0][0][1] == b[0][0][1] ){
				if (a[0][0][2] > b[0][0][2]) return -1;
				if (a[0][0][2] < b[0][0][2]) return 1;
				return 0;
			}
			if (a[0][0][1] > b[0][0][1]) return -1;
			if (a[0][0][1] < b[0][0][1]) return 1;
			return 0;
		});

		return winners;
	}
}

/*
* @param 
* @return Array - Rankings reset to 0;
*/

Holdem.prototype.getHandRankings = function(){
	//set handRankings, 11 total hand ranks
	var rankings = [];
	for(var i = 0; i < 11; i++ ){ 
		rankings[i] = 0;
	}
	return rankings;
}

/*
* @param 
* @return INT - Highest Rank from winning hand
*/

Holdem.prototype.getTopRank = function( ){
	//loop through all ranks again and determine which rank won and how many.
	var topRank;
	for(var i = 0; i < this.handRankings.length; i++ ){ 
		if(this.handRankings[i] > 0) {
	        topRank = i;
	    }
	}

	return topRank;
}