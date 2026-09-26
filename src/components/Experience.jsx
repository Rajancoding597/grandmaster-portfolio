import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Trophy, TrendingUp, Users, Zap } from 'lucide-react';
import SpotlightCard from './ReactBits/SpotlightCard';
import DecryptedText from './ReactBits/DecryptedText';

const EXPERIENCES = [
  {
    id: 1,
    role: "Software Engineer",
    company: "Oracle",
    period: "Jul 2024 – Present",
    type: "Full-time",
    location: "Hyderabad, Telangana, India",
    achievements: [
      {
        icon: Users,
        text: "Implemented OIDC authentication with OAuth 2.0 Authorization Code Flow and SAML 2.0 federation during a migration to Oracle IAM",
        impact: "Enabled federated SSO for an enterprise customer with 2M+ users"
      },
      {
        icon: Zap,
        text: "Built backward-compatible JWT validation across legacy and Oracle IAM flows",
        impact: "Covered public-key retrieval, signature, claims, and identity-source validation"
      },
      {
        icon: TrendingUp,
        text: "Developed authorization-code exchange, access/ID/refresh-token, and logout flows",
        impact: "Delivered end-to-end authentication and session management"
      },
      {
        icon: Zap,
        text: "Extended authentication and session management across the primary web application and a C# Excel add-in",
        impact: "Supported consistent secure access across product surfaces"
      },
      {
        icon: TrendingUp,
        text: "Built an internal developer environment portal with Node.js, React, SQLite, and PowerShell",
        impact: "Centralized environment data, patching workflows, service tools, and developer commands"
      }
    ],
    skills: ["Java", "Microservices", "OAuth 2.0", "SAML 2.0", "JWT", "IAM"]
  },
  {
    id: 2,
    role: "Software Engineer Intern",
    company: "Oracle",
    period: "Jan 2024 – Jun 2024",
    type: "Internship",
    location: "Hyderabad, Telangana, India",
    achievements: [
      {
        icon: TrendingUp,
        text: "Built a Python-based ER data mapping framework on Oracle SQL product schemas",
        impact: "Improved data relationships visibility by 30% and accelerated cross-module integration workflows"
      }
    ],
    skills: ["Python", "Oracle Database", "SQL"]
  },
  {
    id: 3,
    role: "Business Analyst Intern",
    company: "InfoEdge (Naukri.com)",
    period: "May 2023 – Jul 2023",
    type: "Internship",
    location: "Noida, Uttar Pradesh, India",
    achievements: [
      {
        icon: TrendingUp,
        text: "Developed a Python and SQL statistical usage-analysis pipeline for historical product-usage patterns",
        impact: "Automated actionable customer-risk reports for product owners"
      }
    ],
    skills: ["SQL", "Python", "Data Analysis"]
  },
  {
    id: 4,
    role: "Bachelor of Technology in Computer Science and Engineering",
    company: "NIT Jalandhar",
    period: "September 2020 – June 2024",
    type: "Education",
    location: "Jalandhar, India",
    achievements: [
      {
        icon: Trophy,
        text: "CGPA: 7.78/10",
        impact: "Strong academic foundation"
      }
    ],
    skills: ["Data Structures and Algorithms", "OOP", "DBMS", "Computer Networks"]
  }
];

const Experience = () => {
  const chronologicalExperiences = [...EXPERIENCES].reverse();

  return (
    <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-neutral-100 flex items-center justify-center gap-3 mb-4">
          <Trophy className="text-gold-500" />
          <DecryptedText
            text="Career Moves"
            speed={50}
            maxIterations={12}
            sequential={true}
            revealDirection="center"
            animateOn="view"
            className="text-neutral-100"
            encryptedClassName="text-gold-500/30"
          />
        </h2>
        <p className="text-neutral-400 text-lg">Strategic positions played across the board</p>
      </motion.div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gold-500/30 before:to-transparent">
        {chronologicalExperiences.map((exp, index) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group`}
          >
            {/* Icon Marker */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gold-500/30 bg-neutral-950 group-hover:border-gold-500 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {exp.type === 'Education' ? 
                <GraduationCap size={20} className="text-gold-500" /> : 
                <Briefcase size={20} className="text-gold-500" />
              }
            </div>

            {/* Content Card */}
            <SpotlightCard className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] rounded-xl" spotlightColor="rgba(212, 175, 55, 0.12)">
            <div className="bg-neutral-900/80 backdrop-blur-sm p-6 rounded-xl border border-neutral-800 hover:border-gold-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-gold-500/10 group-hover:scale-[1.02]">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 gap-2">
                <div>
                  <h3 className="font-bold text-xl text-neutral-100 group-hover:text-gold-500 transition-colors">{exp.role}</h3>
                  <p className="text-neutral-400 font-medium mt-1">{exp.company}</p>
                  <p className="text-xs text-neutral-500 mt-1">{exp.location}</p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-1">
                  <span className="text-xs font-mono text-gold-500 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
                    {exp.period}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">{exp.type}</span>
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-3 mb-4">
                {exp.achievements.map((achievement, idx) => (
                  <div key={idx} className="flex gap-3 items-start group/achievement">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-neutral-800/50 flex items-center justify-center group-hover/achievement:bg-gold-500/20 transition-colors">
                      <achievement.icon size={14} className="text-neutral-500 group-hover/achievement:text-gold-500 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-300 leading-relaxed">{achievement.text}</p>
                      <p className="text-xs text-gold-500 font-medium mt-1 flex items-center gap-1">
                        <TrendingUp size={12} />
                        {achievement.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills/Tech Stack */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-800">
                {exp.skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="text-xs border border-neutral-700 text-neutral-400 px-2 py-1 rounded hover:border-gold-500/50 hover:text-gold-500 hover:bg-gold-500/5 transition-all cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default memo(Experience);
