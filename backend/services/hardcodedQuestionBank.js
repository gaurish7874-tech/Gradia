const SUBJECT_CONCEPTS = {
  Mathematics: [
    { term: 'Prime number', fact: 'A number that has exactly two positive divisors: 1 and itself.' },
    { term: 'Mean', fact: 'The average found by dividing the sum by the count.' },
    { term: 'Median', fact: 'The middle value in an ordered list.' },
    { term: 'Derivative', fact: 'The instantaneous rate of change of a function.' },
    { term: 'Integral', fact: 'A value that represents accumulation, often area under a curve.' },
    { term: 'Matrix determinant', fact: 'A scalar value computed from a square matrix.' },
    { term: 'Pythagorean theorem', fact: 'In a right triangle, a^2 + b^2 = c^2.' },
    { term: 'Probability', fact: 'The ratio of favorable outcomes to total possible outcomes.' },
    { term: 'Factorial', fact: 'The product of all positive integers up to n, written n!.' },
    { term: 'Slope', fact: 'The change in y divided by the change in x.' },
  ],
  Science: [
    { term: 'Photosynthesis', fact: 'Plants use sunlight, water, and carbon dioxide to make glucose and oxygen.' },
    { term: 'Mitosis', fact: 'Cell division that produces two genetically identical daughter cells.' },
    { term: 'Atom', fact: 'The smallest unit of an element that retains chemical properties.' },
    { term: 'Gravity', fact: 'The force that attracts objects with mass toward each other.' },
    { term: 'Newton second law', fact: 'Force equals mass multiplied by acceleration (F = ma).' },
    { term: 'Evaporation', fact: 'The process where liquid changes into gas at the surface.' },
    { term: 'Condensation', fact: 'The process where gas changes into liquid.' },
    { term: 'DNA', fact: 'The molecule that stores genetic instructions in living organisms.' },
    { term: 'Ecosystem', fact: 'A community of organisms interacting with their physical environment.' },
    { term: 'pH scale', fact: 'A scale used to measure how acidic or basic a substance is.' },
  ],
  History: [
    { term: 'Renaissance', fact: 'A period of cultural revival in Europe after the Middle Ages.' },
    { term: 'Industrial Revolution', fact: 'The shift from hand production to machines in the 18th and 19th centuries.' },
    { term: 'Magna Carta', fact: 'A 1215 charter that limited the power of the English king.' },
    { term: 'World War I', fact: 'A global war that began in 1914.' },
    { term: 'World War II', fact: 'A global war that began in 1939.' },
    { term: 'Cold War', fact: 'A period of political tension between the US and USSR after World War II.' },
    { term: 'French Revolution', fact: 'A major social and political upheaval in France that began in 1789.' },
    { term: 'Fall of Western Roman Empire', fact: 'Conventionally dated to 476 CE.' },
    { term: 'Fall of Berlin Wall', fact: 'A symbolic Cold War event that happened in 1989.' },
    { term: 'Printing press', fact: 'A technology popularized by Gutenberg in the 15th century.' },
  ],
  Geography: [
    { term: 'Equator', fact: 'An imaginary line at 0 degrees latitude dividing Earth into hemispheres.' },
    { term: 'Prime Meridian', fact: 'The reference line at 0 degrees longitude.' },
    { term: 'Latitude', fact: 'Angular distance north or south of the Equator.' },
    { term: 'Longitude', fact: 'Angular distance east or west of the Prime Meridian.' },
    { term: 'Delta', fact: 'Landform created by sediment deposits at a river mouth.' },
    { term: 'Archipelago', fact: 'A group or chain of islands.' },
    { term: 'Peninsula', fact: 'Land surrounded by water on three sides.' },
    { term: 'Monsoon', fact: 'A seasonal wind pattern often associated with heavy rainfall.' },
    { term: 'Tundra', fact: 'A cold biome with low vegetation and little tree growth.' },
    { term: 'Plate tectonics', fact: 'Theory that Earth lithosphere is divided into moving plates.' },
  ],
  Programming: [
    { term: 'Variable', fact: 'A named storage location for data values in code.' },
    { term: 'Loop', fact: 'A control structure that repeats a block of code.' },
    { term: 'Function', fact: 'A reusable block of code designed to perform a task.' },
    { term: 'Array', fact: 'An ordered collection of values accessed by index.' },
    { term: 'Object', fact: 'A data structure that stores key-value pairs.' },
    { term: 'Boolean', fact: 'A data type that has two values: true or false.' },
    { term: 'Compiler', fact: 'A program that translates source code to machine code before execution.' },
    { term: 'Interpreter', fact: 'A program that executes source code line by line.' },
    { term: 'API', fact: 'A defined interface that allows software systems to communicate.' },
    { term: 'Recursion', fact: 'A technique where a function calls itself with a base case.' },
  ],
  'Data Structures': [
    { term: 'Stack', fact: 'A linear structure that follows Last In, First Out (LIFO).' },
    { term: 'Queue', fact: 'A linear structure that follows First In, First Out (FIFO).' },
    { term: 'Linked list', fact: 'A sequence of nodes connected through references.' },
    { term: 'Binary tree', fact: 'A hierarchical structure where each node has at most two children.' },
    { term: 'Hash table', fact: 'A structure that maps keys to values using a hash function.' },
    { term: 'Heap', fact: 'A complete binary tree that satisfies a heap-order property.' },
    { term: 'Graph', fact: 'A structure made of vertices connected by edges.' },
    { term: 'Trie', fact: 'A tree-based structure optimized for prefix searching in strings.' },
    { term: 'Deque', fact: 'A structure that supports insertion and deletion at both ends.' },
    { term: 'Balanced BST', fact: 'A binary search tree designed to maintain near-logarithmic height.' },
  ],
  Algorithms: [
    { term: 'Binary search', fact: 'A search method for sorted data that halves the search space each step.' },
    { term: 'Merge sort', fact: 'A divide-and-conquer sorting algorithm with O(n log n) time complexity.' },
    { term: 'Quick sort', fact: 'A sorting algorithm that partitions data around a pivot.' },
    { term: 'Breadth-first search', fact: 'A graph traversal that explores neighbors level by level.' },
    { term: 'Depth-first search', fact: 'A graph traversal that explores as deep as possible before backtracking.' },
    { term: 'Dynamic programming', fact: 'A method that stores and reuses solutions to overlapping subproblems.' },
    { term: 'Greedy algorithm', fact: 'An approach that chooses the locally optimal option at each step.' },
    { term: 'Dijkstra algorithm', fact: 'An algorithm for shortest paths in weighted graphs with non-negative edges.' },
    { term: 'Big O notation', fact: 'A notation describing upper-bound growth of runtime or space.' },
    { term: 'Two-pointer technique', fact: 'A pattern using two indices that move through a data structure.' },
  ],
  English: [
    { term: 'Noun', fact: 'A word that names a person, place, thing, or idea.' },
    { term: 'Verb', fact: 'A word that expresses action or a state of being.' },
    { term: 'Adjective', fact: 'A word that describes or modifies a noun.' },
    { term: 'Adverb', fact: 'A word that modifies a verb, adjective, or another adverb.' },
    { term: 'Pronoun', fact: 'A word used in place of a noun.' },
    { term: 'Subject-verb agreement', fact: 'A grammar rule where the verb form matches the subject number.' },
    { term: 'Past tense', fact: 'A verb form used to describe actions completed in the past.' },
    { term: 'Synonym', fact: 'A word with a similar meaning to another word.' },
    { term: 'Antonym', fact: 'A word with the opposite meaning of another word.' },
    { term: 'Thesis statement', fact: 'The central claim or main idea of an essay.' },
  ],
};

const SUBJECT_ALIASES = {
  mathematics: 'Mathematics',
  math: 'Mathematics',
  science: 'Science',
  history: 'History',
  geography: 'Geography',
  programming: 'Programming',
  'data structures': 'Data Structures',
  datastructures: 'Data Structures',
  algorithms: 'Algorithms',
  english: 'English',
};

const QUESTIONS_PER_SUBJECT = 15;

function rotate(arr, by) {
  const len = arr.length;
  const shift = ((by % len) + len) % len;
  return arr.slice(shift).concat(arr.slice(0, shift));
}

function diffA(index) {
  if (index < 4) return 'easy';
  if (index < 7) return 'medium';
  return 'hard';
}

function diffB(index) {
  if (index < 3) return 'easy';
  if (index < 7) return 'medium';
  return 'hard';
}

function buildQuestionsForSubject(subject, concepts) {
  const questions = [];
  for (let i = 0; i < concepts.length; i += 1) {
    const current = concepts[i];
    const d1 = concepts[(i + 1) % concepts.length];
    const d2 = concepts[(i + 3) % concepts.length];
    const d3 = concepts[(i + 5) % concepts.length];

    const definitionQuestionOptions = rotate(
      [current.fact, d1.fact, d2.fact, d3.fact],
      i % 4
    );
    questions.push({
      topic: subject,
      difficulty: diffA(i),
      questionText: `What best describes "${current.term}"?`,
      options: definitionQuestionOptions,
      correctAnswer: current.fact,
    });

    const termQuestionOptions = rotate(
      [current.term, d1.term, d2.term, d3.term],
      (i + 2) % 4
    );
    questions.push({
      topic: subject,
      difficulty: diffB(i),
      questionText: `Which term matches this definition: "${current.fact}"?`,
      options: termQuestionOptions,
      correctAnswer: current.term,
    });
  }
  return questions;
}

const SUBJECT_QUESTION_BANK = Object.fromEntries(
  Object.entries(SUBJECT_CONCEPTS).map(([subject, concepts]) => [
    subject,
    buildQuestionsForSubject(subject, concepts).slice(0, QUESTIONS_PER_SUBJECT),
  ])
);

export function resolveSubject(input) {
  const key = String(input || '').trim().toLowerCase();
  return SUBJECT_ALIASES[key] || '';
}

export function getHardcodedQuestionsForSubject(subject) {
  return SUBJECT_QUESTION_BANK[subject]?.map((q) => ({ ...q })) || [];
}
