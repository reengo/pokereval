/*
 * @preserve PokerEval.JS
 *
 * @version 0.1.0
 * author: Ringo Bautista
 * https://github.com/reengo
 * @license MIT License
 */

function PokerEval(cards){
	var that = this;
	this.cards = cards;
	this.ranks=[];
	this.suits=['C','S','H','D'];
	this.value=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
	this.valueWords=['Ace','Deus','Trey','4','5','6','7','8','9','10','Jack','Queen','King','Ace'];
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

	console.log(this.straight);

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
    console.log(sCards);
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
	//[2,0,0,0,0,0,0,0,0,0,0,0,0]
	//same = 2
	//same2 = 1
	//low = 0
	//high = 0
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
		'invalid value', //no value
		'high card ' + this.translateCard( rank ),
		'pair of ' + this.translateCard( rank ) + 's', // 1 pair
		'two pairs of ' + this.translateCard( rank ) + ' ' + this.translateCard( spair ) + ' with ' + this.translateCard( kicker ) + ' kicker', //2pairs
		'three of a kind ' + this.translateCard( rank ) + 's', //three of a kind
		this.translateCard( rank ) + ' high straight', // straight
		'flush', // flush
		'full house ' + this.translateCard( rank ) + ' over ' + this.translateCard( spair ), // fullhouse
		'four of a kind ' + this.translateCard( rank ), //four of a kind
		'straight flush ' + this.translateCard( rank ) + ' high', // straight flush
		'royal flush' //royal flush
	];

	return valueString[ value ];
}