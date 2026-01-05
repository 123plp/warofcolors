import { useState, useEffect, useCallback } from "react";
import { Gamepad2, Space, Target, FileText, ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

type GameType = "menu" | "invaders" | "pong" | "wordle";

const WORD_LIST = [
  "apple", "brave", "crane", "dream", "eagle", "flame", "grape", "heart", "ivory", "joker",
  "karma", "lemon", "mango", "noble", "ocean", "piano", "queen", "river", "solar", "tiger",
  "urban", "vivid", "water", "xenon", "youth", "zebra", "angel", "blaze", "charm", "dance",
  "earth", "faith", "giant", "happy", "ideal", "jewel", "knife", "light", "magic", "night",
  "olive", "peace", "quiet", "rapid", "storm", "tower", "unity", "voice", "wrist", "xylon",
  "young", "zesty", "about", "begin", "catch", "drive", "early", "found", "grand", "house",
  "input", "joint", "known", "learn", "money", "never", "order", "power", "quick", "right",
  "small", "think", "under", "value", "world", "xerox", "yield", "zones", "audio", "blank",
  "clear", "depth", "every", "fresh", "green", "human", "issue", "judge", "kings", "level"
];

// Alien Invaders Game
const AlienInvaders = ({ onBack }: { onBack: () => void }) => {
  const GRID_WIDTH = 30;
  const GRID_HEIGHT = 15;
  
  const [playerPos, setPlayerPos] = useState(Math.floor(GRID_WIDTH / 2));
  const [aliens, setAliens] = useState<{ x: number; y: number }[]>([]);
  const [bullets, setBullets] = useState<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [alienDir, setAlienDir] = useState(1);

  // Initialize aliens
  useEffect(() => {
    const initialAliens: { x: number; y: number }[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 2; col < GRID_WIDTH - 2; col += 3) {
        initialAliens.push({ x: col, y: row + 1 });
      }
    }
    setAliens(initialAliens);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft" && playerPos > 0) {
      setPlayerPos(p => p - 1);
    } else if (e.key === "ArrowRight" && playerPos < GRID_WIDTH - 1) {
      setPlayerPos(p => p + 1);
    } else if (e.key === " ") {
      e.preventDefault();
      setBullets(b => [...b, { x: playerPos, y: GRID_HEIGHT - 2 }]);
    }
  }, [playerPos, gameOver]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Game loop
  useEffect(() => {
    if (gameOver || aliens.length === 0) return;

    const interval = setInterval(() => {
      // Move bullets
      setBullets(prev => prev.map(b => ({ ...b, y: b.y - 1 })).filter(b => b.y >= 0));

      // Check collisions
      setAliens(prevAliens => {
        const newAliens = [...prevAliens];
        setBullets(prevBullets => {
          const remainingBullets = prevBullets.filter(bullet => {
            const hitIndex = newAliens.findIndex(a => a.x === bullet.x && a.y === bullet.y);
            if (hitIndex !== -1) {
              newAliens.splice(hitIndex, 1);
              setScore(s => s + 10);
              return false;
            }
            return true;
          });
          return remainingBullets;
        });
        return newAliens;
      });

      // Move aliens
      setAliens(prev => {
        if (prev.length === 0) return prev;
        const rightMost = Math.max(...prev.map(a => a.x));
        const leftMost = Math.min(...prev.map(a => a.x));
        
        let newDir = alienDir;
        let moveDown = false;
        
        if (rightMost >= GRID_WIDTH - 1 && alienDir === 1) {
          newDir = -1;
          moveDown = true;
        } else if (leftMost <= 0 && alienDir === -1) {
          newDir = 1;
          moveDown = true;
        }
        
        if (newDir !== alienDir) setAlienDir(newDir);
        
        const newAliens = prev.map(a => ({
          x: a.x + (moveDown ? 0 : alienDir),
          y: moveDown ? a.y + 1 : a.y
        }));

        // Check if aliens reached bottom
        if (newAliens.some(a => a.y >= GRID_HEIGHT - 1)) {
          setGameOver(true);
        }
        
        return newAliens;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [gameOver, alienDir, aliens.length]);

  // Win condition
  useEffect(() => {
    if (aliens.length === 0 && score > 0) {
      setGameOver(true);
    }
  }, [aliens.length, score]);

  const renderGrid = () => {
    const grid: string[][] = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(" "));
    
    // Draw aliens
    aliens.forEach(a => {
      if (a.y >= 0 && a.y < GRID_HEIGHT && a.x >= 0 && a.x < GRID_WIDTH) {
        grid[a.y][a.x] = "W";
      }
    });
    
    // Draw bullets
    bullets.forEach(b => {
      if (b.y >= 0 && b.y < GRID_HEIGHT) {
        grid[b.y][b.x] = "|";
      }
    });
    
    // Draw player
    grid[GRID_HEIGHT - 1][playerPos] = "A";
    
    return grid.map(row => row.join("")).join("\n");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <span className="font-mono text-sm">Score: {score}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <pre className="font-mono text-xs text-primary bg-muted p-2 rounded border border-border leading-tight">
          {renderGrid()}
        </pre>
        {gameOver && (
          <div className="mt-4 text-center">
            <p className="text-lg font-bold text-primary">
              {aliens.length === 0 ? "YOU WIN!" : "GAME OVER"}
            </p>
            <p className="text-sm text-muted-foreground">Final Score: {score}</p>
            <Button className="mt-2" onClick={() => window.location.reload()}>
              Play Again
            </Button>
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          ← → to move • SPACE to shoot
        </p>
      </div>
    </div>
  );
};

// Pong Game
const Pong = ({ onBack }: { onBack: () => void }) => {
  const WIDTH = 40;
  const HEIGHT = 15;
  const PADDLE_SIZE = 3;

  const [leftPaddle, setLeftPaddle] = useState(Math.floor(HEIGHT / 2) - 1);
  const [rightPaddle, setRightPaddle] = useState(Math.floor(HEIGHT / 2) - 1);
  const [ball, setBall] = useState({ x: Math.floor(WIDTH / 2), y: Math.floor(HEIGHT / 2) });
  const [ballVel, setBallVel] = useState({ x: 1, y: 1 });
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [gameOver, setGameOver] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    if (e.key === "w" && leftPaddle > 0) {
      setLeftPaddle(p => p - 1);
    } else if (e.key === "s" && leftPaddle < HEIGHT - PADDLE_SIZE) {
      setLeftPaddle(p => p + 1);
    }
  }, [leftPaddle, gameOver]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setBall(prev => {
        let newX = prev.x + ballVel.x;
        let newY = prev.y + ballVel.y;
        let newVelX = ballVel.x;
        let newVelY = ballVel.y;

        // Top/bottom collision
        if (newY <= 0 || newY >= HEIGHT - 1) {
          newVelY = -newVelY;
          newY = Math.max(0, Math.min(HEIGHT - 1, newY));
        }

        // Left paddle collision
        if (newX <= 2 && newY >= leftPaddle && newY < leftPaddle + PADDLE_SIZE) {
          newVelX = 1;
          newX = 3;
        }

        // Right paddle collision
        if (newX >= WIDTH - 3 && newY >= rightPaddle && newY < rightPaddle + PADDLE_SIZE) {
          newVelX = -1;
          newX = WIDTH - 4;
        }

        // Score
        if (newX <= 0) {
          setScore(s => {
            const newScore = { ...s, right: s.right + 1 };
            if (newScore.right >= 5) setGameOver(true);
            return newScore;
          });
          return { x: Math.floor(WIDTH / 2), y: Math.floor(HEIGHT / 2) };
        }
        if (newX >= WIDTH - 1) {
          setScore(s => {
            const newScore = { ...s, left: s.left + 1 };
            if (newScore.left >= 5) setGameOver(true);
            return newScore;
          });
          return { x: Math.floor(WIDTH / 2), y: Math.floor(HEIGHT / 2) };
        }

        if (newVelX !== ballVel.x || newVelY !== ballVel.y) {
          setBallVel({ x: newVelX, y: newVelY });
        }

        return { x: newX, y: newY };
      });

      // AI for right paddle
      setRightPaddle(prev => {
        if (ball.y < prev + 1 && prev > 0) return prev - 1;
        if (ball.y > prev + 1 && prev < HEIGHT - PADDLE_SIZE) return prev + 1;
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameOver, ballVel, ball.y, leftPaddle, rightPaddle]);

  const renderGrid = () => {
    const grid: string[][] = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(" "));
    
    // Draw paddles
    for (let i = 0; i < PADDLE_SIZE; i++) {
      grid[leftPaddle + i][1] = "|";
      grid[rightPaddle + i][WIDTH - 2] = "|";
    }
    
    // Draw ball
    if (ball.y >= 0 && ball.y < HEIGHT && ball.x >= 0 && ball.x < WIDTH) {
      grid[ball.y][ball.x] = "O";
    }
    
    return grid.map(row => row.join("")).join("\n");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <span className="font-mono text-sm">{score.left} - {score.right}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <pre className="font-mono text-xs text-primary bg-muted p-2 rounded border border-border leading-tight">
          {renderGrid()}
        </pre>
        {gameOver && (
          <div className="mt-4 text-center">
            <p className="text-lg font-bold text-primary">
              {score.left >= 5 ? "YOU WIN!" : "AI WINS!"}
            </p>
            <Button className="mt-2" onClick={() => window.location.reload()}>
              Play Again
            </Button>
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          W/S to move paddle • First to 5 wins
        </p>
      </div>
    </div>
  );
};

// Wordle Game
const Wordle = ({ onBack }: { onBack: () => void }) => {
  const [targetWord] = useState(() => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toUpperCase());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [usedLetters, setUsedLetters] = useState<Record<string, "correct" | "present" | "absent">>({});

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    
    if (e.key === "Enter" && currentGuess.length === 5) {
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      
      // Update used letters
      const newUsedLetters = { ...usedLetters };
      currentGuess.split("").forEach((letter, i) => {
        if (targetWord[i] === letter) {
          newUsedLetters[letter] = "correct";
        } else if (targetWord.includes(letter) && newUsedLetters[letter] !== "correct") {
          newUsedLetters[letter] = "present";
        } else if (!newUsedLetters[letter]) {
          newUsedLetters[letter] = "absent";
        }
      });
      setUsedLetters(newUsedLetters);
      
      if (currentGuess === targetWord) {
        setWon(true);
        setGameOver(true);
      } else if (newGuesses.length >= 6) {
        setGameOver(true);
      }
      setCurrentGuess("");
    } else if (e.key === "Backspace") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + e.key.toUpperCase());
    }
  }, [currentGuess, gameOver, guesses, targetWord, usedLetters]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getLetterColor = (letter: string, index: number, word: string) => {
    if (targetWord[index] === letter) return "bg-green-600 text-white";
    if (targetWord.includes(letter)) return "bg-yellow-600 text-white";
    return "bg-muted-foreground/30 text-foreground";
  };

  const renderGuess = (guess: string, isCurrentRow: boolean = false) => {
    const letters = isCurrentRow 
      ? currentGuess.padEnd(5, " ").split("")
      : guess.padEnd(5, " ").split("");
    
    return (
      <div className="flex gap-1">
        {letters.map((letter, i) => (
          <div
            key={i}
            className={`w-8 h-8 flex items-center justify-center font-mono font-bold text-sm border border-border rounded ${
              !isCurrentRow && letter !== " " ? getLetterColor(letter, i, guess) : "bg-background"
            }`}
          >
            {letter}
          </div>
        ))}
      </div>
    );
  };

  const keyboard = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <span className="font-mono text-sm">Wordle</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-2">
        {/* Past guesses */}
        {guesses.map((guess, i) => (
          <div key={i}>{renderGuess(guess)}</div>
        ))}
        
        {/* Current row */}
        {!gameOver && guesses.length < 6 && renderGuess("", true)}
        
        {/* Empty rows */}
        {Array(Math.max(0, 5 - guesses.length)).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="flex gap-1">
            {Array(5).fill(null).map((_, j) => (
              <div key={j} className="w-8 h-8 border border-border rounded bg-background" />
            ))}
          </div>
        ))}

        {gameOver && (
          <div className="mt-4 text-center">
            <p className="text-lg font-bold text-primary">
              {won ? "CORRECT!" : `The word was: ${targetWord}`}
            </p>
            <Button className="mt-2" onClick={() => window.location.reload()}>
              Play Again
            </Button>
          </div>
        )}

        {/* Keyboard */}
        <div className="mt-4 flex flex-col gap-1">
          {keyboard.map((row, i) => (
            <div key={i} className="flex justify-center gap-1">
              {row.map(letter => (
                <button
                  key={letter}
                  className={`w-6 h-8 text-xs font-mono rounded ${
                    usedLetters[letter] === "correct" ? "bg-green-600 text-white" :
                    usedLetters[letter] === "present" ? "bg-yellow-600 text-white" :
                    usedLetters[letter] === "absent" ? "bg-muted-foreground/30" :
                    "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => {
                    if (!gameOver && currentGuess.length < 5) {
                      setCurrentGuess(prev => prev + letter);
                    }
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Game Hub
export const GameHub = () => {
  const [currentGame, setCurrentGame] = useState<GameType>("menu");

  if (currentGame === "invaders") {
    return <AlienInvaders onBack={() => setCurrentGame("menu")} />;
  }

  if (currentGame === "pong") {
    return <Pong onBack={() => setCurrentGame("menu")} />;
  }

  if (currentGame === "wordle") {
    return <Wordle onBack={() => setCurrentGame("menu")} />;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
        <Gamepad2 className="w-5 h-5 text-primary" />
        <span className="font-semibold">Game Hub</span>
      </div>
      
      <div className="flex-1 p-4">
        <pre className="font-mono text-xs text-primary mb-6 text-center">
{`   ____    _    __  __ _____   _   _ _   _ ____  
  / ___|  / \\  |  \\/  | ____| | | | | | | | __ ) 
 | |  _  / _ \\ | |\\/| |  _|   | |_| | | | |  _ \\ 
 | |_| |/ ___ \\| |  | | |___  |  _  | |_| | |_) |
  \\____/_/   \\_\\_|  |_|_____| |_| |_|\\___/|____/ `}
        </pre>

        <div className="grid gap-3">
          <button
            onClick={() => setCurrentGame("invaders")}
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
          >
            <Space className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Alien Invaders</h3>
              <p className="text-xs text-muted-foreground">Defend against the alien horde</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentGame("pong")}
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
          >
            <Target className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Pong</h3>
              <p className="text-xs text-muted-foreground">Classic paddle vs AI battle</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentGame("wordle")}
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
          >
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Wordle</h3>
              <p className="text-xs text-muted-foreground">Guess the 5-letter word</p>
            </div>
          </button>
        </div>

        <div className="mt-6 p-3 rounded border border-border bg-muted/30">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-muted-foreground">All games use keyboard controls</span>
          </div>
        </div>
      </div>
    </div>
  );
};
