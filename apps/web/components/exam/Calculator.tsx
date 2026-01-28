"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Delete, Divide, Plus, Minus, Equal, Percent } from "lucide-react";
import { cn } from "@what-cse/ui/lib/utils";

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function Calculator({ isOpen, onClose, position }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(position || { x: 100, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle keyboard input
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
      } else if (e.key === ".") {
        inputDot();
      } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
        performOperation(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        performOperation("=");
      } else if (e.key === "Escape") {
        clearAll();
      } else if (e.key === "Backspace") {
        backspace();
      } else if (e.key === "%") {
        percentage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, display, operator, previousValue, waitingForOperand]);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - dragPosition.x,
      y: e.clientY - dragPosition.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay("0");
  }, []);

  const backspace = useCallback(() => {
    if (display.length === 1 || (display.length === 2 && display[0] === "-")) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  const percentage = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue;
      let newValue: number;

      switch (operator) {
        case "+":
          newValue = currentValue + inputValue;
          break;
        case "-":
          newValue = currentValue - inputValue;
          break;
        case "*":
          newValue = currentValue * inputValue;
          break;
        case "/":
          newValue = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          newValue = inputValue;
      }

      // Format the result to avoid floating point issues
      const formattedValue = Math.round(newValue * 1000000000) / 1000000000;
      setDisplay(String(formattedValue));
      setPreviousValue(formattedValue);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator === "=" ? null : nextOperator);
  }, [display, operator, previousValue]);

  // Memory functions
  const memoryClear = () => setMemory(0);
  const memoryRecall = () => setDisplay(String(memory));
  const memoryAdd = () => setMemory(memory + parseFloat(display));
  const memorySubtract = () => setMemory(memory - parseFloat(display));

  if (!isOpen) return null;

  const Button = ({ 
    children, 
    onClick, 
    className = "", 
    variant = "default" 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string; 
    variant?: "default" | "operator" | "action" | "equal";
  }) => {
    const baseStyle = "h-12 rounded-lg font-medium transition-all active:scale-95 flex items-center justify-center";
    const variants = {
      default: "bg-white hover:bg-stone-100 text-stone-800 border border-stone-200",
      operator: "bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200",
      action: "bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200",
      equal: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md",
    };

    return (
      <button
        onClick={onClick}
        className={cn(baseStyle, variants[variant], className)}
      >
        {children}
      </button>
    );
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
      style={{ left: dragPosition.x, top: dragPosition.y, width: 280 }}
    >
      {/* Header */}
      <div
        className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <span className="text-white font-medium">计算器</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Display */}
      <div className="p-4 bg-stone-50">
        <div className="text-right text-3xl font-mono text-stone-800 overflow-x-auto whitespace-nowrap">
          {display.length > 12 ? display.slice(-12) : display}
        </div>
        {operator && previousValue !== null && (
          <div className="text-right text-sm text-stone-400 mt-1">
            {previousValue} {operator}
          </div>
        )}
      </div>

      {/* Memory buttons */}
      <div className="grid grid-cols-4 gap-1 px-3 pb-1">
        <button onClick={memoryClear} className="text-xs py-1 text-stone-500 hover:text-amber-600">MC</button>
        <button onClick={memoryRecall} className="text-xs py-1 text-stone-500 hover:text-amber-600">MR</button>
        <button onClick={memoryAdd} className="text-xs py-1 text-stone-500 hover:text-amber-600">M+</button>
        <button onClick={memorySubtract} className="text-xs py-1 text-stone-500 hover:text-amber-600">M-</button>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2 p-3">
        <Button onClick={clearAll} variant="action">AC</Button>
        <Button onClick={toggleSign} variant="action">±</Button>
        <Button onClick={percentage} variant="action"><Percent className="w-4 h-4" /></Button>
        <Button onClick={() => performOperation("/")} variant="operator"><Divide className="w-4 h-4" /></Button>

        <Button onClick={() => inputDigit("7")}>7</Button>
        <Button onClick={() => inputDigit("8")}>8</Button>
        <Button onClick={() => inputDigit("9")}>9</Button>
        <Button onClick={() => performOperation("*")} variant="operator">×</Button>

        <Button onClick={() => inputDigit("4")}>4</Button>
        <Button onClick={() => inputDigit("5")}>5</Button>
        <Button onClick={() => inputDigit("6")}>6</Button>
        <Button onClick={() => performOperation("-")} variant="operator"><Minus className="w-4 h-4" /></Button>

        <Button onClick={() => inputDigit("1")}>1</Button>
        <Button onClick={() => inputDigit("2")}>2</Button>
        <Button onClick={() => inputDigit("3")}>3</Button>
        <Button onClick={() => performOperation("+")} variant="operator"><Plus className="w-4 h-4" /></Button>

        <Button onClick={() => inputDigit("0")} className="col-span-2">0</Button>
        <Button onClick={inputDot}>.</Button>
        <Button onClick={() => performOperation("=")} variant="equal"><Equal className="w-4 h-4" /></Button>
      </div>

      {/* Footer tip */}
      <div className="px-3 pb-3">
        <div className="text-xs text-center text-stone-400">支持键盘输入</div>
      </div>
    </div>
  );
}

export default Calculator;
