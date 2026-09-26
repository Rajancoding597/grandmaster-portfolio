import React, { useState, useCallback, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Code, Cpu, Download, Terminal } from 'lucide-react';
import ShinyText from './ReactBits/ShinyText';
import DecryptedText from './ReactBits/DecryptedText';
import ChessBoard3D, { REVEAL } from './ChessBoard3D';

const Hero = ({ onGameStart, gameStarted }) => {
  const [revealStartedAt, setRevealStartedAt] = useState(null);
  const prefersReducedMotion = useReducedMotion();
  const isRevealing = revealStartedAt !== null;
  const isPortfolioVisible = isRevealing || gameStarted;

  const scrollToSection = useCallback((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <section className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* 3D Chess Board - Full Screen Background/Intro */}
      {!gameStarted && (
        <div className={`fixed inset-0 z-0 ${isRevealing ? 'pointer-events-none' : ''}`}>
          <div className="w-full h-full">
            <ChessBoard3D onGameStart={onGameStart} onRevealStart={setRevealStartedAt} />
          </div>
        </div>
      )}

      <div
        aria-hidden="true"
        className={`absolute inset-0 z-[1] pointer-events-none transition-opacity ease-in-out ${
          isRevealing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transitionDelay: prefersReducedMotion ? '0ms' : `${REVEAL.gridStart}ms`,
          transitionDuration: prefersReducedMotion ? '300ms' : `${REVEAL.gridEnd - REVEAL.gridStart}ms`,
          backgroundImage: 'linear-gradient(rgba(212,175,55,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 78%)',
        }}
      />

      {/* Portfolio Content - Reveals after game start */}
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-6xl px-4 pointer-events-none h-full relative">
        {isPortfolioVisible && (
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.3 : (REVEAL.heroEnd - REVEAL.heroStart) / 1000,
              ease: [0.22, 1, 0.36, 1],
              delay: isRevealing && !prefersReducedMotion ? REVEAL.heroStart / 1000 : 0,
            }}
            className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center pointer-events-auto relative"
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
            <div className="md:col-span-7 text-left space-y-4 relative">
              <motion.div
                initial={false}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px w-12 bg-gold-500"></span>
                  <h2 className="font-mono text-sm md:text-base tracking-widest">
                    <ShinyText text="SOFTWARE ENGINEER @ ORACLE" speed={3} color="#d4af37" shineColor="#fff8dc" className="font-mono" />
                  </h2>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-neutral-100 tracking-tight leading-tight">
                  <DecryptedText
                    text="Rajan Dhiman"
                    speed={40}
                    maxIterations={15}
                    sequential={true}
                    revealDirection="start"
                    animateOn="view"
                    className="text-neutral-100"
                    encryptedClassName="text-gold-500/40"
                    characters="♟♞♝♜♛♚⚡★◆▸"
                  />
                </h1>
                <p className="text-neutral-200 text-xl md:text-2xl mt-3 font-medium max-w-2xl leading-snug">
                  Backend engineer building <span className="text-gold-500">secure systems at scale.</span>
                </p>
              </motion.div>

              <motion.p 
                initial={false}
                className="text-neutral-300 leading-relaxed max-w-2xl text-base md:text-lg"
              >
                Software Engineer focused on backend engineering, microservices, and enterprise identity. At Oracle, I build OIDC, OAuth 2.0, SAML 2.0, JWT, and session-management capabilities that make complex authentication migrations reliable at scale.
              </motion.p>

              <div className="grid gap-2 pt-1 sm:grid-cols-3">
                {[
                  ['At Oracle', 'Software Engineer', 'Jul 2024 – Present'],
                  ['Migration scope', '2M+ user accounts', 'Federated SSO'],
                  ['AI certification', 'OCI AI Foundations', 'Associate · 2025'],
                ].map(([label, value, detail]) => (
                  <div key={label} className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 transition-colors hover:border-gold-500/40">
                    <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-neutral-500">{label}</p>
                    <p className="mt-1.5 text-sm font-semibold text-neutral-100">{value}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">{detail}</p>
                  </div>
                ))}
              </div>

              <motion.div
                initial={false}
                className="grid gap-2 sm:grid-cols-2"
              >
                {[
                  ['Backend & identity', 'Java · Spring Boot · Microservices · OAuth 2.0 · SAML 2.0 · JWT'],
                  ['Cloud & AI automation', 'AWS · Docker · Kubernetes · Codex SDK · MCP · Playwright'],
                ].map(([label, skills]) => (
                  <div key={label} className="rounded-xl border border-neutral-800/90 bg-black/25 px-3 py-2.5 transition-colors hover:border-neutral-700">
                    <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-neutral-500">{label}</p>
                    <p className="mt-1.5 text-xs leading-5 text-neutral-300">{skills}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={false}
                className="mt-1 flex flex-wrap items-center gap-2 border-t border-neutral-800/80 pt-4"
              >
                <button 
                  onClick={() => scrollToSection('projects')}
                  className="min-h-11 px-5 py-2.5 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(212,175,55,0.28)] flex items-center gap-2"
                >
                  <Terminal size={18} />
                  View projects
                  <ArrowUpRight size={18} />
                </button>
                <a
                  href="/resume/Rajan_Dhiman_Resume.pdf"
                  download="Rajan_Dhiman_Resume.pdf"
                  className="min-h-11 px-4 py-2.5 border border-neutral-600 bg-neutral-950/70 text-neutral-100 rounded-xl hover:border-gold-500 hover:text-gold-400 hover:-translate-y-0.5 transition-all flex items-center gap-2 font-medium"
                >
                  <Download size={18} />
                  Download résumé
                </a>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="min-h-11 px-3 py-2.5 text-neutral-300 hover:text-gold-400 transition-colors font-medium"
                >
                  Get in touch →
                </button>
              </motion.div>
            </div>

            {/* Right Column: Stats Card */}
            <div className="md:col-span-5 relative">
              <motion.div
                initial={false}
                className="bg-neutral-950/95 border border-neutral-700 p-7 md:p-8 rounded-2xl shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-gold-500/40 transition-colors"
              >
                {/* Chess Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                ></div>

                <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:opacity-10 transition-opacity">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-gold-500 transform rotate-12">
                    <path d="M19 22H5v-2h14v2zm-2-4H7v-2h10v2zm-2-4H9v-2h6v2zm-2-4h-2V8h2v2zm4-4h-2V4h2v2zm-4-4h-2V0h2v2z"/>
                  </svg>
                </div>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {[
                    ['2+', 'years at Oracle'],
                    ['2M+', 'users enabled for SSO'],
                    ['1000+', 'DSA problems solved'],
                    ['OCI 2025', 'AI Foundations Associate'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-xl border border-neutral-800 bg-black/30 p-4 hover:border-gold-500/40 transition-colors">
                      <p className="text-2xl font-bold text-gold-500">{value}</p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-400">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-neutral-800">
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
                    FIDE-rated chess player · Rating 1597
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
