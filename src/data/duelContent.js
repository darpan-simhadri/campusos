// ─── PROMPT WARS ────────────────────────────────────────────────────────────
export const PROMPT_CHALLENGES = [
  "Make Claude explain neural networks using only cricket analogies",
  "Write a prompt that generates a Hyderabad-specific startup idea with a weird team name and a business model",
  "Make Claude roast your resume in the style of a disappointed professor",
  "Write a prompt that explains quantum superposition to a 10-year-old using Minecraft",
  "Make Claude design a villain whose superpower is data privacy violations",
  "Write a prompt that generates a college student's daily schedule optimized purely for chaos",
  "Make Claude explain why Python is better than Java using only food analogies",
  "Write a prompt that generates 5 startup names that sound serious but are actually absurd",
  "Make Claude write a breakup letter from a startup to its tech stack",
  "Write a prompt that explains the attention mechanism in transformers using a classroom analogy",
  "Make Claude generate a horoscope for each programming language",
  "Write a prompt that designs an AI agent to fix hostel food complaints",
  "Make Claude explain recursion by telling a story about a student who keeps asking their senior the same question",
  "Write a prompt that generates a pitch deck slide for an app that does absolutely nothing",
  "Make Claude predict what jobs will exist in 2040 that don't exist now",
  "Write a prompt that generates a movie plot where the villain is a poorly aligned AI",
  "Make Claude write a campus legend about the person who never attended a single class but topped exams",
  "Write a prompt that explains blockchain to someone who only understands cricket",
  "Make Claude design a study plan for someone who procrastinated all semester",
  "Write a prompt that generates a fake but realistic research paper title in AI",
]

// Mock Claude outputs for Prompt Wars (when no API key)
export const MOCK_CLAUDE_OUTPUTS = [
  "Imagine a batsman (the neuron) standing at the crease. The pitch itself is the data — sometimes flat and easy, sometimes a nightmare bouncer. The neural network is the entire team: each player (layer) passes the ball (signal) with their own spin. The bowler (input layer) delivers raw data; the middle-order batsmen (hidden layers) apply transformations; the wicketkeeper (output layer) makes the final call. Training? That's practice sessions where the coach (gradient descent) yells at everyone until they stop dropping catches.",
  "Introducing **BrogrammerWala Pvt. Ltd.** — a Hyderabad startup that uses AI to predict which chai stall will have the shortest queue. Business model: charge ₹2 per prediction, free for engineering students who share their location 24/7. Team name: 'The NullPointerExceptions'. Tagline: *'We know where the chai is. Do you?'* Funding: ₹50 lakh seed from an uncle who heard 'AI startup' and thought it was air conditioning.",
  "Dear JavaScript,\n\nAfter 7 years together, I've realized I deserve better. You promised consistency but gave me `undefined is not a function` at 3 AM before every deadline. Your cousin TypeScript has been nothing but supportive. I've moved on.\n\nI'm taking the React components. Don't call me.\n\n— A former full-stack developer\n\nP.S. Please stop changing `this` context without telling me.",
  "The attention mechanism is like a classroom where the teacher (query) asks a question, every student (keys) raises their hand based on how relevant they are, and the students with their hands highest get to shout their answer (values). But here's the twist — every student can be the teacher too, simultaneously, in parallel. The result? Everyone learns from everyone at once. This is why transformers understand long documents: they don't read linearly, they 'attend' to everything at the same time.",
  "Startup idea: **Chai Time Capital** — a campus VC fund where investment decisions are made over chai. Pitch format: 90 seconds, must include at least one self-deprecating joke. Returns: paid in either equity or extra chai tokens. The weird team name? 'Venture Biryanis'. Because every portfolio company either becomes a unicorn or gets consumed at the next all-hands. Based in Hyderabad because obviously.",
]

// ─── BUILD RACE TARGETS ────────────────────────────────────────────────────
export const BUILD_TARGETS = [
  {
    id: 1, title: 'Glassmorphism Profile Card', xp: 120,
    description: 'Recreate this frosted glass profile card with avatar, name, spec badge, and 3 skill tags.',
    targetHTML: `<div style="width:280px;padding:24px;border-radius:20px;background:rgba(28,28,28,0.9);border:1px solid rgba(200,241,53,0.3);backdrop-filter:blur(10px);font-family:sans-serif;text-align:center;box-shadow:0 0 30px rgba(200,241,53,0.1)">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#C8F135,#00D4C8);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#000">S</div>
      <div style="font-size:18px;font-weight:bold;color:#fff;margin-bottom:4px;letter-spacing:0.02em">Sathvika R</div>
      <div style="color:#888;font-size:12px;margin-bottom:16px;font-family:monospace">@sathvikar · CSE</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <span style="background:#C8F135;color:#000;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:bold">React</span>
        <span style="background:transparent;color:#C8F135;border:1px solid #C8F135;padding:4px 12px;border-radius:20px;font-size:11px">Python</span>
        <span style="background:transparent;color:#666;border:1px solid #333;padding:4px 12px;border-radius:20px;font-size:11px">SQL</span>
      </div>
    </div>`,
  },
  {
    id: 2, title: 'Dark Stat Dashboard', xp: 100,
    description: 'Build 3 stat cards in a row: XP, Rank, and Streak — with icons and colored values.',
    targetHTML: `<div style="display:flex;gap:12px;font-family:sans-serif">
      <div style="background:#1C1C1C;border:1px solid #2a2a2a;border-radius:16px;padding:16px;flex:1;text-align:center">
        <div style="font-size:20px;margin-bottom:6px">⚡</div>
        <div style="color:#C8F135;font-size:22px;font-weight:900;font-family:monospace">840</div>
        <div style="color:#666;font-size:11px;margin-top:4px;letter-spacing:0.1em">TOTAL XP</div>
      </div>
      <div style="background:#1C1C1C;border:1px solid #2a2a2a;border-radius:16px;padding:16px;flex:1;text-align:center">
        <div style="font-size:20px;margin-bottom:6px">👑</div>
        <div style="color:#FFD700;font-size:22px;font-weight:900;font-family:monospace">#1</div>
        <div style="color:#666;font-size:11px;margin-top:4px;letter-spacing:0.1em">RANK</div>
      </div>
      <div style="background:#1C1C1C;border:1px solid #2a2a2a;border-radius:16px;padding:16px;flex:1;text-align:center">
        <div style="font-size:20px;margin-bottom:6px">🔥</div>
        <div style="color:#FF6B00;font-size:22px;font-weight:900;font-family:monospace">3</div>
        <div style="color:#666;font-size:11px;margin-top:4px;letter-spacing:0.1em">STREAK</div>
      </div>
    </div>`,
  },
  {
    id: 3, title: 'Spec Badge System', xp: 80,
    description: 'Recreate 4 spec badges: each with a colored dot, text label, and distinct color.',
    targetHTML: `<div style="display:flex;flex-direction:column;gap:8px;font-family:sans-serif;width:200px">
      <div style="background:#1C1C1C;border-radius:20px;padding:8px 14px;display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:#00D4C8;display:inline-block"></span><span style="color:#00D4C8;font-size:12px;font-weight:700;font-family:monospace">CSE</span></div>
      <div style="background:#1C1C1C;border-radius:20px;padding:8px 14px;display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:#C8F135;display:inline-block"></span><span style="color:#C8F135;font-size:12px;font-weight:700;font-family:monospace">AIML</span></div>
      <div style="background:#1C1C1C;border-radius:20px;padding:8px 14px;display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:#E040FB;display:inline-block"></span><span style="color:#E040FB;font-size:12px;font-weight:700;font-family:monospace">AGENTIC AI</span></div>
      <div style="background:#1C1C1C;border-radius:20px;padding:8px 14px;display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:#FFD700;display:inline-block"></span><span style="color:#FFD700;font-size:12px;font-weight:700;font-family:monospace">QUANTUM</span></div>
    </div>`,
  },
  {
    id: 4, title: 'XP Progress Bar', xp: 70,
    description: 'A level progress bar with label, XP counter, and a gradient fill.',
    targetHTML: `<div style="background:#1C1C1C;border-radius:16px;padding:20px;width:300px;font-family:sans-serif">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="color:#888;font-size:11px;font-family:monospace;letter-spacing:0.1em">LEVEL 4</span>
        <span style="color:#C8F135;font-size:11px;font-family:monospace;font-weight:700">340 / 500 XP</span>
      </div>
      <div style="background:#2a2a2a;border-radius:999px;height:10px;overflow:hidden;margin-bottom:8px">
        <div style="background:linear-gradient(90deg,#C8F135,#00D4C8);height:100%;width:68%;border-radius:999px"></div>
      </div>
      <p style="color:#555;font-size:10px;font-family:monospace;margin:0">160 XP to Level 5</p>
    </div>`,
  },
  {
    id: 5, title: 'Notification Toast', xp: 90,
    description: 'A notification card with an icon on the left, message, and a dismiss X button.',
    targetHTML: `<div style="background:#111;border:1px solid rgba(200,241,53,0.3);border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;width:300px;font-family:sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.5)">
      <div style="width:36px;height:36px;border-radius:10px;background:rgba(200,241,53,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">⚡</div>
      <div style="flex:1">
        <div style="color:#fff;font-size:13px;font-weight:600;margin-bottom:2px">+50 XP Earned!</div>
        <div style="color:#666;font-size:11px;font-family:monospace">Won Prompt Wars duel</div>
      </div>
      <div style="color:#444;cursor:pointer;font-size:18px;line-height:1;flex-shrink:0">×</div>
    </div>`,
  },
]

// ─── AGENT ARCHITECT ─────────────────────────────────────────────────────────
export const AGENT_CHALLENGES = [
  "Design an agent that reads your email and auto-drafts replies in your writing style",
  "Design an agent that monitors AI research papers and sends you a daily 5-bullet summary",
  "Design an agent that finds open source projects matching your skills and opens relevant PRs",
  "Design an agent that generates a study plan from your syllabus and tracks daily progress",
  "Design an agent that scrapes hostel food menus and suggests the best meal option each day",
  "Design an agent that monitors HuggingFace for new models and benchmarks them automatically",
  "Design an agent that finds hackathons, registers you, and forms a team from your contacts",
  "Design an agent that reads internship listings and auto-applies based on your resume",
]

export const AGENT_TOOLS = ['web_search','email_send','email_read','calendar','file_read','file_write','code_exec','browser','slack_msg','notion_write','github_pr','form_fill']

// ─── TREND DECODE PAPERS ──────────────────────────────────────────────────────
export const FALLBACK_PAPERS = [
  {
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al. (Google Brain)',
    year: 2017,
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
    url: 'https://arxiv.org/abs/1706.03762',
    tag: 'Foundational',
  },
  {
    title: 'Language Models are Few-Shot Learners (GPT-3)',
    authors: 'Brown et al. (OpenAI)',
    year: 2020,
    abstract: 'We train GPT-3, an autoregressive language model with 175 billion parameters, and test its performance in the few-shot setting. We find that GPT-3 achieves strong performance on many NLP datasets, including translation, question-answering, and cloze tasks, often with very few examples. GPT-3 can also perform on-the-fly reasoning or domain adaptation tasks.',
    url: 'https://arxiv.org/abs/2005.14165',
    tag: 'LLM',
  },
  {
    title: 'Constitutional AI: Harmlessness from AI Feedback',
    authors: 'Bai et al. (Anthropic)',
    year: 2022,
    abstract: 'We experiment with methods for training a harmless AI assistant through self-improvement, without any human labels identifying harmful outputs. The only human oversight is provided through a list of rules or principles, and so we call the method Constitutional AI. We show that Constitutional AI produces an AI that is both non-evasive and relatively harmless.',
    url: 'https://arxiv.org/abs/2212.08073',
    tag: 'Alignment',
  },
  {
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP',
    authors: 'Lewis et al. (Meta AI)',
    year: 2020,
    abstract: 'Large pre-trained language models store factual knowledge in their parameters, but they are unable to access or update this knowledge. We present RAG models that combine parametric and non-parametric memory for language generation. RAG models retrieve documents and pass them to a generator, producing more factual and accurate responses.',
    url: 'https://arxiv.org/abs/2005.11401',
    tag: 'RAG',
  },
  {
    title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
    authors: 'Wei et al. (Google)',
    year: 2022,
    abstract: 'We explore how generating a chain of thought — a series of intermediate reasoning steps — significantly improves the ability of large language models to perform complex reasoning. We show that chain-of-thought prompting with sufficiently large language models can dramatically outperform standard prompting across diverse benchmarks.',
    url: 'https://arxiv.org/abs/2201.11903',
    tag: 'Prompting',
  },
  {
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    authors: 'Hu et al. (Microsoft)',
    year: 2021,
    abstract: 'We propose Low-Rank Adaptation (LoRA), which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture. Compared to GPT-3 fine-tuned with Adam, LoRA reduces trainable parameters by 10,000 times and GPU memory requirement by 3 times.',
    url: 'https://arxiv.org/abs/2106.09685',
    tag: 'Fine-tuning',
  },
]

// ─── DATA DETECTIVE DATASETS ─────────────────────────────────────────────────
export const DATASETS = [
  {
    title: 'CampusOS Usage by Spec',
    description: 'Which duel types are most popular across specializations?',
    columns: ['Spec', 'Prompt Wars', 'Build Race', 'Agent Design', 'Sprint', 'Total'],
    rows: [
      ['CSE', 145, 203, 87, 334, 769],
      ['AIML', 298, 134, 201, 198, 831],
      ['Agentic AI', 187, 165, 312, 134, 798],
      ['Gen AI', 312, 89, 198, 156, 755],
      ['AIDA', 156, 112, 134, 267, 669],
      ['AIDS', 201, 145, 112, 189, 647],
      ['Quantum', 134, 98, 178, 201, 611],
    ],
    xp: 80,
  },
  {
    title: 'AI Model Benchmark Scores',
    description: 'How do major AI models compare on capability benchmarks?',
    columns: ['Model', 'Company', 'Year', 'MMLU', 'HumanEval', 'Params(B)'],
    rows: [
      ['GPT-4o', 'OpenAI', 2024, 88.7, 90.2, '~200'],
      ['Claude 3.5 Sonnet', 'Anthropic', 2024, 88.3, 92.0, '~70'],
      ['Gemini Ultra', 'Google', 2024, 90.0, 74.4, '~1800'],
      ['Llama 3.1 405B', 'Meta', 2024, 85.2, 89.0, 405],
      ['Mistral Large', 'Mistral', 2024, 81.2, 45.1, '~123'],
      ['Phi-3 Mini', 'Microsoft', 2024, 68.8, 58.4, 3.8],
    ],
    xp: 75,
  },
  {
    title: 'Internship Offer Stats (CS Students)',
    description: 'Which skills led to the most internship offers this semester?',
    columns: ['Skill', 'Students', 'Offers', 'Avg Package (LPA)', 'Companies'],
    rows: [
      ['React + Node', 45, 38, 8.2, 'Walmart, Swiggy'],
      ['Python + ML', 62, 54, 12.4, 'Google, Flipkart'],
      ['DSA', 89, 71, 14.1, 'Amazon, Microsoft'],
      ['Gen AI / LLMs', 23, 22, 18.6, 'Anthropic, startups'],
      ['Data Analysis', 31, 24, 9.8, 'Deloitte, KPMG'],
      ['DevOps / Cloud', 18, 16, 11.3, 'AWS, TCS'],
    ],
    xp: 90,
  },
]

// ─── AI NEWS (curated fallback) ───────────────────────────────────────────────
export const AI_NEWS = [
  { id: 1, tag: 'Model Release', headline: 'Meta releases Llama 3.1 with 405B parameters', source: 'Meta AI Blog', summary: 'Meta\'s largest open model yet, competitive with GPT-4 on several benchmarks. Available for commercial use.', emoji: '🦙' },
  { id: 2, tag: 'Research', headline: 'AlphaFold 3 can now predict protein-DNA interactions', source: 'Nature', summary: 'Google DeepMind extends structure prediction to DNA, RNA, and small molecules — a major leap for drug discovery.', emoji: '🔬' },
  { id: 3, tag: 'Model Update', headline: 'Anthropic introduces extended thinking in Claude', source: 'Anthropic Blog', summary: 'Chain-of-thought reasoning made visible, improving performance on complex math and coding tasks significantly.', emoji: '🧠' },
  { id: 4, tag: 'Open Source', headline: 'Mistral releases Mixtral 8×22B mixture of experts', source: 'Mistral AI', summary: 'MoE architecture delivers strong performance at lower compute cost than dense models of similar capability.', emoji: '🚀' },
  { id: 5, tag: 'Tool', headline: 'GitHub Copilot now supports agentic code editing', source: 'GitHub Blog', summary: 'Copilot can now edit multiple files, run tests, and fix errors autonomously — a step toward full development agents.', emoji: '⚙️' },
  { id: 6, tag: 'Research', headline: 'Mamba: Linear-time sequence modeling with selective state spaces', source: 'ArXiv', summary: 'New architecture challenges Transformers for long-context tasks with better efficiency and competitive performance.', emoji: '📐' },
]

// ─── MOCK OPPONENT RESPONSES ──────────────────────────────────────────────────
export const MOCK_OPPONENT_PROMPTS = {
  promptWars: [
    "Explain [topic] as if you're a detective who just solved a case. Use clues, red herrings, and a dramatic reveal. Make it suspenseful and end with: 'The answer was [X] all along.'",
    "You are a disappointed professor who has seen it all. Explain [topic] in exactly 3 bullet points, sigh between each one, and end with 'This will be on the exam.'",
    "Imagine [topic] is a startup that just raised Series A. Write its product announcement, team bio, and user testimonials. Make it absurdly over-hyped.",
    "Write a WhatsApp group chat between famous scientists discussing [topic]. Include at least one forwarded message that's factually wrong, and one person who only sends voice notes.",
    "Create a step-by-step cooking recipe where every ingredient and step is actually an analogy for [topic]. Include a 'common mistakes' section.",
  ],
  agentDesign: [
    { systemPrompt: "You are an autonomous research assistant. Your core goal is to monitor, retrieve, and synthesize information from multiple sources daily.", tools: ['web_search', 'email_send', 'notion_write'], decisionLoop: "1. Check sources every 6 hours\n2. Filter by relevance score > 0.8\n3. Summarize into 5 bullets\n4. Send digest if new items found", guardrails: "Never send more than 1 email per day. Never access private accounts.", failureCondition: "If 3 consecutive fetches return no new content, pause and notify user." },
  ],
  trendDecode: [
    "• The paper introduces attention as a way for models to 'look at' all words simultaneously instead of one by one\n• This parallel processing is why modern AI can handle long texts — it doesn't forget earlier parts\n• The key insight: let the model learn which words to pay attention to, rather than hard-coding rules",
    "• Researchers found that very large models can learn tasks from just a few examples, like a person reading 3 questions before an exam\n• The bigger the model, the better it gets at this — there's a threshold above which 'emergent' abilities appear\n• This matters because it means you don't need to retrain AI for every new task if it's big enough",
  ],
}

// ─── MOCK STUDENTS (for opponent simulation) ──────────────────────────────────
export const MOCK_OPPONENTS = [
  { id: 'o1', name: 'Arjun M',   spec: 'AIML',      avatar: 'A', color: '#C8F135', xp: 920 },
  { id: 'o2', name: 'Priya K',   spec: 'Gen AI',    avatar: 'P', color: '#E040FB', xp: 780 },
  { id: 'o3', name: 'Karthik R', spec: 'CSE',       avatar: 'K', color: '#00D4C8', xp: 1100 },
  { id: 'o4', name: 'Neha S',    spec: 'AIDA',      avatar: 'N', color: '#4CAF50', xp: 650 },
  { id: 'o5', name: 'Vijay P',   spec: 'Agentic AI',avatar: 'V', color: '#FF6B00', xp: 560 },
  { id: 'o6', name: 'Divya L',   spec: 'AIDS',      avatar: 'D', color: '#FF4444', xp: 870 },
  { id: 'o7', name: 'Rahul T',   spec: 'Quantum',   avatar: 'R', color: '#8B5CF6', xp: 430 },
  { id: 'o8', name: 'Ananya B',  spec: 'AIML',      avatar: 'A', color: '#C8F135', xp: 990 },
]

// Pre-populated voting queue (mock duels waiting for student votes)
export const INITIAL_VOTING_QUEUE = [
  {
    id: 'vq1', type: 'Prompt Wars',
    challenge: 'Make Claude explain recursion by telling a story about a student who keeps asking their senior the same question',
    playerA: { name: 'Arjun M', spec: 'AIML', avatar: 'A', color: '#C8F135' },
    playerB: { name: 'Priya K', spec: 'Gen AI', avatar: 'P', color: '#E040FB' },
    outputA: "So Arjun walks up to his senior: 'How do I understand recursion?' The senior says: 'First understand recursion.' Arjun stares. Walks away. Comes back next day: 'But HOW?' Senior: 'Have you understood recursion yet?' This loop continues until finally — day 7 — Arjun has a base case: he understands it just enough to stop asking. That's recursion. A function calling itself until it hits a condition where it doesn't need to anymore.",
    outputB: "Riya asks Priya what recursion is. Priya says: 'Ask Deepa.' Deepa says: 'Ask Meera.' Meera actually knows, so she explains it. Each person who didn't know passed the question up the chain. Each answer came back down in reverse. The key: Meera was the BASE CASE. Without her, everyone would be asking forever — a stack overflow of confused second-years.",
    timestamp: Date.now() - 600000,
  },
  {
    id: 'vq2', type: 'Build Race',
    challenge: 'Glassmorphism Profile Card',
    playerA: { name: 'Karthik R', spec: 'CSE', avatar: 'K', color: '#00D4C8' },
    playerB: { name: 'Neha S', spec: 'AIDA', avatar: 'N', color: '#4CAF50' },
    outputA: `<div style="width:260px;padding:20px;border-radius:16px;background:rgba(28,28,28,0.95);border:1px solid rgba(0,212,200,0.4);font-family:sans-serif;text-align:center"><div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#00D4C8,#C8F135);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#000">K</div><div style="color:#fff;font-size:16px;font-weight:bold;margin-bottom:4px">Karthik R</div><div style="color:#888;font-size:11px;margin-bottom:14px;font-family:monospace">CSE · 1100 XP</div><div style="display:flex;gap:6px;justify-content:center"><span style="background:#00D4C8;color:#000;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:bold">DSA</span><span style="border:1px solid #00D4C8;color:#00D4C8;padding:3px 10px;border-radius:20px;font-size:10px">Systems</span></div></div>`,
    outputB: `<div style="width:260px;padding:20px;border-radius:16px;background:#111;border:1px solid rgba(76,175,80,0.4);font-family:sans-serif;text-align:center;box-shadow:0 0 20px rgba(76,175,80,0.15)"><div style="width:56px;height:56px;border-radius:50%;background:#4CAF50;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff">N</div><div style="color:#fff;font-size:16px;font-weight:bold;margin-bottom:4px">Neha S</div><div style="color:#666;font-size:11px;margin-bottom:14px;font-family:monospace">AIDA · 650 XP</div><div style="display:flex;gap:6px;justify-content:center"><span style="background:#4CAF50;color:#000;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:bold">Data</span><span style="border:1px solid #4CAF50;color:#4CAF50;padding:3px 10px;border-radius:20px;font-size:10px">Analytics</span></div></div>`,
    isHTMLOutput: true,
    timestamp: Date.now() - 1200000,
  },
]
