import { useState, useEffect, useCallback } from 'react';
import { 
  Play, Users, Bot, Trophy, Sparkles, RotateCcw, Hand, 
  Square, Crown, Loader2, Plus, Minus, ArrowRight, Home,
  Zap, SkipForward, ArrowLeftRight, Shield, Palette, Snowflake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  trackUCGRoundWin, 
  trackUCGGameComplete, 
  trackUCGCloseCall 
} from '@/hooks/useAchievementTriggers';

type CardSuit = '♠' | '♥' | '♦' | '♣';
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type TrumpEffect = 'none' | 'skip' | 'draw' | 'block' | 'wild' | 'freeze';

interface Card {
  suit: CardSuit;
  value: CardValue;
  numericValue: number;
  trumpEffect: TrumpEffect;
}

interface Player {
  id: string;
  name: string;
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
  hand: Card[];
  score: number;
  isStanding: boolean;
  isBust: boolean;
  isWinner: boolean;
  isSkipped: boolean;
  isFrozen: boolean;
  isBlocking: boolean;
}

interface ActionLog {
  player: string;
  action: string;
  effect?: string;
}

type GameState = 'menu' | 'setup' | 'playing' | 'roundEnd' | 'gameEnd';

const SUITS: CardSuit[] = ['♠', '♥', '♦', '♣'];
const VALUES: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Trump card effects by value
const getTrumpEffect = (value: CardValue): TrumpEffect => {
  switch (value) {
    case '2': return 'skip';      // Skip next player
    case '7': return 'draw';      // Force next player to draw
    case '8': return 'freeze';    // Freeze your hand (auto-stand)
    case 'K': return 'block';     // Block incoming effects
    case 'A': return 'wild';      // Wild card (choose 1 or 11)
    default: return 'none';
  }
};

const getTrumpInfo = (effect: TrumpEffect): { icon: React.ElementType; color: string; label: string } => {
  switch (effect) {
    case 'skip': return { icon: SkipForward, color: 'text-orange-400', label: 'SKIP' };
    case 'draw': return { icon: Plus, color: 'text-red-400', label: 'DRAW' };
    case 'freeze': return { icon: Snowflake, color: 'text-cyan-400', label: 'FREEZE' };
    case 'block': return { icon: Shield, color: 'text-emerald-400', label: 'BLOCK' };
    case 'wild': return { icon: Palette, color: 'text-violet-400', label: 'WILD' };
    default: return { icon: Zap, color: 'text-slate-400', label: '' };
  }
};

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      let numericValue: number;
      if (value === 'A') numericValue = 11;
      else if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
      else numericValue = parseInt(value);
      
      deck.push({ 
        suit, 
        value, 
        numericValue,
        trumpEffect: getTrumpEffect(value)
      });
    }
  }
  return shuffleDeck(deck);
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const calculateHandValue = (hand: Card[]): number => {
  let value = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
      value += 11;
    } else {
      value += card.numericValue;
    }
  }
  
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  
  return value;
};

const getBotDecision = (hand: Card[], difficulty: 'easy' | 'medium' | 'hard', hasDrawn: boolean): 'hit' | 'stand' | 'end' => {
  const value = calculateHandValue(hand);
  
  // If already drew this turn, must end turn
  if (hasDrawn) return 'end';
  
  switch (difficulty) {
    case 'easy':
      return value >= 15 ? 'stand' : 'hit';
    case 'medium':
      if (value >= 17) return 'stand';
      if (value === 16) return Math.random() > 0.5 ? 'stand' : 'hit';
      return 'hit';
    case 'hard':
      if (value >= 18) return 'stand';
      if (value === 17) return Math.random() > 0.3 ? 'stand' : 'hit';
      if (value >= 13 && value <= 16) {
        const safeCards = (21 - value);
        const hitChance = safeCards / 13;
        return Math.random() < hitChance ? 'hit' : 'stand';
      }
      return 'hit';
  }
};

const CardComponent = ({ card, hidden = false, className = '', small = false }: { 
  card: Card; 
  hidden?: boolean; 
  className?: string;
  small?: boolean;
}) => {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const hasTrump = card.trumpEffect !== 'none';
  const trumpInfo = getTrumpInfo(card.trumpEffect);
  
  if (hidden) {
    return (
      <div className={cn(
        "rounded-lg border-2 border-violet-500/30 bg-gradient-to-br from-violet-900/50 to-purple-900/30 flex items-center justify-center shadow-lg",
        small ? "w-10 h-14" : "w-16 h-24",
        className
      )}>
        <div className="text-violet-400/50 text-xl font-bold">?</div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "rounded-lg border-2 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl flex flex-col items-center justify-between transition-all hover:scale-105 relative overflow-hidden",
      isRed ? "border-red-400/40" : "border-slate-600",
      hasTrump && "ring-2 ring-offset-1 ring-offset-slate-900",
      card.trumpEffect === 'skip' && "ring-orange-400/50",
      card.trumpEffect === 'draw' && "ring-red-400/50",
      card.trumpEffect === 'freeze' && "ring-cyan-400/50",
      card.trumpEffect === 'block' && "ring-emerald-400/50",
      card.trumpEffect === 'wild' && "ring-violet-400/50",
      small ? "w-10 h-14 p-1" : "w-16 h-24 p-1.5",
      className
    )}>
      {hasTrump && (
        <div className={cn(
          "absolute top-0 right-0 px-1 py-0.5 rounded-bl text-[8px] font-bold",
          card.trumpEffect === 'skip' && "bg-orange-500/20 text-orange-400",
          card.trumpEffect === 'draw' && "bg-red-500/20 text-red-400",
          card.trumpEffect === 'freeze' && "bg-cyan-500/20 text-cyan-400",
          card.trumpEffect === 'block' && "bg-emerald-500/20 text-emerald-400",
          card.trumpEffect === 'wild' && "bg-violet-500/20 text-violet-400",
        )}>
          {trumpInfo.label}
        </div>
      )}
      <div className={cn(
        "self-start font-bold",
        isRed ? "text-red-400" : "text-slate-200",
        small ? "text-[10px]" : "text-xs"
      )}>{card.value}</div>
      <div className={cn(
        isRed ? "text-red-400" : "text-slate-200",
        small ? "text-lg" : "text-2xl"
      )}>{card.suit}</div>
      <div className={cn(
        "self-end font-bold rotate-180",
        isRed ? "text-red-400" : "text-slate-200",
        small ? "text-[10px]" : "text-xs"
      )}>{card.value}</div>
    </div>
  );
};

export const UntitledCardGame = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [players, setPlayers] = useState<Player[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [botCount, setBotCount] = useState(1);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [roundNumber, setRoundNumber] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [playerRoundsWon, setPlayerRoundsWon] = useState(0);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  const [actionLog, setActionLog] = useState<ActionLog[]>([]);
  const [pendingDraw, setPendingDraw] = useState(0);

  const addLog = useCallback((player: string, action: string, effect?: string) => {
    setActionLog(prev => [...prev.slice(-5), { player, action, effect }]);
  }, []);

  const startGame = useCallback(() => {
    const newPlayers: Player[] = [
      { 
        id: 'player', 
        name: 'You', 
        isBot: false, 
        hand: [], 
        score: 0, 
        isStanding: false, 
        isBust: false, 
        isWinner: false,
        isSkipped: false,
        isFrozen: false,
        isBlocking: false
      }
    ];
    
    for (let i = 0; i < botCount; i++) {
      newPlayers.push({
        id: `bot-${i}`,
        name: `Bot ${i + 1}`,
        isBot: true,
        botDifficulty,
        hand: [],
        score: 0,
        isStanding: false,
        isBust: false,
        isWinner: false,
        isSkipped: false,
        isFrozen: false,
        isBlocking: false
      });
    }
    
    setPlayers(newPlayers);
    setRoundNumber(1);
    setActionLog([]);
    startRound(newPlayers);
  }, [botCount, botDifficulty]);

  const startRound = (currentPlayers: Player[]) => {
    const newDeck = createDeck();
    const updatedPlayers = currentPlayers.map(p => ({
      ...p,
      hand: [],
      isStanding: false,
      isBust: false,
      isWinner: false,
      isSkipped: false,
      isFrozen: false,
      isBlocking: false
    }));
    
    // Deal 2 cards to each player
    let deckIndex = 0;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < updatedPlayers.length; j++) {
        updatedPlayers[j].hand.push(newDeck[deckIndex++]);
      }
    }
    
    setDeck(newDeck.slice(deckIndex));
    setPlayers(updatedPlayers);
    setCurrentPlayerIndex(0);
    setHasDrawnThisTurn(false);
    setPendingDraw(0);
    setGameState('playing');
    setMessage('Your turn! Draw or Stand?');
    setActionLog([{ player: 'System', action: `Round ${roundNumber} started` }]);
  };

  const applyTrumpEffect = useCallback((card: Card, playerIndex: number) => {
    const player = players[playerIndex];
    const nextIndex = (playerIndex + 1) % players.length;
    
    switch (card.trumpEffect) {
      case 'skip':
        setPlayers(prev => {
          const updated = [...prev];
          updated[nextIndex].isSkipped = true;
          return updated;
        });
        addLog(player.name, `played ${card.value}${card.suit}`, `${players[nextIndex].name} skipped!`);
        break;
      case 'draw':
        if (!players[nextIndex].isBlocking) {
          setPendingDraw(prev => prev + 1);
          addLog(player.name, `played ${card.value}${card.suit}`, `${players[nextIndex].name} must draw!`);
        } else {
          addLog(player.name, `played ${card.value}${card.suit}`, `Blocked by ${players[nextIndex].name}!`);
          setPlayers(prev => {
            const updated = [...prev];
            updated[nextIndex].isBlocking = false;
            return updated;
          });
        }
        break;
      case 'freeze':
        setPlayers(prev => {
          const updated = [...prev];
          updated[playerIndex].isFrozen = true;
          updated[playerIndex].isStanding = true;
          return updated;
        });
        addLog(player.name, `played ${card.value}${card.suit}`, `Hand frozen at ${calculateHandValue(player.hand)}!`);
        break;
      case 'block':
        setPlayers(prev => {
          const updated = [...prev];
          updated[playerIndex].isBlocking = true;
          return updated;
        });
        addLog(player.name, `played ${card.value}${card.suit}`, 'Block activated!');
        break;
      case 'wild':
        addLog(player.name, `played ${card.value}${card.suit}`, 'Wild! Counts as 1 or 11');
        break;
      default:
        addLog(player.name, `drew ${card.value}${card.suit}`);
    }
  }, [players, addLog]);

  const drawCard = useCallback(() => {
    if (deck.length === 0 || hasDrawnThisTurn) return null;
    
    const card = deck[0];
    const newDeck = deck.slice(1);
    
    setDeck(newDeck);
    setHasDrawnThisTurn(true);
    
    setPlayers(prev => {
      const updated = [...prev];
      updated[currentPlayerIndex].hand.push(card);
      
      const handValue = calculateHandValue(updated[currentPlayerIndex].hand);
      if (handValue > 21) {
        updated[currentPlayerIndex].isBust = true;
        updated[currentPlayerIndex].isStanding = true;
      }
      
      return updated;
    });
    
    // Apply trump effect
    if (card.trumpEffect !== 'none') {
      applyTrumpEffect(card, currentPlayerIndex);
    } else {
      addLog(players[currentPlayerIndex].name, `drew ${card.value}${card.suit}`);
    }
    
    return card;
  }, [deck, currentPlayerIndex, hasDrawnThisTurn, applyTrumpEffect, addLog, players]);

  const handleHit = useCallback(() => {
    if (isProcessing || hasDrawnThisTurn) return;
    drawCard();
  }, [drawCard, isProcessing, hasDrawnThisTurn]);

  const handleStand = useCallback(() => {
    if (isProcessing) return;
    
    setPlayers(prev => {
      const updated = [...prev];
      updated[currentPlayerIndex].isStanding = true;
      return updated;
    });
    addLog(players[currentPlayerIndex]?.name || 'Player', `stands at ${calculateHandValue(players[currentPlayerIndex]?.hand || [])}`);
    
    moveToNextPlayer();
  }, [currentPlayerIndex, isProcessing, players, addLog]);

  const handleEndTurn = useCallback(() => {
    if (isProcessing) return;
    moveToNextPlayer();
  }, [isProcessing]);

  const moveToNextPlayer = useCallback(() => {
    setHasDrawnThisTurn(false);
    
    setCurrentPlayerIndex(prev => {
      let next = (prev + 1) % players.length;
      let attempts = 0;
      
      // Find next player who can play
      while (attempts < players.length) {
        const player = players[next];
        
        // Handle pending draws
        if (pendingDraw > 0 && !player.isBlocking) {
          // This player needs to draw
          break;
        }
        
        if (player.isSkipped) {
          // Clear skip and move on
          setPlayers(p => {
            const updated = [...p];
            updated[next].isSkipped = false;
            return updated;
          });
          next = (next + 1) % players.length;
          attempts++;
          continue;
        }
        
        if (!player.isStanding && !player.isBust) {
          break;
        }
        
        next = (next + 1) % players.length;
        attempts++;
      }
      
      if (attempts >= players.length) {
        return -1; // All done
      }
      
      return next;
    });
  }, [players, pendingDraw]);

  // Handle bot turns
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (currentPlayerIndex === -1) {
      endRound();
      return;
    }
    
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) return;
    
    if (currentPlayer.isBust || currentPlayer.isStanding) {
      moveToNextPlayer();
      return;
    }
    
    // Handle pending draw for this player
    if (pendingDraw > 0 && !currentPlayer.isBlocking) {
      if (currentPlayer.isBot) {
        setIsProcessing(true);
        setTimeout(() => {
          // Force draw
          if (deck.length > 0) {
            const card = deck[0];
            setDeck(prev => prev.slice(1));
            setPlayers(prev => {
              const updated = [...prev];
              updated[currentPlayerIndex].hand.push(card);
              const handValue = calculateHandValue(updated[currentPlayerIndex].hand);
              if (handValue > 21) {
                updated[currentPlayerIndex].isBust = true;
                updated[currentPlayerIndex].isStanding = true;
              }
              return updated;
            });
            addLog(currentPlayer.name, `forced to draw ${card.value}${card.suit}`);
          }
          setPendingDraw(0);
          setIsProcessing(false);
        }, 500);
      } else {
        setMessage('You must draw a card!');
      }
      return;
    }
    
    if (currentPlayer.isBot) {
      setIsProcessing(true);
      setMessage(`${currentPlayer.name} is thinking...`);
      
      const delay = 800 + Math.random() * 700;
      const timer = setTimeout(() => {
        const decision = getBotDecision(currentPlayer.hand, currentPlayer.botDifficulty || 'medium', hasDrawnThisTurn);
        
        if (decision === 'hit') {
          setMessage(`${currentPlayer.name} draws!`);
          const card = deck[0];
          setDeck(prev => prev.slice(1));
          setPlayers(prev => {
            const updated = [...prev];
            updated[currentPlayerIndex].hand.push(card);
            const handValue = calculateHandValue(updated[currentPlayerIndex].hand);
            if (handValue > 21) {
              updated[currentPlayerIndex].isBust = true;
              updated[currentPlayerIndex].isStanding = true;
            }
            return updated;
          });
          
          if (card.trumpEffect !== 'none') {
            applyTrumpEffect(card, currentPlayerIndex);
          } else {
            addLog(currentPlayer.name, `drew ${card.value}${card.suit}`);
          }
          
          setHasDrawnThisTurn(true);
          // Bot ends turn after drawing
          setTimeout(() => {
            setHasDrawnThisTurn(false);
            moveToNextPlayer();
            setIsProcessing(false);
          }, 400);
        } else if (decision === 'stand') {
          setMessage(`${currentPlayer.name} stands at ${calculateHandValue(currentPlayer.hand)}`);
          addLog(currentPlayer.name, `stands at ${calculateHandValue(currentPlayer.hand)}`);
          setPlayers(prev => {
            const updated = [...prev];
            updated[currentPlayerIndex].isStanding = true;
            return updated;
          });
          setHasDrawnThisTurn(false);
          moveToNextPlayer();
          setIsProcessing(false);
        } else {
          // End turn
          setHasDrawnThisTurn(false);
          moveToNextPlayer();
          setIsProcessing(false);
        }
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      if (hasDrawnThisTurn) {
        setMessage('End your turn or stand');
      } else {
        setMessage('Your turn! Draw or Stand?');
      }
    }
  }, [currentPlayerIndex, gameState, players, hasDrawnThisTurn, pendingDraw, deck]);

  const endRound = () => {
    const activePlayers = players.filter(p => !p.isBust);
    let highestScore = 0;
    
    activePlayers.forEach(p => {
      const value = calculateHandValue(p.hand);
      if (value <= 21 && value > highestScore) {
        highestScore = value;
      }
    });
    
    const updatedPlayers = players.map(p => {
      const value = calculateHandValue(p.hand);
      const isWinner = !p.isBust && value === highestScore;
      return {
        ...p,
        score: p.score + (isWinner ? 1 : 0),
        isWinner
      };
    });
    
    setPlayers(updatedPlayers);
    setGameState('roundEnd');
    
    const winners = updatedPlayers.filter(p => p.isWinner);
    const player = updatedPlayers.find(p => p.id === 'player');
    
    if (player?.isWinner) {
      const playerHandValue = calculateHandValue(player.hand);
      const wasBlackjack = player.hand.length === 2 && playerHandValue === 21;
      trackUCGRoundWin(playerHandValue, wasBlackjack);
      setPlayerRoundsWon(prev => prev + 1);
      
      const opponents = activePlayers.filter(p => p.id !== 'player');
      const highestOpponentScore = Math.max(...opponents.map(p => calculateHandValue(p.hand)));
      if (playerHandValue === 20 && highestOpponentScore === 19) {
        trackUCGCloseCall(playerHandValue, highestOpponentScore);
      }
    }
    
    if (winners.length === 1) {
      setMessage(`${winners[0].name} wins with ${highestScore}!`);
    } else if (winners.length > 1) {
      setMessage(`Tie! ${winners.map(w => w.name).join(' & ')} with ${highestScore}!`);
    } else {
      setMessage('Everyone busted! No winner.');
    }
  };

  const nextRound = () => {
    if (roundNumber >= maxRounds) {
      setGameState('gameEnd');
      const winner = [...players].sort((a, b) => b.score - a.score)[0];
      setMessage(`Game Over! ${winner.name} wins with ${winner.score} points!`);
      trackUCGGameComplete(maxRounds, playerRoundsWon, botDifficulty, botCount);
    } else {
      setRoundNumber(prev => prev + 1);
      startRound(players);
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setPlayers([]);
    setPlayerRoundsWon(0);
    setDeck([]);
    setCurrentPlayerIndex(0);
    setRoundNumber(1);
    setActionLog([]);
    setHasDrawnThisTurn(false);
    setPendingDraw(0);
  };

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-violet-950 via-slate-900 to-slate-950">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 border border-violet-400/20">
            <span className="text-4xl font-black text-white">21</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">UNTITLED CARD GAME</h1>
          <p className="text-violet-300/70">Blackjack with Trump Cards</p>
        </div>
        
        <div className="space-y-3 w-full max-w-xs">
          <Button 
            className="w-full h-14 text-lg gap-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 shadow-lg shadow-violet-500/20"
            onClick={() => setGameState('setup')}
          >
            <Play className="w-5 h-5" />
            Play Game
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-14 text-lg gap-3 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
            disabled
          >
            <Users className="w-5 h-5" />
            Online (Coming Soon)
          </Button>
        </div>
        
        {/* Trump cards info */}
        <div className="mt-8 p-5 rounded-2xl bg-slate-800/50 border border-violet-500/20 max-w-sm">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-white">
            <Zap className="w-4 h-4 text-violet-400" />
            Trump Cards
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-orange-400">
              <SkipForward className="w-3 h-3" />
              <span>2s - Skip next</span>
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <Plus className="w-3 h-3" />
              <span>7s - Force draw</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <Snowflake className="w-3 h-3" />
              <span>8s - Freeze hand</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <Shield className="w-3 h-3" />
              <span>Ks - Block effect</span>
            </div>
            <div className="flex items-center gap-2 text-violet-400 col-span-2">
              <Palette className="w-3 h-3" />
              <span>Aces - Wild (1 or 11)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-violet-500/20 text-slate-400 text-xs">
            ⚡ One draw per turn — plan wisely!
          </div>
        </div>
      </div>
    );
  }

  // Setup Screen
  if (gameState === 'setup') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-violet-950 via-slate-900 to-slate-950">
        <h2 className="text-2xl font-bold text-white mb-8">Game Setup</h2>
        
        <div className="w-full max-w-sm space-y-5">
          <div className="p-5 rounded-xl bg-slate-800/50 border border-violet-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-slate-200 flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-400" />
                Opponents
              </span>
              <span className="text-2xl font-bold text-violet-400">{botCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                className="border-violet-500/30"
                onClick={() => setBotCount(Math.max(1, botCount - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Progress value={(botCount / 3) * 100} className="flex-1" />
              <Button 
                variant="outline" 
                size="icon"
                className="border-violet-500/30"
                onClick={() => setBotCount(Math.min(3, botCount + 1))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-5 rounded-xl bg-slate-800/50 border border-violet-500/20">
            <span className="font-medium mb-3 block text-slate-200">Difficulty</span>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <Button
                  key={diff}
                  variant={botDifficulty === diff ? 'default' : 'outline'}
                  onClick={() => setBotDifficulty(diff)}
                  className={cn(
                    "capitalize",
                    botDifficulty === diff 
                      ? "bg-violet-500 hover:bg-violet-400" 
                      : "border-violet-500/30 text-violet-300"
                  )}
                >
                  {diff}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="p-5 rounded-xl bg-slate-800/50 border border-violet-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-slate-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Rounds
              </span>
              <span className="text-2xl font-bold text-amber-400">{maxRounds}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                className="border-violet-500/30"
                onClick={() => setMaxRounds(Math.max(1, maxRounds - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Progress value={(maxRounds / 10) * 100} className="flex-1" />
              <Button 
                variant="outline" 
                size="icon"
                className="border-violet-500/30"
                onClick={() => setMaxRounds(Math.min(10, maxRounds + 1))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={resetGame} 
              className="flex-1 border-violet-500/30 text-violet-300"
            >
              Back
            </Button>
            <Button 
              onClick={startGame} 
              className="flex-1 gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500"
            >
              <ArrowRight className="w-4 h-4" />
              Start
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  const currentPlayer = players[currentPlayerIndex] || players[0];
  const isPlayerTurn = currentPlayerIndex === 0 && !players[0]?.isStanding && !players[0]?.isBust;
  const canDraw = isPlayerTurn && !hasDrawnThisTurn && !isProcessing;
  const mustDraw = isPlayerTurn && pendingDraw > 0;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-violet-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-violet-500/20 flex items-center justify-between bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={resetGame} className="text-violet-300">
            <Home className="w-4 h-4" />
          </Button>
          <Badge variant="outline" className="gap-1 border-violet-500/30 text-violet-300">
            <Trophy className="w-3 h-3 text-amber-400" />
            Round {roundNumber}/{maxRounds}
          </Badge>
        </div>
        <div className="text-sm font-medium text-violet-200">{message}</div>
      </div>
      
      {/* Game Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main game area */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Opponents */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {players.filter(p => p.id !== 'player').map((player, idx) => {
              const handValue = calculateHandValue(player.hand);
              const isActive = currentPlayerIndex === idx + 1;
              
              return (
                <div
                  key={player.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    isActive ? "border-violet-400 bg-violet-500/10 ring-2 ring-violet-400/20" : "border-slate-700 bg-slate-800/30",
                    player.isBust && "border-red-500/50 bg-red-500/5",
                    player.isWinner && "border-amber-500/50 bg-amber-500/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-200">{player.name}</span>
                      {player.isSkipped && <Badge className="bg-orange-500/20 text-orange-400 text-[10px]">SKIP</Badge>}
                      {player.isFrozen && <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px]">FROZEN</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{player.score} pts</Badge>
                      {player.isWinner && <Crown className="w-4 h-4 text-amber-400" />}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {player.hand.map((card, i) => (
                      <CardComponent 
                        key={i} 
                        card={card} 
                        hidden={gameState === 'playing' && !player.isStanding && !player.isBust}
                        small
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    {(player.isStanding || player.isBust || gameState !== 'playing') && (
                      <span className={cn(
                        "font-bold",
                        player.isBust ? "text-red-400" : player.isWinner ? "text-amber-400" : "text-slate-300"
                      )}>
                        {handValue}
                      </span>
                    )}
                    {player.isBust && <Badge className="bg-red-500/20 text-red-400">BUST</Badge>}
                    {player.isStanding && !player.isBust && <Badge variant="secondary">Standing</Badge>}
                    {isActive && <Loader2 className="w-4 h-4 animate-spin text-violet-400" />}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Player's Hand */}
          <div className={cn(
            "p-6 rounded-2xl border-2 transition-all",
            isPlayerTurn ? "border-violet-400 bg-violet-500/10" : "border-slate-700 bg-slate-800/30",
            players[0]?.isBust && "border-red-500 bg-red-500/10",
            players[0]?.isWinner && "border-amber-500 bg-amber-500/10"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">Your Hand</span>
                <Badge variant="secondary">{players[0]?.score || 0} pts</Badge>
                {players[0]?.isWinner && <Crown className="w-5 h-5 text-amber-400" />}
                {players[0]?.isFrozen && <Badge className="bg-cyan-500/20 text-cyan-400">FROZEN</Badge>}
                {hasDrawnThisTurn && isPlayerTurn && (
                  <Badge className="bg-violet-500/20 text-violet-300 text-xs">Drew this turn</Badge>
                )}
              </div>
              <div className={cn(
                "text-4xl font-black",
                players[0]?.isBust ? "text-red-400" : "text-violet-400"
              )}>
                {calculateHandValue(players[0]?.hand || [])}
              </div>
            </div>
            
            <div className="flex gap-2 mb-4 flex-wrap justify-center">
              {players[0]?.hand.map((card, i) => (
                <CardComponent key={i} card={card} />
              ))}
            </div>
            
            {players[0]?.isBust && (
              <Badge className="text-lg px-4 py-2 bg-red-500/20 text-red-400">BUST!</Badge>
            )}
            {players[0]?.isStanding && !players[0]?.isBust && (
              <Badge variant="secondary" className="text-lg px-4 py-2">Standing</Badge>
            )}
          </div>
        </div>
        
        {/* Action log sidebar */}
        <div className="w-48 border-l border-violet-500/20 bg-slate-900/50 p-3 hidden lg:block">
          <div className="text-xs font-bold text-violet-400 mb-2">Action Log</div>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {actionLog.map((log, i) => (
                <div key={i} className="text-xs p-2 rounded bg-slate-800/50 border border-slate-700/50">
                  <div className="text-slate-300">{log.player}</div>
                  <div className="text-slate-500">{log.action}</div>
                  {log.effect && <div className="text-violet-400 mt-1">{log.effect}</div>}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex-shrink-0 p-4 border-t border-violet-500/20 bg-slate-900/80 backdrop-blur">
        {gameState === 'playing' && isPlayerTurn && (
          <div className="flex gap-3">
            {mustDraw ? (
              <Button 
                className="flex-1 h-14 text-lg gap-2 bg-red-500 hover:bg-red-400"
                onClick={() => {
                  if (deck.length > 0) {
                    const card = deck[0];
                    setDeck(prev => prev.slice(1));
                    setPlayers(prev => {
                      const updated = [...prev];
                      updated[0].hand.push(card);
                      const handValue = calculateHandValue(updated[0].hand);
                      if (handValue > 21) {
                        updated[0].isBust = true;
                        updated[0].isStanding = true;
                      }
                      return updated;
                    });
                    addLog('You', `forced to draw ${card.value}${card.suit}`);
                    setPendingDraw(0);
                    setHasDrawnThisTurn(true);
                  }
                }}
              >
                <Hand className="w-5 h-5" />
                Must Draw!
              </Button>
            ) : hasDrawnThisTurn ? (
              <>
                <Button 
                  className="flex-1 h-14 text-lg gap-2 bg-violet-500 hover:bg-violet-400"
                  onClick={handleEndTurn}
                >
                  <ArrowRight className="w-5 h-5" />
                  End Turn
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 h-14 text-lg gap-2 border-violet-500/30"
                  onClick={handleStand}
                >
                  <Square className="w-5 h-5" />
                  Stand
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className="flex-1 h-14 text-lg gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500"
                  onClick={handleHit}
                  disabled={!canDraw}
                >
                  <Hand className="w-5 h-5" />
                  Draw
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 h-14 text-lg gap-2 border-violet-500/30"
                  onClick={handleStand}
                  disabled={isProcessing}
                >
                  <Square className="w-5 h-5" />
                  Stand
                </Button>
              </>
            )}
          </div>
        )}
        
        {gameState === 'roundEnd' && (
          <Button 
            className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-violet-500 to-purple-600"
            onClick={nextRound}
          >
            {roundNumber >= maxRounds ? (
              <>
                <Trophy className="w-5 h-5" />
                See Results
              </>
            ) : (
              <>
                <ArrowRight className="w-5 h-5" />
                Next Round
              </>
            )}
          </Button>
        )}
        
        {gameState === 'gameEnd' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-violet-500/20">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-white">
                <Trophy className="w-5 h-5 text-amber-400" />
                Final Scores
              </h3>
              <div className="space-y-2">
                {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
                  <div 
                    key={p.id} 
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg",
                      i === 0 && "bg-amber-500/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {i === 0 && <Crown className="w-4 h-4 text-amber-400" />}
                      <span className={cn(i === 0 ? "font-bold text-white" : "text-slate-300")}>{p.name}</span>
                    </div>
                    <span className="font-bold text-violet-400">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-violet-500 to-purple-600"
              onClick={resetGame}
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </Button>
          </div>
        )}
        
        {gameState === 'playing' && !isPlayerTurn && !players[0]?.isBust && !players[0]?.isStanding && (
          <div className="text-center text-slate-400 py-4">
            Waiting for other players...
          </div>
        )}
      </div>
    </div>
  );
};
