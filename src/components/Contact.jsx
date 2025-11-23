import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin } from 'lucide-react';
import Terminal from './Terminal';

const Contact = () => {
  return (
    <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto mb-20">
      <h2 className="text-3xl font-bold text-center mb-12 text-neutral-100 flex items-center justify-center gap-3">
        <span className="text-gold-500">#</span> The Endgame
      </h2>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="relative z-10 flex flex-col gap-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-neutral-200 mb-4">Offer a Draw?</h3>
            <p className="text-neutral-400 mb-6 max-w-2xl mx-auto">
              Whether you want to discuss a new opening strategy, analyze a complex position, or just say hello.
            </p>
            
            <div className="flex gap-6 justify-center mb-8">
              <a href="mailto:rajaninvest597@gmail.com" className="text-neutral-400 hover:text-gold-500 transition-colors">
                <Mail size={24} />
              </a>
              <a href="https://github.com/Rajancoding597" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-gold-500 transition-colors">
                <Github size={24} />
              </a>
              <a href="https://www.linkedin.com/in/rajan-dhiman-2a070920b/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-gold-500 transition-colors">
                <Linkedin size={24} />
              </a>
            </div>
          </div>

          <div className="w-full">
            <Terminal />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
