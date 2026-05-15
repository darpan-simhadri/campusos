// Problem bank — MCQ + short-answer, no code execution required.
// Each problem has: id, title, category, difficulty, xp, type, question, options[], answer (index or string), explanation

export const PROBLEMS = [
  // ── DSA ───────────────────────────────────────────────────────────────
  {
    id: 'dsa_01', category: 'DSA', difficulty: 'Easy', xp: 30,
    title: 'Big-O of Binary Search',
    question: 'What is the time complexity of Binary Search on a sorted array of n elements?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    answer: 1,
    explanation: 'Binary search halves the search space each step, so it runs in O(log n) time.',
  },
  {
    id: 'dsa_02', category: 'DSA', difficulty: 'Easy', xp: 30,
    title: 'Stack vs Queue',
    question: 'Which data structure follows LIFO (Last In, First Out) order?',
    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
    answer: 1,
    explanation: 'A Stack follows LIFO — the last element pushed is the first one popped.',
  },
  {
    id: 'dsa_03', category: 'DSA', difficulty: 'Medium', xp: 50,
    title: 'Merge Sort Complexity',
    question: 'What is the worst-case time complexity of Merge Sort?',
    options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
    answer: 1,
    explanation: 'Merge Sort always splits and merges, giving O(n log n) in all cases.',
  },
  {
    id: 'dsa_04', category: 'DSA', difficulty: 'Medium', xp: 50,
    title: 'Graph BFS vs DFS',
    question: 'Which algorithm finds the shortest path in an unweighted graph?',
    options: ['DFS', 'BFS', 'Dijkstra', 'Bellman-Ford'],
    answer: 1,
    explanation: 'BFS explores nodes level by level, guaranteeing the shortest path in unweighted graphs.',
  },
  {
    id: 'dsa_05', category: 'DSA', difficulty: 'Hard', xp: 80,
    title: 'Dynamic Programming',
    question: 'Which technique does Dynamic Programming use to avoid recomputing subproblems?',
    options: ['Recursion', 'Memoization / Tabulation', 'Greedy Choice', 'Divide and Conquer'],
    answer: 1,
    explanation: 'DP uses memoization (top-down) or tabulation (bottom-up) to store and reuse subproblem results.',
  },
  {
    id: 'dsa_06', category: 'DSA', difficulty: 'Easy', xp: 30,
    title: 'Linked List Insertion',
    question: 'What is the time complexity of inserting a node at the beginning of a singly linked list?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    answer: 2,
    explanation: 'Inserting at the head only requires updating one pointer — O(1) regardless of list size.',
  },
  {
    id: 'dsa_07', category: 'DSA', difficulty: 'Medium', xp: 50,
    title: 'Hash Table Collision',
    question: 'Which method resolves hash collisions by storing multiple elements in the same bucket via a linked list?',
    options: ['Open Addressing', 'Linear Probing', 'Chaining', 'Double Hashing'],
    answer: 2,
    explanation: 'Chaining uses a linked list at each bucket to store multiple elements that hash to the same index.',
  },

  // ── System Design ─────────────────────────────────────────────────────
  {
    id: 'sd_01', category: 'System Design', difficulty: 'Medium', xp: 60,
    title: 'CAP Theorem',
    question: 'According to the CAP theorem, a distributed system can guarantee at most how many of the three properties simultaneously?',
    options: ['1', '2', '3', 'All 3 with eventual consistency'],
    answer: 1,
    explanation: 'CAP theorem states you can only guarantee 2 of Consistency, Availability, and Partition Tolerance at once.',
  },
  {
    id: 'sd_02', category: 'System Design', difficulty: 'Medium', xp: 60,
    title: 'Load Balancer',
    question: 'Which load balancing algorithm distributes requests to the server with the fewest current connections?',
    options: ['Round Robin', 'Least Connections', 'IP Hash', 'Random'],
    answer: 1,
    explanation: 'Least Connections sends new requests to whichever server currently handles the fewest active connections.',
  },
  {
    id: 'sd_03', category: 'System Design', difficulty: 'Hard', xp: 80,
    title: 'Database Sharding',
    question: 'Sharding in databases refers to:',
    options: [
      'Creating read replicas for faster reads',
      'Partitioning data horizontally across multiple servers',
      'Encrypting sensitive columns',
      'Backing up data to multiple regions',
    ],
    answer: 1,
    explanation: 'Sharding splits rows of a table across different database instances (horizontal partitioning) for scalability.',
  },

  // ── React / Frontend ──────────────────────────────────────────────────
  {
    id: 'react_01', category: 'React', difficulty: 'Easy', xp: 30,
    title: 'React useState',
    question: 'What does calling setState() in React trigger?',
    options: ['A full page reload', 'A re-render of the component', 'A network request', 'Nothing'],
    answer: 1,
    explanation: 'setState schedules a re-render of the component and its children with the new state value.',
  },
  {
    id: 'react_02', category: 'React', difficulty: 'Easy', xp: 30,
    title: 'useEffect Dependencies',
    question: 'What happens when you pass an empty array [] as the dependency array to useEffect?',
    options: [
      'It runs on every render',
      'It runs only once after the initial render',
      'It never runs',
      'It runs when the component unmounts',
    ],
    answer: 1,
    explanation: 'An empty dependency array means the effect runs once after mount, similar to componentDidMount.',
  },
  {
    id: 'react_03', category: 'React', difficulty: 'Medium', xp: 50,
    title: 'Virtual DOM',
    question: 'What is the main purpose of React\'s Virtual DOM?',
    options: [
      'To directly manipulate the browser DOM faster',
      'To batch and minimize actual DOM updates for performance',
      'To store component state',
      'To handle routing between pages',
    ],
    answer: 1,
    explanation: 'The Virtual DOM lets React diff changes and apply only necessary updates to the real DOM, reducing repaints.',
  },
  {
    id: 'react_04', category: 'React', difficulty: 'Medium', xp: 50,
    title: 'React Keys',
    question: 'Why should you provide a unique "key" prop when rendering a list in React?',
    options: [
      'It is required by JavaScript syntax',
      'It helps React identify which items changed, added, or removed',
      'It improves CSS styling',
      'It enables server-side rendering',
    ],
    answer: 1,
    explanation: 'Keys let React efficiently reconcile the list by tracking each element\'s identity across re-renders.',
  },

  // ── OS ────────────────────────────────────────────────────────────────
  {
    id: 'os_01', category: 'OS', difficulty: 'Easy', xp: 30,
    title: 'Process vs Thread',
    question: 'What is the key difference between a process and a thread?',
    options: [
      'Threads have their own memory space; processes share memory',
      'Processes have their own memory space; threads share the same process memory',
      'There is no difference',
      'Threads are slower than processes',
    ],
    answer: 1,
    explanation: 'Processes are isolated with their own address space. Threads within a process share memory and resources.',
  },
  {
    id: 'os_02', category: 'OS', difficulty: 'Medium', xp: 50,
    title: 'Deadlock Condition',
    question: 'Which of these is NOT one of the four necessary conditions for a deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption', 'Circular Wait'],
    answer: 2,
    explanation: 'The four conditions are Mutual Exclusion, Hold and Wait, NO Preemption, and Circular Wait. Preemption prevents deadlock.',
  },
  {
    id: 'os_03', category: 'OS', difficulty: 'Medium', xp: 50,
    title: 'Page Replacement',
    question: 'Which page replacement algorithm replaces the page that will not be used for the longest time in the future?',
    options: ['LRU', 'FIFO', 'Optimal (OPT)', 'Clock Algorithm'],
    answer: 2,
    explanation: 'The Optimal algorithm knows future references, making it theoretically best but impossible to implement in practice.',
  },

  // ── DBMS ─────────────────────────────────────────────────────────────
  {
    id: 'db_01', category: 'DBMS', difficulty: 'Easy', xp: 30,
    title: 'Primary Key',
    question: 'Which constraint ensures a column has no duplicate and no NULL values?',
    options: ['UNIQUE', 'NOT NULL', 'PRIMARY KEY', 'FOREIGN KEY'],
    answer: 2,
    explanation: 'PRIMARY KEY = UNIQUE + NOT NULL. It uniquely identifies each row and cannot be null.',
  },
  {
    id: 'db_02', category: 'DBMS', difficulty: 'Medium', xp: 50,
    title: 'SQL JOIN Types',
    question: 'Which SQL JOIN returns all rows from both tables, including unmatched rows (filled with NULLs)?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
    answer: 3,
    explanation: 'FULL OUTER JOIN returns all rows from both tables. Unmatched rows from either side get NULLs for missing columns.',
  },
  {
    id: 'db_03', category: 'DBMS', difficulty: 'Medium', xp: 50,
    title: 'ACID Properties',
    question: 'The "I" in ACID stands for:',
    options: ['Integration', 'Isolation', 'Integrity', 'Idempotency'],
    answer: 1,
    explanation: 'ACID = Atomicity, Consistency, Isolation, Durability. Isolation ensures concurrent transactions don\'t interfere.',
  },

  // ── AI / ML ───────────────────────────────────────────────────────────
  {
    id: 'ai_01', category: 'AI/ML', difficulty: 'Easy', xp: 30,
    title: 'Overfitting',
    question: 'A model that performs very well on training data but poorly on new test data is said to be:',
    options: ['Underfitting', 'Overfitting', 'Generalizing', 'Regularizing'],
    answer: 1,
    explanation: 'Overfitting means the model memorized training data rather than learning generalizable patterns.',
  },
  {
    id: 'ai_02', category: 'AI/ML', difficulty: 'Medium', xp: 50,
    title: 'Activation Function',
    question: 'Which activation function outputs values between 0 and 1 and is commonly used in binary classification output layers?',
    options: ['ReLU', 'Tanh', 'Sigmoid', 'Softmax'],
    answer: 2,
    explanation: 'Sigmoid squashes output to (0,1), making it ideal for binary classification probabilities.',
  },
  {
    id: 'ai_03', category: 'AI/ML', difficulty: 'Hard', xp: 80,
    title: 'Transformer Attention',
    question: 'In the Transformer architecture, what does "self-attention" allow a token to do?',
    options: [
      'Predict the next token in the sequence',
      'Attend to all other positions in the same sequence when computing its representation',
      'Compress the sequence into a fixed-size vector',
      'Apply dropout regularization',
    ],
    answer: 1,
    explanation: 'Self-attention lets each token weigh the importance of every other token in the sequence when building its representation.',
  },
]

export const getRandomProblem = (category = null) => {
  const pool = category ? PROBLEMS.filter(p => p.category === category) : PROBLEMS
  return pool[Math.floor(Math.random() * pool.length)]
}

export const getDailyProblem = () => {
  const dayIndex = Math.floor(Date.now() / 86400000) % PROBLEMS.length
  return PROBLEMS[dayIndex]
}

export const CATEGORIES = [...new Set(PROBLEMS.map(p => p.category))]

export const DIFFICULTY_XP = { Easy: 30, Medium: 50, Hard: 80 }
