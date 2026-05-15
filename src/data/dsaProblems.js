export const DSA_PROBLEMS = [
  {
    id: 'two_sum', title: 'Two Sum', difficulty: 'Easy', xpReward: 50,
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10^4', '-10^9 ≤ nums[i] ≤ 10^9', 'Only one valid answer exists'],
    functionName: 'twoSum',
    testCases: [
      { args: [[2,7,11,15], 9], expected: [0,1] },
      { args: [[3,2,4], 6],     expected: [1,2] },
      { args: [[3,3], 6],       expected: [0,1] },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Your solution here\n  \n}`,
      python: `def twoSum(nums, target):\n    # Your solution here\n    pass`,
    },
  },
  {
    id: 'max_profit', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', xpReward: 50,
    description: 'Given an array `prices` where `prices[i]` is the price on day i, find the maximum profit you can achieve by buying on one day and selling on a later day. Return 0 if no profit is possible.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy at 1, sell at 6' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'No profitable trade' },
    ],
    constraints: ['1 ≤ prices.length ≤ 10^5', '0 ≤ prices[i] ≤ 10^4'],
    functionName: 'maxProfit',
    testCases: [
      { args: [[7,1,5,3,6,4]],   expected: 5 },
      { args: [[7,6,4,3,1]],     expected: 0 },
      { args: [[1,2]],           expected: 1 },
      { args: [[2,4,1]],         expected: 2 },
    ],
    starterCode: {
      javascript: `function maxProfit(prices) {\n  // Your solution here\n  \n}`,
      python: `def maxProfit(prices):\n    # Your solution here\n    pass`,
    },
  },
  {
    id: 'max_subarray', title: 'Maximum Subarray', difficulty: 'Medium', xpReward: 100,
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum. (Kadane\'s Algorithm)',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6' },
      { input: 'nums = [1]', output: '1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10^5', '-10^4 ≤ nums[i] ≤ 10^4'],
    functionName: 'maxSubArray',
    testCases: [
      { args: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
      { args: [[1]],                      expected: 1 },
      { args: [[5,4,-1,7,8]],            expected: 23 },
      { args: [[-1,-2,-3]],              expected: -1 },
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n  // Your solution here\n  \n}`,
      python: `def maxSubArray(nums):\n    # Your solution here\n    pass`,
    },
  },
  {
    id: 'climbing_stairs', title: 'Climbing Stairs', difficulty: 'Easy', xpReward: 50,
    description: 'You are climbing a staircase with `n` steps. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, or 2+1' },
    ],
    constraints: ['1 ≤ n ≤ 45'],
    functionName: 'climbStairs',
    testCases: [
      { args: [1], expected: 1 },
      { args: [2], expected: 2 },
      { args: [3], expected: 3 },
      { args: [5], expected: 8 },
      { args: [10], expected: 89 },
    ],
    starterCode: {
      javascript: `function climbStairs(n) {\n  // Your solution here\n  \n}`,
      python: `def climbStairs(n):\n    # Your solution here\n    pass`,
    },
  },
  {
    id: 'palindrome', title: 'Valid Palindrome', difficulty: 'Easy', xpReward: 50,
    description: 'A phrase is a palindrome if it reads the same forward and backward after converting to lowercase and removing non-alphanumeric characters. Given a string `s`, return true if it is a palindrome.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 2*10^5', 's consists of printable ASCII characters'],
    functionName: 'isPalindrome',
    testCases: [
      { args: ['A man, a plan, a canal: Panama'], expected: true },
      { args: ['race a car'], expected: false },
      { args: [' '], expected: true },
      { args: ['Was it a car or a cat I saw?'], expected: true },
    ],
    starterCode: {
      javascript: `function isPalindrome(s) {\n  // Your solution here\n  \n}`,
      python: `def isPalindrome(s):\n    # Your solution here\n    pass`,
    },
  },
  {
    id: 'fibonacci', title: 'Fibonacci Number', difficulty: 'Easy', xpReward: 50,
    description: 'The Fibonacci numbers form the sequence: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2). Given n, calculate F(n).',
    examples: [
      { input: 'n = 4', output: '3', explanation: 'F(4) = F(3)+F(2) = 2+1 = 3' },
      { input: 'n = 10', output: '55' },
    ],
    constraints: ['0 ≤ n ≤ 30'],
    functionName: 'fib',
    testCases: [
      { args: [0], expected: 0 },
      { args: [1], expected: 1 },
      { args: [4], expected: 3 },
      { args: [10], expected: 55 },
    ],
    starterCode: {
      javascript: `function fib(n) {\n  // Your solution here\n  \n}`,
      python: `def fib(n):\n    # Your solution here\n    pass`,
    },
  },
  {
    id: 'reverse_string', title: 'Reverse String', difficulty: 'Easy', xpReward: 50,
    description: 'Write a function that reverses a string. Return the reversed string.',
    examples: [
      { input: 's = "hello"', output: '"olleh"' },
      { input: 's = "Hannah"', output: '"hannaH"' },
    ],
    constraints: ['1 ≤ s.length ≤ 10^5'],
    functionName: 'reverseString',
    testCases: [
      { args: ['hello'],  expected: 'olleh' },
      { args: ['Hannah'], expected: 'hannaH' },
      { args: [''],       expected: '' },
      { args: ['abcd'],   expected: 'dcba' },
    ],
    starterCode: {
      javascript: `function reverseString(s) {\n  // Your solution here\n  \n}`,
      python: `def reverseString(s):\n    # Your solution here\n    pass`,
    },
  },
  {
    id: 'contains_duplicate', title: 'Contains Duplicate', difficulty: 'Easy', xpReward: 50,
    description: 'Given an integer array `nums`, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10^5'],
    functionName: 'containsDuplicate',
    testCases: [
      { args: [[1,2,3,1]], expected: true },
      { args: [[1,2,3,4]], expected: false },
      { args: [[1,1,1,3,3,4,3,2,4,2]], expected: true },
    ],
    starterCode: {
      javascript: `function containsDuplicate(nums) {\n  // Your solution here\n  \n}`,
      python: `def containsDuplicate(nums):\n    # Your solution here\n    pass`,
    },
  },
  {
    id: 'merge_sorted', title: 'Merge Sorted Arrays', difficulty: 'Medium', xpReward: 100,
    description: 'Given two sorted arrays `nums1` and `nums2`, return a new sorted array containing all elements from both arrays.',
    examples: [
      { input: 'nums1 = [1,3,5], nums2 = [2,4,6]', output: '[1,2,3,4,5,6]' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '[1,2,3,4]' },
    ],
    constraints: ['0 ≤ nums1.length, nums2.length ≤ 10^4'],
    functionName: 'mergeSorted',
    testCases: [
      { args: [[1,3,5],[2,4,6]],  expected: [1,2,3,4,5,6] },
      { args: [[1,2],[3,4]],      expected: [1,2,3,4] },
      { args: [[],[1]],           expected: [1] },
      { args: [[1,3],[2]],        expected: [1,2,3] },
    ],
    starterCode: {
      javascript: `function mergeSorted(nums1, nums2) {\n  // Your solution here\n  \n}`,
      python: `def mergeSorted(nums1, nums2):\n    # Your solution here\n    pass`,
    },
  },
  {
    id: 'count_vowels', title: 'Count Vowels', difficulty: 'Easy', xpReward: 50,
    description: 'Given a string `s`, return the number of vowels (a, e, i, o, u — both upper and lower case) in the string.',
    examples: [
      { input: 's = "Hello World"', output: '3' },
      { input: 's = "AEIOU"', output: '5' },
    ],
    constraints: ['0 ≤ s.length ≤ 10^5'],
    functionName: 'countVowels',
    testCases: [
      { args: ['Hello World'], expected: 3 },
      { args: ['AEIOU'],       expected: 5 },
      { args: ['bcdfg'],       expected: 0 },
      { args: ['CampusOS'],    expected: 3 },
    ],
    starterCode: {
      javascript: `function countVowels(s) {\n  // Your solution here\n  \n}`,
      python: `def countVowels(s):\n    # Your solution here\n    pass`,
    },
  },
]

export const getRandomDSAProblem = (difficulty = null) => {
  const pool = difficulty ? DSA_PROBLEMS.filter(p => p.difficulty === difficulty) : DSA_PROBLEMS
  return pool[Math.floor(Math.random() * pool.length)]
}

export const SPRINT_QUESTIONS = [
  { q: 'What is the time complexity of binary search?',               a: 'O(log n)' },
  { q: 'Which data structure uses LIFO?',                            a: 'Stack' },
  { q: 'Which data structure uses FIFO?',                            a: 'Queue' },
  { q: 'What does RAM stand for?',                                   a: 'Random Access Memory' },
  { q: 'What is the output of 2 ** 10 in Python?',                  a: '1024' },
  { q: 'Which sorting algorithm has O(n log n) average?',            a: 'Merge Sort' },
  { q: 'What does SQL stand for?',                                   a: 'Structured Query Language' },
  { q: 'What is the time complexity of accessing a hash map?',       a: 'O(1)' },
  { q: 'In Big-O, O(1) means?',                                      a: 'Constant time' },
  { q: 'What is a linked list node made of?',                        a: 'Data and pointer' },
  { q: 'What does API stand for?',                                   a: 'Application Programming Interface' },
  { q: 'What does HTTP stand for?',                                   a: 'HyperText Transfer Protocol' },
  { q: 'Which HTTP method is used to fetch data?',                   a: 'GET' },
  { q: 'What is the output of typeof null in JS?',                   a: 'object' },
  { q: 'What is a closure in JavaScript?',                           a: 'Function with access to outer scope' },
  { q: 'What does DOM stand for?',                                   a: 'Document Object Model' },
  { q: 'Which hook manages state in React?',                         a: 'useState' },
  { q: 'What is JSX?',                                               a: 'JavaScript XML' },
  { q: 'What does CSS stand for?',                                   a: 'Cascading Style Sheets' },
  { q: 'What is the result of 0.1 + 0.2 === 0.3 in JS?',            a: 'false' },
  { q: 'What does OOP stand for?',                                   a: 'Object Oriented Programming' },
  { q: 'What is recursion?',                                         a: 'Function calling itself' },
  { q: 'What is the base case in recursion?',                        a: 'The stopping condition' },
  { q: 'What is a primary key in a database?',                       a: 'Unique identifier for a record' },
  { q: 'What does DBMS stand for?',                                  a: 'Database Management System' },
  { q: 'Which OS scheduling algorithm is simplest?',                 a: 'FCFS' },
  { q: 'What is a deadlock?',                                        a: 'Processes waiting for each other' },
  { q: 'What does Git commit do?',                                   a: 'Saves staged changes' },
  { q: 'What is a merge conflict?',                                  a: 'Conflicting changes in same file' },
  { q: 'What is the cloud?',                                         a: 'Remote servers on the internet' },
]
