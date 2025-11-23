import React, { useState, useEffect, useRef } from 'react';
import { fileSystem, commands } from '../utils/terminalFileSystem';
import './Terminal.css';
import { Play, FileText, Mail, Terminal as TerminalIcon, FileDown } from 'lucide-react';

const BOOT_SEQUENCE = [
  "Initializing Grandmaster Kernel v1.0.0...",
  "Loading Chess Engine... [OK]",
  "Mounting File System... [OK]",
  "Establishing Secure Connection... [OK]",
  "Welcome, Guest."
];

// Moved outside to prevent re-creation on every render
const QuickAction = ({ icon: Icon, label, cmd, onExecute }) => (
  <button
    onClick={() => onExecute(cmd)}
    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-400 hover:text-gold-500 hover:border-gold-500 transition-colors"
  >
    <Icon size={12} />
    {label}
  </button>
);

const Terminal = () => {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState(['~']);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isBooting, setIsBooting] = useState(true);
  const [startBoot, setStartBoot] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [typingOutput, setTypingOutput] = useState(null); // For typewriter effect
  
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const containerRef = useRef(null); // For scrollable content area
  const terminalRef = useRef(null); // For IntersectionObserver
  const typingTimeoutRef = useRef(null); // To track and cancel ongoing typing

  // Boot Sequence Effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartBoot(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (terminalRef.current) {
      observer.observe(terminalRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!startBoot) return;

    let delay = 0;
    let timeouts = [];

    BOOT_SEQUENCE.forEach((line, index) => {
      delay += 500 + Math.random() * 500;
      const timeoutId = setTimeout(() => {
        setHistory(prev => [...prev, { type: 'output', content: line }]);
        if (index === BOOT_SEQUENCE.length - 1) {
          setTimeout(() => {
            setIsBooting(false);
            setHistory(prev => [
              ...prev, 
              { type: 'output', content: 'Type "help" or use the buttons above to navigate.\n\n💡 Psst... Recruiters can try: sudo hire-rajan' }
            ]);
          }, 800);
        }
      }, delay);
      timeouts.push(timeoutId);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [startBoot]);

  // Auto-scroll effect
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, isBooting]);

  // Auto-scroll during typewriter effect
  useEffect(() => {
    if (typingOutput !== null && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [typingOutput]);

  // Auto-focus after boot
  useEffect(() => {
    if (!isBooting && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isBooting]);

  const getCurrentDir = () => {
    let current = fileSystem["~"];
    for (let i = 1; i < currentPath.length; i++) {
      if (current.children && current.children[currentPath[i]]) {
        current = current.children[currentPath[i]];
      } else {
        return current;
      }
    }
    return current;
  };

  const typewriterEffect = (text, callback) => {
    // Cancel any ongoing typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    let index = 0;
    const speed = 10; // milliseconds per character (faster)
    
    setTypingOutput('');

    const type = () => {
      if (index < text.length) {
        setTypingOutput(text.substring(0, index + 1));
        index++;
        typingTimeoutRef.current = setTimeout(type, speed);
      } else {
        setTypingOutput(null);
        if (callback) callback();
      }
    };

    type();
  };

  const executeCommand = (cmdString) => {
    const trimmedCmd = cmdString.trim();
    if (!trimmedCmd) return;

    // Cancel any ongoing typing animation
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setTypingOutput(null);
    }

    const newHistory = [...history, { type: 'input', content: trimmedCmd, path: currentPath.join('/') }];
    const parts = trimmedCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    setCommandHistory(prev => [trimmedCmd, ...prev]);
    setHistoryIndex(-1);

    let output = '';

    try {
      switch (cmd) {
        case 'help':
        case 'whoami':
        case 'email':
        case 'summary':
          if (commands[cmd]) {
            output = commands[cmd]();
          } else {
            output = `Command definition missing: ${cmd}`;
          }
          break;
        case 'sudo':
          output = commands.sudo(args);
          break;
        case 'clear':
          setHistory([]);
          return;
        case 'ls':
          const dir = getCurrentDir();
          output = Object.keys(dir.children || {}).join('  ');
          break;
        case 'cd':
          if (!args[0] || args[0] === '~') {
            setCurrentPath(['~']);
          } else if (args[0] === '..') {
            if (currentPath.length > 1) {
              setCurrentPath(prev => prev.slice(0, -1));
            }
          } else {
            const currentDir = getCurrentDir();
            if (currentDir.children && currentDir.children[args[0]] && currentDir.children[args[0]].type === 'dir') {
              setCurrentPath(prev => [...prev, args[0]]);
            } else {
              output = `cd: no such directory: ${args[0]}`;
            }
          }
          break;
        case 'cat':
          if (!args[0]) {
            output = 'cat: missing file operand';
          } else {
            const currentDir = getCurrentDir();
            const target = currentDir.children && currentDir.children[args[0]];
            
            if (!target) {
              output = `cat: ${args[0]}: No such file or directory`;
            } else if (target.type === 'dir') {
              output = `cat: ${args[0]}: Is a directory\n💡 Tip: Use 'cd ${args[0]}' to enter, then 'ls' to see contents`;
            } else if (target.type === 'file') {
              // Check if it's a PDF download
              if (target.content === 'download' && target.downloadPath) {
                // Trigger download
                const link = document.createElement('a');
                link.href = target.downloadPath;
                link.download = args[0];
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                output = `📄 Downloading ${args[0]}...\n✓ Resume downloaded successfully!`;
              } else {
                output = target.content;
              }
            }
          }
          break;
        default:
          output = `command not found: ${cmd}`;
      }
    } catch (error) {
      output = `Error executing command: ${error.message}`;
    }

    // Set history immediately with the input
    setHistory(newHistory);

    // Use typewriter effect for output if there is any
    if (output) {
      typewriterEffect(output, () => {
        setHistory(prev => [...prev, { type: 'output', content: output }]);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      containerRef.current?.scrollBy({ top: -50, behavior: 'smooth' });
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      containerRef.current?.scrollBy({ top: 50, behavior: 'smooth' });
    }
  };

  // Wrapper to refocus after button-triggered commands
  const executeAndRefocus = (cmd) => {
    executeCommand(cmd);
    // Refocus the input after a brief delay to ensure command completes
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    }, 10);
  };

  return (
    <div className="w-full">
      {/* Quick Actions Bar */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-2 md:pb-0">
        <QuickAction icon={TerminalIcon} label="Summary" cmd="summary" onExecute={executeAndRefocus} />
        <QuickAction icon={FileText} label="Contact" cmd="cat contact.md" onExecute={executeAndRefocus} />
        <QuickAction icon={FileDown} label="Resume" cmd="cat resume.pdf" onExecute={executeAndRefocus} />
        <QuickAction icon={Mail} label="Email" cmd="email" onExecute={executeAndRefocus} />
        <QuickAction icon={Play} label="Clear" cmd="clear" onExecute={executeAndRefocus} />
      </div>

      {/* Terminal Window */}
      <div ref={terminalRef} className="terminal-crt bg-neutral-950 rounded-lg border border-neutral-800 shadow-2xl overflow-hidden relative">
        {/* CRT Overlay Effects */}
        <div className="terminal-flicker absolute inset-0 pointer-events-none z-10 opacity-50 mix-blend-overlay"></div>

        {/* Header - Fixed at top, outside scroll */}
        <div className="flex gap-2 border-b border-neutral-800 pb-2 pt-4 px-4 bg-neutral-950 relative z-30">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="ml-2 text-neutral-500 text-xs tracking-wider">guest@grandmaster-portfolio: {currentPath.join('/')}</span>
        </div>

        {/* Scrollable Content Area */}
        <div 
          ref={containerRef}
          className="terminal-scroll h-[400px] overflow-y-auto p-4 relative cursor-text font-mono text-sm"
          onClick={() => !isBooting && inputRef.current?.focus({ preventScroll: true })}
        >
          <div className="space-y-2 relative z-0">
            {history.map((entry, i) => (
              <div key={i} className={`${entry.type === 'input' ? 'text-neutral-300' : 'text-gold-500 text-glow'} whitespace-pre-wrap`}>
                {entry.type === 'input' && (
                  <span className="text-green-500 mr-2 text-glow-green">➜ {entry.path}</span>
                )}
                {entry.content}
              </div>
            ))}
            
            {/* Typing animation output */}
            {typingOutput !== null && (
              <div className="text-gold-500 text-glow whitespace-pre-wrap">
                {typingOutput}
                <span className="inline-block w-2 h-4 bg-gold-500 ml-1 cursor-blink"></span>
              </div>
            )}
            
            {!isBooting && (
              <div className="flex items-center flex-wrap">
                <span className="text-green-500 text-glow-green mr-2 shrink-0">➜ {currentPath.join('/')}</span>
                
                {/* Hidden Input for capturing keystrokes */}
                <input 
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="opacity-0 absolute w-1 h-1 -z-10"
                />

                {/* Visual Display of Input + Cursor */}
                <div className="relative text-neutral-200 text-glow whitespace-pre-wrap break-all">
                  {input}
                  <span 
                    className={`inline-block w-2.5 h-5 bg-gold-500 align-middle ml-0.5 ${isFocused ? 'cursor-blink' : 'opacity-50'}`}
                  ></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
