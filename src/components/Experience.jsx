import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Trophy, TrendingUp, Users, Zap } from 'lucide-react';

const EXPERIENCES = [
  {
    id: 1,
    role: "Software Engineer",
    company: "Oracle",
    period: "July 2024 – Present",
    type: "Full-time",
    location: "Hyderabad, India",
    achievements: [
      {
        icon: TrendingUp,
        text: "Engineered backend services in Java and SQL",
        impact: "+20% traffic handling without degradation"
      },
      {
        icon: Zap,
        text: "Authored backend tokenized export system for multitenant DB",
        impact: "3× faster file generation"
      },
      {
        icon: Users,
        text: "Led migration to OAuth with Oracle IAM",
        impact: "Reduced auth-related failures"
      },
      {
        icon: TrendingUp,
        text: "Optimized SQL queries and long-running APIs",
        impact: "40-60% faster response times"
      },
      {
        icon: Zap,
        text: "Integrated features into CI/CD pipelines",
        impact: "20% fewer release issues"
      }
    ],
    skills: ["Java", "SQL", "OracleJET", "OAuth", "REST APIs", "CI/CD"]
  },
  {
    id: 2,
    role: "Software Engineer Intern",
    company: "Oracle",
    period: "January 2024 – June 2024",
    type: "Internship",
    location: "Hyderabad, India",
    achievements: [
      {
        icon: TrendingUp,
        text: "Serviced ER framework using Python-based analysis on SQL data",
        impact: "30% better cross-module integration"
      },
      {
        icon: Users,
        text: "Improved UI components with OracleJET",
        impact: "25% reduction in UI inconsistencies"
      },
      {
        icon: Zap,
        text: "Collaborated with cross-functional teams",
        impact: "Agile feature delivery"
      }
    ],
    skills: ["Python", "SQL", "OracleJET", "Agile"]
  },
  {
    id: 3,
    role: "Business Intelligence Analyst Intern",
    company: "InfoEdge (Naukri.com)",
    period: "May 2023 – July 2023",
    type: "Internship",
    location: "Remote",
    achievements: [
      {
        icon: TrendingUp,
        text: "Established usage-drop detection system for at-risk clients",
        impact: "10-12% churn reduction in pilots"
      },
      {
        icon: Zap,
        text: "Developed interactive dashboards for customer success teams",
        impact: "50% less manual reporting time"
      },
      {
        icon: Users,
        text: "Analyzed large-scale behavioral datasets",
        impact: "Multiple product improvements"
      }
    ],
    skills: ["SQL", "Python", "Tableau", "Apache Zeppelin", "Amazon S3"]
  },
  {
    id: 4,
    role: "B.Tech in Computer Science",
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
    skills: ["DSA", "OOP", "DBMS", "Machine Learning", "Computer Networks"]
  }
];

const Experience = () => {
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
          Career Moves
        </h2>
        <p className="text-neutral-400 text-lg">Strategic positions played across the board</p>
      </motion.div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gold-500/30 before:to-transparent">
        {EXPERIENCES.map((exp, index) => (
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
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-neutral-900/80 backdrop-blur-sm p-6 rounded-xl border border-neutral-800 hover:border-gold-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-gold-500/10 group-hover:scale-[1.02]">
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
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default memo(Experience);
