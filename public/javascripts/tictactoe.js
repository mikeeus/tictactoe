$(document).ready(function(){
  
});

var turn; // "Player One" || "Player Two" || "Computer"
var mode = 'single-player'; // two-player
var score = {
  one: 0,
  two: 0,
  computer: 0
}; // {one: 0, two: 0, computer: 0}
var playing; // game state, true or false
var moves = [];
var squares = ['sq1', 'sq2', 'sq3', 'sq4', 'sq5', 'sq6', 'sq7', 'sq8', 'sq9'];
var rows = [
    ['sq1', 'sq2', 'sq3'],
    ['sq4', 'sq5', 'sq6'],
    ['sq7', 'sq8', 'sq9']
  ];
var cols = [
    ['sq1', 'sq4', 'sq7'],
    ['sq2', 'sq5', 'sq8'],
    ['sq3', 'sq6', 'sq9']
  ];
var corner = [rows[0][0], rows[0][2], rows[2][0], rows[2][2]]; 
var message = "Start game?";

function startGame(){
  resetBoard();
  mode === 'single-player' ? turn = "Computer" : turn = "Player Two";
  playing = true;
  console.log('playing: ', playing);
  console.log('turn: ', turn);
  console.log('start game!');
  computerMove();
  updateDisplay();
}
function resetBoard(){
  moves = [];
  rows = [
    ['sq1', 'sq2', 'sq3'],
    ['sq4', 'sq5', 'sq6'],
    ['sq7', 'sq8', 'sq9']
  ];
  cols = [
    ['sq1', 'sq4', 'sq7'],
    ['sq2', 'sq5', 'sq8'],
    ['sq3', 'sq6', 'sq9']
  ];
  squares.map(function(square){
    element = $('#' + square);
    if(element.hasClass('touched')){
      element.removeClass('touched');
      element.addClass('untouched');
      element.html('');
    }
  });
  console.log('reset!');
}
function resetScore(){
  score = {one: 0, two: 0, computer: 0};
}
function changeMode(type){
  console.log('mode: ', type);
  $('#mode-single').removeClass('selected');
  $('#mode-two').removeClass('selected');  
  mode = type;
  type == 'single-player' ? $('#mode-single').addClass('selected') : $('#mode-two').addClass('selected');
  resetScore();
}

function toggleTouch(square, computer){
  console.log(square);
  if(!playing){ console.log('Start game!'); return; };
  if(turn == 'Computer' && !computer){ console.log("computer's turn!"); return;}
  element = $('#' + square);
  if(element.hasClass('untouched')){
    moves.push(square);
    updateState(square, turn);
    turn == 'Computer' ? element.html('O'): element.html('X');
    element.removeClass('untouched');
    element.addClass('touched');
  }
  if(mode == 'single-player'){
    turn == 'Player One' ? turn = 'Computer' : turn = 'Player One';
  } else if(mode == 'two-player'){
    turn == 'Player One' ? turn = 'Player Two' : turn = 'Player One';
  }
  updateDisplay();
  if(turn == 'Computer'){ computerMove(); };
  checkWinner();
}
function updateState(square, turn){
  for(i = 0; i < 3; i++){
    index = rows[i].indexOf(square);
    if(index !== -1){
      rows[i][index] = turn;
    }
    index2 = cols[i].indexOf(square);
    if(index2 !== -1){
      cols[i][index2] = turn;
    }
  }
}

function updateDisplay(){
  playing ? $('#controls').hide() : $('#controls').show();
  playing ? $('#in-game').show() : $('#in-game').hide();
  playing ? $('#message').hide() : $('#message').show();
  if(mode == 'single-player'){
    $('#player-two').html('Computor');
    // update score
    $('#player-one-score').html(score['one']);
    $('#player-two-score').html(score['computer']);
  } else{
    $('#player-two').html('Player Two');    
    $('#player-one-score').html(score['one']);
    $('#player-two-score').html(score['two']);
  }
  $('#turn').html(turn);
}

function computerMove(){
  function move(square){
    setTimeout(function(){
      toggleTouch(square, true);
    }, 1000);
  }
  if(checkPattern() !== undefined){
    move(checkPattern());
    return;
  };
  switch(moves.length){
    case 0:
      // Always pick the corner
      rand = Math.floor(Math.random()*3);
      start = corner[rand];
      console.log('rand: ', rand);
      console.log('start: ', start);
      move(start);
      break;
    case 2:
      if (moves[1] === 'sq5' && moves[0] === 'sq1'){ move('sq3'); }
      else if (moves[1] === 'sq5' && moves[0] === 'sq3'){ move('sq1'); }
      else if (moves[1] === 'sq5' && moves[0] === 'sq7'){ move('sq9'); }
      else if (moves[1] === 'sq5' && moves[0] === 'sq9'){ move('sq3'); }
      else {move('sq5');};
      break;
    case 4:
      if(!moves.includes('sq5')){
        move('sq5');
        break;
      }
      else if(moves[2] === 'sq5'){
        // check where opponent placed x, and place in opposite corner
        if(moves[0] === 'sq1'){ 
          moves.includes('sq2') ? move('sq7') : move('sq3');
        }
        if(moves[0] === 'sq3'){ 
          moves.includes('sq2') ? move('sq9') : move('sq1');          
        }
        if(moves[0] === 'sq7'){
          moves.includes('sq4') ? move('sq9') : move('sq1');
        }          
        if(moves[0] === 'sq9'){
          moves.includes('sq6') ? move('sq7') : move('sq3');
        }
        break;
      }
    case 6:
      // Check for good move, if not, select first square from remaining
      possibleMove = getBestMove();
      if(possibleMove !== undefined){
        move(possibleMove);
      } else {
        remainingSquares = squares.filter(function(a){
          return !moves.includes(a);
        });
        move(remainingSquares[0]);
      }
      break;
    case 8:
      // Select remaining square
      lastSquare = squares.filter(function(a){
        return !moves.includes(a);
      });
      move(lastSquare);
      break;
    default:
      break;
  }

}

function countInArray(array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
}
function checkWin(winner, opponent){
  diagonal1 = [rows[0][0], rows[1][1], rows[2][2]];
  diagonal2 = [rows[0][2], rows[1][1], rows[2][0]];
  winningSquare = undefined;
  // check diagonal 1
  if(countInArray(diagonal1, winner) === 2 && countInArray(diagonal1, opponent) === 0){
    console.log('diagonal1 opportunity: ', winner);
    diagonal1.map(function(square){
      if(square !== winner){ winningSquare = square; }
    })
  }
  // check diagonal 2
  if(countInArray(diagonal2, winner) === 2 && countInArray(diagonal2, opponent) === 0){
    console.log('diagonal2 opportunity: ', winner);
    diagonal2.map(function(square){
      if(square !== winner){ winningSquare = square; }
    })
  }
  // check rows and columns
  for(i = 0; i < 3; i++){
    if(countInArray(rows[i], winner) === 2 && countInArray(rows[i], opponent) === 0){
      console.log('row',i, ': ', rows[i]);
      rows[i].map(function(square){
        if(square !== winner){
          console.log('opportunity at: ', square);
          winningSquare = square;
        }
      })
    }
    if(countInArray(cols[i], winner) === 2 && countInArray(cols[i], opponent) === 0){
      cols[i].map(function(square){
        if(square !== winner){
          console.log('opportunity at: ', square);
          winningSquare = square;
        }
      })
    }
    if(winningSquare !== undefined){ break; };
  }
  console.log('winningSquare: ', winningSquare);
  return winningSquare;
} 
// Check to see if chain of 3 is possible
function checkPattern(){
  diagonal1 = [rows[0][0], rows[1][1], rows[2][2]];
  diagonal2 = [rows[0][2], rows[1][1], rows[2][0]];
  pattern = undefined;
  compWin = undefined;
  // check if computer can win 
  compWin = checkWin('Computer', 'Player One');
  if(compWin !== undefined){
    pattern = compWin;
    // if not, check if player can and block
  } else if(compWin === undefined){
    playerThreat = checkWin('Player One', 'Computer');
    if(playerThreat !== undefined){
      console.log('Player threat: ', playerThreat);
      pattern = playerThreat;
    }
  }

  return pattern;
}
// Get best move for computer
function getBestMove(){
  diagonal1 = [rows[0][0], rows[1][1], rows[2][2]];
  diagonal2 = [rows[0][2], rows[1][1], rows[2][0]];
  bestMove = undefined;
  if(countInArray(diagonal1, 'Computer') > 0 && countInArray(diagonal1, 'Player One') === 0){
    diagonal1.map(function(square){
      if(square !== 'Computer'){
        bestMove = square;
        console.log('Best move is: ', square);
      }
    })
  }
  if(countInArray(diagonal2, 'Computer') > 0 && countInArray(diagonal2, 'Player One') === 0){
    diagonal2.map(function(square){
      if(square !== 'Computer'){
        bestMove = square;
        console.log('Best move is: ', square);
      }
    })
  }
  for(i = 0; i < 3; i++){
    // check if player has opportunity(third)
    if(countInArray(rows[i], 'Computer') > 0 && countInArray(rows[i], 'Player One') === 0){
      rows[i].map(function(square){
        if(square !== 'Computer'){
          bestMove = square;
          console.log('Best move is: ', square);
        }
      })
    }
    if(countInArray(cols[i], 'Computer') > 0 && countInArray(cols[i], 'Player One') === 0){
      cols[i].map(function(square){
        if(square !== 'Computer'){
          bestMove = square;
          console.log('Best move is: ', square);
        }
      })
    }
  }
  return bestMove;
}


// Check if there is a winner
function checkWinner(){
  if(mode === 'single-player'){
    if(checkThreeInARow('Computer')){
      playing = false;
      $('#message').html('Computer wins!');
      score.computer += 1;
    } else if(checkThreeInARow('Player One')){
      playing = false;
      $('#message').html('Player One wins!');
      score.one += 1;
    }
  } else if(mode === 'two-player'){
    if(checkThreeInARow('Player Two')){
      playing = false;
      $('#message').html('Player Two wins!');
      score.two += 1;      
    } else if(checkThreeInARow('Player One')){
      playing = false;
      $('#message').html('Player One wins!');
      score.one += 1;
    }
  }
  if(moves.length === 9 && playing === true){
    console.log("It's a tie!");
    playing = false;
  } 
  updateDisplay();
}


// checks if player has three in a row
function checkThreeInARow(player){
  playerWon = false;
  diagonal1 = [rows[0][0], rows[1][1], rows[2][2]];
  diagonal2 = [rows[0][2], rows[1][1], rows[2][0]];
  if(countInArray(diagonal1, player) === 3 || countInArray(diagonal2, player) === 3){
    console.log(player, ' wins!');
    playerWon = true;
  } else{
    for(i = 0; i < 3; i++){
      // check if player has opportunity(threat)
      if(countInArray(rows[i], player) === 3 || countInArray(cols[i], player) === 3){
        console.log(player, ' wins!');
        playerWon = true;
      }
    }
  }
  return playerWon;
}


  // if(countInArray(diagonal1, 'Computer') === 3 || countInArray(diagonal2, 'Computer') === 3){
  //   console.log('Computer wins!');
  //   playing = false;
  //   return;
  // } else if(countInArray(diagonal1, 'Player One') === 3 || countInArray(diagonal2, 'Player One') === 3){
  //   console.log('Player One wins!');
  //   playing = false;
  //   return; 
  // } else if(countInArray(diagonal1, 'Player Two') === 3 || countInArray(diagonal2, 'Player Two') === 3){
  //   console.log('Player One wins!');
  //   playing = false;
  //   return; 
  // }
  // for(i = 0; i < 3; i++){
  //   // check if player has opportunity(threat)
  //   if(countInArray(rows[i], 'Computer') === 3){
  //     console.log('Computer wins!');
  //     playing = false;
  //     return;
  //   } else if(countInArray(cols[i], 'Computer') === 3){
  //     console.log('Computer wins!');
  //     playing = false;
  //     return;
  //   } else if(countInArray(rows[i], 'Player One') === 3){
  //     console.log('Player One wins!');
  //     playing = false;
  //     return;      
  //   } else if(countInArray(cols[i], 'Player One') === 3){
  //     console.log('Player One wins!');
  //     playing = false;
  //     return;      
  //   } else if(countInArray(rows[i], 'Player Two') === 3){
  //     console.log('Player One wins!');
  //     playing = false;
  //     return;      
  //   } else if(countInArray(cols[i], 'Player Two') === 3){
  //     console.log('Player Two wins!');
  //     playing = false;
  //     return;      
  //   }
  // }
