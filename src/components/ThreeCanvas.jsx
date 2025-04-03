import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import useSound from "use-sound";
import clickSound from "src/sounds/click.mp3";
import winSound from "src/sounds/win.mp3";
import loseSound from "src/sounds/lose.mp3";

const ROWS = 7;
const COLS = 6;
const EMPTY = null;
const PLAYER_ONE = "Red";
const PLAYER_TWO = "Blue";

export default function Connect4() {
  const [board, setBoard] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY)));
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_ONE);
  const [gameMode, setGameMode] = useState(null);
  const [winner, setWinner] = useState(null);
  const [hoverColumn, setHoverColumn] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [playClick] = useSound(clickSound);
  const [playWin] = useSound(winSound);
  const [playLose] = useSound(loseSound);

  useEffect(() => {
    if (gameMode === "cpu" && currentPlayer === PLAYER_TWO && !winner) {
      setTimeout(cpuMove, 500);
    }
  }, [currentPlayer, gameMode, winner]);

  const checkWin = (board) => {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!board[row][col]) continue;
        for (let [dx, dy] of directions) {
          let count = 0;
          for (let i = 0; i < 4; i++) {
            const r = row + dx * i;
            const c = col + dy * i;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === board[row][col]) {
              count++;
            }
          }
          if (count === 4) {
            setWinner(board[row][col]);
            setShowModal(true);
            board[row][col] === PLAYER_ONE ? playWin() : playLose();
            return true;
          }
        }
      }
    }
    return false;
  };

  const dropPiece = (col) => {
    if (winner) return;
    const newBoard = board.map(row => [...row]);
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);
        playClick();

        if (!checkWin(newBoard)) {
          setCurrentPlayer((prev) => (prev === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE));
        }
        return;
      }
    }
  };

  const cpuMove = () => {
    const availableCols = board[0].map((_, col) => col).filter(col => !board[0][col]);
    if (availableCols.length > 0) {
      dropPiece(availableCols[Math.floor(Math.random() * availableCols.length)]);
    }
  };

  const resetGame = () => {
    playClick();
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY)));
    setCurrentPlayer(PLAYER_ONE);
    setWinner(null);
    setShowModal(false);
  };

  const returnHome = () => {
    playClick();
    setGameMode(null);
    resetGame();
    setHoverColumn(null);
  };

  if (!gameMode) {
    return (
      <div className="four-along">
        <h1>4Along</h1>
        <button className="button" onClick={() => { playClick(); setGameMode("pvp"); resetGame(); }}>Player vs Player</button>
        <button className="button" onClick={() => { playClick(); setGameMode("cpu"); resetGame(); }}>Player vs CPU</button>
      </div>
    );
  }

  return (
    <div key={gameMode} className="four-along">
      <h1>4Along</h1>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={() => { playClick(); setShowModal(false); }}>&times;</span>
            <h2>{winner} Wins!</h2>
          </div>
        </div>
      )}
      <Canvas shadows camera={{ position: [0, 5, 7.5], fov: 100 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[15, 20, 10]} angle={0.3} penumbra={1} castShadow />
        <group scale={[0.8, 0.8, 0.8]} position={[-(COLS * 1.2), -(ROWS * 1.2), 0]}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <mesh
                key={`${rowIndex}-${colIndex}`}
                position={[colIndex * 3, (ROWS - rowIndex - 1) * 3, 0]}
                rotation={[THREE.MathUtils.degToRad(-15), 0, 0]}
                castShadow
                onClick={() => dropPiece(colIndex)}
                onPointerEnter={() => setHoverColumn(colIndex)}
                onPointerLeave={() => setHoverColumn(null)}
              >
                <cylinderGeometry args={[1.2, 1.2, 0.3, 32]} />
                <meshStandardMaterial color={cell || (hoverColumn === colIndex ? "white" : "gray")} />
              </mesh>
            ))
          )}
        </group>
      </Canvas>
      <button className="buttonr" onClick={resetGame}>Restart</button>
      <button className="buttonm" onClick={returnHome}>Main Menu</button>
    </div>
  );
}

const styles = document.createElement("style");
styles.innerHTML = `
  .four-along {
    height: 110vh;
    width: 210vh;
    text-align: center;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

@keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
}

h1 {
    font-family: Arial, sans-serif;
    margin-top: 100px;
    margin-bottom: 10px;
    text-align: center;
    font-size: 48px;
    text-shadow: 0 0 15px orange;
    background: linear-gradient(to right, white, black, white);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientAnimation 3s linear infinite alternate;
}



 .button {
    border-radius: 10px; 
    background-color: black;
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 0 10px orange;
    transition: background-color 0.3s, color 0.3s, transform 0.1s;
}

.button:hover {
    background-color: white;
    color: black;
    transform: translateY(-3px);
    
}

.button:active {
    transform: translateY(1px);
}

.buttonr {
    border-radius: 10px;
    background-color: black;
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 0 10px orange;
    transition: background-color 0.3s, color 0.3s, transform 0.1s;
}

.buttonr:hover {
    background-color: white;
    color: black;
    transform: translateY(-3px);
}

.buttonr:active {
    transform: translateY(1px);
}

.buttonm {
    border-radius: 10px; 
    background-color: black;
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
    margin-bottom: 90px;
    border: none;
    box-shadow: 0 0 10px orange;
    transition: background-color 0.3s, color 0.3s, transform 0.1s;
}

.buttonm:hover {
    background-color: white;
    color: black;
    transform: translateY(-3px);
}

.buttonm:active {
    transform: translateY(1px);
}



  canvas {
    width: 166vw;
    height: 66vh;
    display: block;
    margin: auto;
    cursor: pointer;
  }

  /* Modal Styles */
  .modal {
    font-size: 40px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
    text-align: center;
    z-index: 1000;
    color: black;
  }

  .modal-content {
    position: relative;
  }

  .modal-content h2 {
    margin: 0;
  }

  .close-btn {
    color: black;
    position: absolute;
    top: -29px;
    right: -20px;
    font-size: 40px;
    cursor: pointer;
    transition: color 0.3s;
}

.close-btn:hover {
    color: red;
}
`;

document.head.appendChild(styles);
