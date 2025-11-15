import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eraser, Square, RotateCcw } from "lucide-react";

interface ShapeEditorProps {
  gridSize: number;
  initialShape?: boolean[][];
  onShapeChange: (shape: boolean[][]) => void;
}

export const ShapeEditor = ({ gridSize, initialShape, onShapeChange }: ShapeEditorProps) => {
  const [grid, setGrid] = useState<boolean[][]>(() => {
    if (initialShape) return initialShape;
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    // Start with a basic rectangle in the center
    for (let i = 2; i < gridSize - 2; i++) {
      for (let j = 2; j < gridSize - 2; j++) {
        newGrid[i][j] = true;
      }
    }
    return newGrid;
  });
  const [drawMode, setDrawMode] = useState<'draw' | 'erase'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    onShapeChange(grid);
  }, [grid, onShapeChange]);

  const handleCellClick = (row: number, col: number) => {
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = drawMode === 'draw';
    setGrid(newGrid);
  };

  const handleCellHover = (row: number, col: number) => {
    if (isDrawing) {
      handleCellClick(row, col);
    }
  };

  const handleReset = () => {
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    for (let i = 2; i < gridSize - 2; i++) {
      for (let j = 2; j < gridSize - 2; j++) {
        newGrid[i][j] = true;
      }
    }
    setGrid(newGrid);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={drawMode === 'draw' ? 'default' : 'outline'}
          onClick={() => setDrawMode('draw')}
        >
          <Square className="w-4 h-4 mr-1" />
          Draw
        </Button>
        <Button
          size="sm"
          variant={drawMode === 'erase' ? 'default' : 'outline'}
          onClick={() => setDrawMode('erase')}
        >
          <Eraser className="w-4 h-4 mr-1" />
          Erase
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>
      <div className="p-3 bg-muted/30 rounded-lg">
        <Label className="text-xs mb-2 block">Click squares to build your room shape</Label>
        <div 
          className="inline-grid gap-0 border-2 border-border"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
        >
          {grid.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-6 h-6 border border-border/30 cursor-pointer transition-colors ${
                  cell ? 'bg-primary hover:bg-primary/80' : 'bg-background hover:bg-muted'
                }`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tip: Create L-shapes, T-shapes, or any custom layout
        </p>
      </div>
    </div>
  );
};
