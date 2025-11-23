import { useState, lazy, Suspense } from 'react'
import Experience from './components/Experience'
import Projects from './components/Projects'

// Lazy load heavy components (saves ~600KB on initial load)
const Hero = lazy(() => import('./components/Hero'))
const Contact = lazy(() => import('./components/Contact'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-neutral-400 font-mono text-sm">Loading Grandmaster's Portfolio...</p>
    </div>
  </div>
);

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <main className="bg-neutral-950 min-h-screen text-neutral-100 font-sans selection:bg-gold-500/30 overflow-x-hidden">
      <Suspense fallback={<LoadingFallback />}>
        <Hero onGameStart={() => setGameStarted(true)} gameStarted={gameStarted} />
      </Suspense>
      
      {gameStarted && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards">
          <section id="experience"><Experience /></section>
          <section id="projects"><Projects /></section>
          <Suspense fallback={<div className="h-96 bg-neutral-900/50 animate-pulse" />}>
            <section id="contact"><Contact /></section>
          </Suspense>
          <footer className="py-8 text-center text-neutral-600 text-sm font-mono">
            © 2025 Rajan Dhiman. Checkmate.
          </footer>
        </div>
      )}
    </main>
  )
}

export default App
