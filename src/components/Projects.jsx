import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Code2 } from 'lucide-react';

const PROJECTS = [
  {
    id: 1,
    name: "Klean (World Cleaners)",
    tagline: "Crowdsourced Urban Cleanup Through Real-Time Geolocation",
    category: "Full Stack",
    description: "A citizen-powered web platform that enables instant reporting of illegal garbage dumps using live GPS coordinates and photographic evidence, bridging the gap between communities and municipal authorities.",
    overview: "Municipal authorities struggle to identify random, unpredictable garbage dumps across urban areas. Klean solves this by empowering citizens to become environmental watchdogs—capturing precise dump locations with GPS and visual proof, creating a real-time cleanup map for city workers.",
    features: [
      "High-precision geolocation (7 decimal places) via HTML5 API",
      "Binary image storage directly in MongoDB for evidence tracking",
      "In-memory file processing with Multer for optimized upload speeds",
      "Mobile-first UI with Framer Motion animations",
      "Single-page reporting flow designed for on-the-go submissions"
    ],
    techStack: ["React", "Node.js", "Express", "MongoDB", "Multer", "Framer Motion"],
    links: {
      github: null,
      demo: null
    },
    date: "2023",
    color: "gold"
  },
  {
    id: 2,
    name: "COVID-19 Live Tracker",
    tagline: "Real-Time Pandemic Intelligence Dashboard",
    category: "Web App",
    description: "A responsive public health platform delivering live COVID-19 statistics for Indian states with integrated educational resources for safety protocols and immunity guidance.",
    overview: "Built during the pandemic to combat misinformation, this tracker provides verified, real-time data from official APIs alongside curated health guidelines. The hybrid architecture combines modern async JavaScript for data handling with Bootstrap 5 for mobile-responsive layouts.",
    features: [
      "Async API integration with covid19india endpoint for live metrics",
      "Dynamic state-wise filtering (Confirmed, Deceased, Recovered, Vaccinated)",
      "Custom analog clock visualization using CSS transforms",
      "Mobile-first responsive design with Bootstrap 5 grids",
      "Educational modules: Social distancing, immunity boosting, symptom checking"
    ],
    techStack: ["JavaScript ES6+", "Bootstrap 5", "jQuery", "REST API", "HTML5", "CSS3"],
    links: {
      github: null,
      demo: null
    },
    date: "2021",
    color: "neutral"
  },
  {
    id: 3,
    name: "Lambda Calculus Interpreter",
    tagline: "Pure Functional Programming Language Engine",
    category: "Backend / Academic",
    description: "A Python-based interpreter implementing the theoretical foundations of functional programming through Lambda Calculus, featuring syntactic analysis, AST construction, and step-by-step reduction visualization.",
    overview: "Developed as an academic major project at NIT Jalandhar, this interpreter demonstrates deep understanding of programming language theory. It uses the Visitor Pattern to cleanly separate AST traversal from evaluation logic, handling complex transformations like Alpha Conversion (variable renaming) and Beta Reduction (function application).",
    features: [
      "Modular architecture: Lexer → Parser (LL(1) Recursive Descent) → AST",
      "Normal Order Reduction with step-by-step evaluation trace",
      "Automatic Alpha Conversion to prevent variable capture",
      "Visitor Pattern for clean separation of concerns",
      "Custom error handling for syntax violations",
      "Grammar support: λ-abstractions, applications, variables"
    ],
    techStack: ["Python", "AST Design", "Visitor Pattern", "Compiler Theory"],
    links: {
      github: null,
      demo: null
    },
    date: "2024",
    color: "gold",
    learned: "Gained deep expertise in formal language theory, compiler design patterns, and building maintainable interpreters. Mastered the Visitor Pattern for extensible AST operations."
  }
];

const Projects = () => {
  return (
    <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto relative">
      <h2 className="text-3xl font-bold text-center mb-4 text-neutral-100 flex items-center justify-center gap-3">
        <Code2 className="text-gold-500" /> Games Played
      </h2>
      <p className="text-center text-neutral-400 mb-20 max-w-2xl mx-auto">
        Strategic moves in code. Each project represents a carefully calculated opening, 
        executed with precision and foresight.
      </p>

      {/* Diagonal Advance Layout */}
      <div className="relative space-y-16">
        {PROJECTS.map((project, index) => {
          const isLeft = index % 2 === 0;
          const isGold = project.color === 'gold';
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: isLeft ? -100 : 100, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
              className={`relative ${isLeft ? 'md:mr-auto md:ml-0' : 'md:ml-auto md:mr-0'} max-w-2xl`}
            >
              {/* Move Number (Chess Notation) */}
              <div className={`absolute -top-6 ${isLeft ? 'left-4' : 'right-4'} flex items-center gap-2`}>
                <span className="text-gold-500 font-mono text-sm font-bold">Move {index + 1}</span>
                <div className="h-px w-8 bg-gold-500/30"></div>
              </div>

              {/* Connecting Arrow (except for last item) */}
              {index < PROJECTS.length - 1 && (
                <div className={`hidden md:block absolute ${isLeft ? 'left-1/2' : 'right-1/2'} -bottom-12 z-0`}>
                  <div className={`w-px h-8 bg-gradient-to-b from-gold-500/50 to-transparent ${isLeft ? '' : 'ml-auto'}`}></div>
                </div>
              )}

              {/* Project Card */}
              <div 
                className={`relative bg-neutral-900 border-2 ${isGold ? 'border-gold-500/40' : 'border-neutral-800'} rounded-lg p-8 shadow-2xl hover:shadow-gold-500/20 transition-all duration-500 hover:scale-[1.02] hover:border-gold-500/60 group overflow-hidden`}
              >
                {/* Decorative Corner */}
                <div className={`absolute top-0 ${isLeft ? 'right-0' : 'left-0'} w-20 h-20 bg-gradient-to-br ${isGold ? 'from-gold-500/10' : 'from-neutral-800/50'} to-transparent`}></div>
                
                {/* Header */}
                <div className="relative z-10 mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-neutral-100 group-hover:text-gold-400 transition-colors max-w-md">
                      {project.name}
                    </h3>
                    <span className="text-xs font-mono text-gold-500 bg-gold-500/10 px-3 py-1.5 rounded border border-gold-500/30 whitespace-nowrap">
                      {project.category}
                    </span>
                  </div>
                  <p className="text-sm text-gold-500/80 italic font-medium">{project.tagline}</p>
                </div>

                {/* Description */}
                <p className="text-neutral-400 mb-6 leading-relaxed">
                  {project.description}
                </p>

                {/* Features & Tech in Two Columns */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Features */}
                  <div>
                    <h4 className="text-xs uppercase text-gold-500 font-bold mb-3 tracking-widest flex items-center gap-2">
                      <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                      Key Moves
                    </h4>
                    <ul className="space-y-2">
                      {project.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="text-xs text-neutral-500 flex items-start leading-relaxed">
                          <span className="text-gold-500 mr-2 mt-0.5">▸</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <h4 className="text-xs uppercase text-neutral-600 font-bold mb-3 tracking-widest flex items-center gap-2">
                      <span className="w-1 h-1 bg-neutral-600 rounded-full"></span>
                      Arsenal
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span 
                          key={tech} 
                          className="text-xs border border-neutral-700 text-neutral-400 px-2.5 py-1 rounded hover:border-gold-500/50 hover:text-gold-500 hover:bg-gold-500/5 transition-all duration-300 cursor-default"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer: Links + Date */}
                <div className="flex justify-between items-center pt-6 border-t border-neutral-800/50">
                  <div className="flex gap-4">
                    {project.links.demo && (
                      <a 
                        href={project.links.demo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-gold-500 hover:text-gold-400 transition-colors group/link"
                      >
                        <ExternalLink size={16} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {project.links.github && (
                      <a 
                        href={project.links.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-gold-500 transition-colors"
                      >
                        <Github size={16} />
                        <span>Source</span>
                      </a>
                    )}
                    {!project.links.demo && !project.links.github && (
                      <span className="text-xs text-neutral-600 italic flex items-center gap-1.5">
                        <Code2 size={14} />
                        Academic Project
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-600 font-mono">{project.date}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative Chess Board Pattern (Background) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="h-full w-full bg-[linear-gradient(45deg,rgba(212,175,55,0.1)_25%,transparent_25%,transparent_75%,rgba(212,175,55,0.1)_75%),linear-gradient(45deg,rgba(212,175,55,0.1)_25%,transparent_25%,transparent_75%,rgba(212,175,55,0.1)_75%)] bg-[length:60px_60px] bg-[position:0_0,30px_30px]"></div>
      </div>
    </section>
  );
};

export default memo(Projects);
