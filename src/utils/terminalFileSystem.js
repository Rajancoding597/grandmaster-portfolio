export const fileSystem = {
  "~": {
    type: "dir",
    children: {
      "projects": {
        type: "dir",
        children: {
          "flowlens.txt": { type: "file", content: "🤖 Project: FlowLens.AI\nStack: Next.js, TypeScript, Playwright, Codex\nDescription: AI-powered QA testing platform that converts product knowledge into structured test cases.\nRole: Creator\nHighlights: Agentic workflow, AI output validation, Evidence-backed reporting" },
          "portfolio.txt": { type: "file", content: "♟️ Project: Portfolio (This Site!)\nStack: React, Vite, Tailwind, Framer Motion\nDescription: A chess-themed interactive portfolio with a functional terminal.\nRole: Creator & Designer\nHighlights: Chess-themed UI, Interactive terminal, CRT effects" },
          "churn_detection.py": { type: "file", content: "# 📊 InfoEdge Intern Project\n# Built automated customer usage drop detection system.\n# Reduced churn by proactively reaching out to at-risk clients.\n# Stack: Python, SQL\n# Impact: 20% lower churn risk" }
        }
      },
      "about.txt": { 
        type: "file", 
        content: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 RAJAN DHIMAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Role: Associate Software Engineer @ Oracle
🎓 Education: B.Tech in Computer Science
📅 Experience: 2+ years building enterprise systems

♟️ FIDE Rated Chess Player (1597)
🏆 Competitive Programmer (CodeChef 2033)

🛠️ Top Skills:
   • Java & Spring Boot
   • OAuth 2.0 & IAM
   • AI-Assisted Dev (Codex, Next.js, Playwright)
   • REST APIs & Backend Development

🎯 Currently: Building scalable enterprise solutions
📚 Learning: Advanced System Design & Cloud Architecture

💡 Fun Fact: I think 10 moves ahead in code, just like in chess!` 
      },
      "contact.md": { 
        type: "file", 
        content: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email: rajaninvest597@gmail.com
🔗 LinkedIn: linkedin.com/in/rajan-dhiman-2a070920b/
💻 GitHub: github.com/Rajancoding597

📍 Location: India (IST Timezone)
🟢 Status: Open to opportunities
⚡ Preferred Contact: Email
⏱️ Response Time: Within 24 hours

💼 Available for:
   • Full-time positions
   • Freelance projects
   • Technical collaborations
   • Chess games ♟️` 
      },
      "resume.pdf": { 
        type: "file", 
        content: "download",
        downloadPath: "/resume/Rajan_Dhiman_Resume.pdf"
      }
    }
  }
};

export const commands = {
  help: () => `Available commands:
  ls              List directory contents
  cd [dir]        Change directory
  cat [file]      Display file contents
  summary         Display profile 
  clear           Clear the terminal screen
  whoami          Display current user
  sudo [cmd]      Execute a command with superuser privileges
  email           Open default email client
  color [theme]   Change terminal theme (green, amber, cyan, gold)
  matrix          Enter the Matrix
  vi / vim        Edit file (try it!)
  rm -rf /        Do not run this...`,
  
  whoami: () => "guest@rajan-portfolio",

  summary: () => `
  ---------------------------------------------------
  👤 RAJAN DHIMAN | Software Engineer
  ---------------------------------------------------
  📍 Role: Associate Software Engineer @ Oracle
  🛠️ Stack: Java, Spring Boot, OAuth 2.0, Next.js, AI/Codex
  🏆 Rating: 2033 (CodeChef) | 1597 (FIDE)
  
  Looking for a developer who thinks 10 moves ahead?
  Type 'email' to start the conversation.
  ---------------------------------------------------`,
  
  email: () => {
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=rajaninvest597@gmail.com", "_blank");
    return "Opening Gmail compose window...";
  },

  sudo: (args) => {
    // No arguments - show usage
    if (!args[0]) {
      return `Usage: sudo [command]

💼 Hiring? Try: sudo hire-rajan
⚠️  Other commands: Permission denied`;
    }
    
    if (args[0] === "hire-rajan") {
      // Open email in new tab (better than mailto)
      window.open("https://mail.google.com/mail/?view=cm&fs=1&to=rajaninvest597@gmail.com&su=Job%20Opportunity%20-%20Let's%20Connect!", "_blank");
      
      return `[sudo] password for guest: ****
Access Granted.
Initiating hiring protocol...
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%

✓ Email client opened successfully!
✓ LinkedIn: linkedin.com/in/rajan-dhiman-2a070920b/
📄 Resume: Use 'cat resume.pdf' to download

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 CANDIDATE PROFILE LOADED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Rajan Dhiman
Role: Associate Software Engineer @ Oracle
Rating: 2033 (CodeChef) | 1597 FIDE (Chess)
Status: 🟢 Available for opportunities

💡 Looking forward to discussing how I can contribute 
   to your team's success!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }
    return "Permission denied: You are not Rajan.";
  },

  color: (args) => {
    const theme = args[0];
    if (!theme) return "Usage: color [green|amber|cyan|gold]";
    
    const themes = ['green', 'amber', 'cyan', 'gold'];
    if (themes.includes(theme)) {
      // We'll handle the actual state change in the component via a custom event or callback
      // For now, we return a success message that the component intercepts
      return `__THEME_CHANGE__:${theme}`;
    }
    return `Color '${theme}' not found. Available: ${themes.join(', ')}`;
  },

  matrix: () => {
    return "__MATRIX_EFFECT__";
  },

  rm: (args) => {
    if (args[0] === '-rf' && args[1] === '/') {
      return "__SYSTEM_CRASH__";
    }
    return "rm: missing operand";
  },

  vi: () => "vim: to exit, restart your browser... just kidding, press Esc (but it won't work here).",
  vim: () => "vim: to exit, restart your browser... just kidding, press Esc (but it won't work here)."

};
