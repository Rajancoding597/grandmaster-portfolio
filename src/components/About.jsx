import React from 'react';
import { motion } from 'framer-motion';
// import profileImg from '@/assets/profile.jpg';
const profileImg = "https://placehold.co/400x400/1a1a1a/d4af37?text=RD";

const About = () => {
  return (
    <section className="py-20 px-4 md:px-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-neutral-900 border border-gold-500/30 rounded-lg p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center shadow-2xl shadow-gold-500/10"
      >
        {/* Player Photo */}
        <div className="relative w-48 h-48 shrink-0">
          <div className="absolute inset-0 border-2 border-gold-500 rounded-lg transform rotate-3"></div>
          <img
            src={profileImg}
            alt="Rajan Dhiman"
            className="w-full h-full object-cover rounded-lg grayscale hover:grayscale-0 transition-all duration-500 relative z-10"
          />
        </div>

        {/* Player Stats */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-neutral-100">Rajan Dhiman</h3>
              <p className="text-gold-500 font-mono text-sm">Software Engineer</p>
            </div>
            <div className="mt-2 md:mt-0 text-right">
              <p className="text-neutral-400 text-xs uppercase tracking-wider">Federation</p>
              <p className="text-neutral-200 font-semibold">Oracle / India</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="bg-neutral-950 p-3 rounded border border-neutral-800">
              <p className="text-neutral-500 text-xs uppercase">Standard Rating</p>
              <p className="text-xl font-mono text-gold-500">2033 (CodeChef)</p>
            </div>
            <div className="bg-neutral-950 p-3 rounded border border-neutral-800">
              <p className="text-neutral-500 text-xs uppercase">Rapid Rating</p>
              <p className="text-xl font-mono text-gold-500">1470 (Codeforces)</p>
            </div>
          </div>

          <p className="text-neutral-400 leading-relaxed text-sm">
            Associate Software Engineer at Oracle with a strategic mindset honed by Competitive Programming and Chess. 
            Specializing in Java, OracleJET, and building robust entity relationship frameworks. 
            Always looking for the best move in complex systems.
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
