import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Code, Cpu, Database, Globe, Terminal } from 'lucide-react';
import ChessBoard3D from './ChessBoard3D';

const Hero = ({ onGameStart, gameStarted }) => {
  const scrollToSection = useCallback((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <section className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* 3D Chess Board - Full Screen Background/Intro */}
      <div 
        className={`fixed inset-0 transition-all duration-1500 ease-in-out z-0
          ${gameStarted 
            ? 'opacity-0 scale-110 blur-md pointer-events-none' 
            : 'opacity-100 scale-100 blur-0'
          }
        `}
      >
        <div className="w-full h-full">
          <ChessBoard3D onGameStart={onGameStart} />
        </div>
      </div>

      {/* Portfolio Content - Reveals after game start */}
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-6xl px-4 pointer-events-none h-full relative">
        {gameStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center pointer-events-auto relative"
          >
            {/* Background Tech/Chess Decorations */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              {/* Chess Knight Outline */}
              <svg className="absolute top-0 right-1/4 w-96 h-96 text-neutral-800/20 transform rotate-12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 22H5v-2h14v2zm-2-4H7v-2h10v2zm-2-4H9v-2h6v2zm-2-4h-2V8h2v2zm4-4h-2V4h2v2zm-4-4h-2V0h2v2zM5 22h2v-2H5v2zm12-2h2v-2h-2v2zm-6-4h2v-2h-2v2z"/>
                <path d="M12 2L2 22h20L12 2zm0 3.5L17.5 19h-11L12 5.5z" opacity="0.1"/> 
              </svg>
              
              {/* Circuit Lines */}
              <svg className="absolute bottom-0 left-0 w-full h-64 text-gold-500/5" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 L20 80 L40 80 L60 60 L100 60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                <path d="M10 100 L30 80 L50 80 L70 60 L100 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </svg>

              {/* Floating Icons */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-10 text-neutral-800"
              >
                <Code size={64} />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 10, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 right-20 text-neutral-800"
              >
                <Cpu size={80} />
              </motion.div>
            </div>

            {/* Left Column: Identity & Bio */}
            <div className="md:col-span-7 text-left space-y-6 relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-12 bg-gold-500"></span>
                  <h2 className="text-gold-500 font-mono text-sm md:text-base tracking-widest">SOFTWARE ENGINEER @ ORACLE</h2>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-neutral-100 tracking-tight leading-tight">
                  Rajan Dhiman
                </h1>
                <p className="text-neutral-400 text-xl md:text-2xl mt-4 font-light max-w-2xl">
                  Bridging the gap between <span className="text-white font-medium relative inline-block">
                    algorithmic precision
                    <svg className="absolute -bottom-1 left-0 w-full h-2 text-gold-500/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" fill="none" /></svg>
                  </span> and <span className="text-white font-medium">creative engineering</span>.
                </p>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="text-neutral-500 leading-relaxed max-w-xl text-lg"
              >
                I bring the strategic depth of a <span className="text-gold-500 font-medium">FIDE-rated chess player</span> to software architecture. 
                From optimizing SQL queries at Oracle to solving 1000+ problems on CodeChef, I build robust, scalable systems that win the endgame.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex flex-wrap gap-3 pt-4"
              >
                {['Java', 'Spring Boot', 'React', 'Next.js', 'AWS', 'Docker', 'Kubernetes'].map((tech) => (
                  <span key={tech} className="px-4 py-2 bg-neutral-900/50 border border-neutral-800 rounded-full text-neutral-300 text-sm hover:border-gold-500/50 hover:text-gold-500 transition-colors cursor-default flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span>
                    {tech}
                  </span>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="pt-8 flex gap-6"
              >
                <button 
                  onClick={() => scrollToSection('projects')}
                  className="px-8 py-3 bg-gold-500 text-black font-bold rounded hover:bg-gold-400 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Terminal size={18} />
                  View Projects
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="px-8 py-3 border border-neutral-700 text-neutral-300 rounded hover:border-gold-500 hover:text-gold-500 transition-all hover:scale-105"
                >
                  Contact Me
                </button>
              </motion.div>
            </div>

            {/* Right Column: Stats Card */}
            <div className="md:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden group hover:border-gold-500/30 transition-colors"
              >
                {/* Chess Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                ></div>

                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-gold-500 transform rotate-12">
                    <path d="M19 22H5v-2h14v2zm-2-4H7v-2h10v2zm-2-4H9v-2h6v2zm-2-4h-2V8h2v2zm4-4h-2V4h2v2zm-4-4h-2V0h2v2z"/>
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-white mb-6 border-b border-neutral-800 pb-4 flex items-center gap-3">
                  <Database size={24} className="text-gold-500" />
                  Grandmaster Stats
                </h3>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center group/stat">
                    <div>
                      <p className="text-neutral-500 text-xs font-mono uppercase tracking-wider mb-1">CodeChef Rating</p>
                      <p className="text-3xl font-bold text-gold-500 group-hover/stat:scale-105 transition-transform origin-left">2033 <span className="text-sm text-neutral-400 font-normal">(5★)</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-500 text-xs font-mono uppercase tracking-wider mb-1">Global Rank</p>
                      <p className="text-white font-medium bg-neutral-800 px-2 py-1 rounded">Top 1%</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center group/stat">
                    <div>
                      <p className="text-neutral-500 text-xs font-mono uppercase tracking-wider mb-1">FIDE Rating</p>
                      <p className="text-3xl font-bold text-white group-hover/stat:scale-105 transition-transform origin-left">1597</p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-500 text-xs font-mono uppercase tracking-wider mb-1">Title</p>
                      <p className="text-gold-500 font-medium bg-gold-500/10 px-2 py-1 rounded border border-gold-500/20">National Player</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center group/stat">
                    <div>
                      <p className="text-neutral-500 text-xs font-mono uppercase tracking-wider mb-1">Codeforces</p>
                      <p className="text-xl font-bold text-neutral-300 group-hover/stat:scale-105 transition-transform origin-left">1470 <span className="text-sm text-cyan-400">(Specialist)</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-500 text-xs font-mono uppercase tracking-wider mb-1">Problems Solved</p>
                      <p className="text-white font-medium">1000+</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-800">
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Currently engineering backend systems at Oracle
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default memo(Hero);
