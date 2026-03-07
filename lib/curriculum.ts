export type LevelKey = "beginner" | "intermediate" | "advanced";

export type VocabularyItem = {
  word: string;
  meaning: string;
  example: string;
};

export type DialogueLine = {
  speaker: string;
  line: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type PracticePrompt = {
  id: string;
  sentence: string;
  answer: string;
  hint: string;
};

export type Lesson = {
  slug: string;
  title: string;
  goal: string;
  americanTip: string;
  vocabulary: VocabularyItem[];
  dialogue: DialogueLine[];
  quiz: QuizQuestion[];
  practice: PracticePrompt[];
};

export type Level = {
  key: LevelKey;
  title: string;
  description: string;
  cefrBand: string;
  lessons: Lesson[];
};

export const curriculum: Level[] = [
  {
    key: "beginner",
    title: "Beginner",
    description: "Build confidence with everyday U.S. English.",
    cefrBand: "A1-A2",
    lessons: [
      {
        slug: "greetings-and-introductions",
        title: "Greetings and Introductions",
        goal: "Introduce yourself politely in American English.",
        americanTip:
          'In the U.S., people often say "Hi" or "Hey" in casual settings and "Nice to meet you" after introductions.',
        vocabulary: [
          {
            word: "first name",
            meaning: "your given name",
            example: "My first name is Ana.",
          },
          {
            word: "last name",
            meaning: "your family name",
            example: "My last name is Gomez.",
          },
          {
            word: "nickname",
            meaning: "an informal name",
            example: 'People call me "AJ."',
          },
        ],
        dialogue: [
          { speaker: "Mia", line: "Hi, I am Mia. What is your name?" },
          { speaker: "Ken", line: "I am Ken. Nice to meet you." },
          { speaker: "Mia", line: "Nice to meet you too. Where are you from?" },
          { speaker: "Ken", line: "I am from Japan, but I live in Seattle now." },
        ],
        quiz: [
          {
            id: "b1-q1",
            prompt: 'Which phrase is most natural in American English after meeting someone?',
            options: ["Good morning forever", "Nice to meet you", "Thank you for your lunch", "No problem then"],
            answerIndex: 1,
            explanation: '"Nice to meet you" is the common phrase after an introduction.',
          },
          {
            id: "b1-q2",
            prompt: 'Choose the correct sentence: "I ___ from Brazil."',
            options: ["am", "is", "are", "be"],
            answerIndex: 0,
            explanation: "Use 'am' with 'I'.",
          },
        ],
        practice: [
          {
            id: "b1-p1",
            sentence: "Complete: Hi, ___ name is Sofia.",
            answer: "my",
            hint: 'Use a possessive pronoun before "name".',
          },
          {
            id: "b1-p2",
            sentence: "Complete: Nice to meet ___ .",
            answer: "you",
            hint: "Use the object pronoun for the person you are speaking to.",
          },
        ],
      },
      {
        slug: "ordering-food",
        title: "Ordering Food in the U.S.",
        goal: "Order food politely at a cafe or restaurant.",
        americanTip:
          'In U.S. restaurants, saying "Can I get...?" sounds natural and friendly.',
        vocabulary: [
          {
            word: "to go",
            meaning: "for takeout",
            example: "Can I get this to go?",
          },
          {
            word: "refill",
            meaning: "more of the same drink",
            example: "Can I have a refill on my iced tea?",
          },
          {
            word: "check",
            meaning: "the bill",
            example: "Could we get the check, please?",
          },
        ],
        dialogue: [
          { speaker: "Customer", line: "Hi, can I get a turkey sandwich and a small coffee?" },
          { speaker: "Cashier", line: "Sure. Is that for here or to go?" },
          { speaker: "Customer", line: "To go, please." },
          { speaker: "Cashier", line: "Great. That will be $11.50." },
        ],
        quiz: [
          {
            id: "b2-q1",
            prompt: 'In American English, what does "to go" mean?',
            options: ["Eat now", "Takeout", "Pay later", "Add ice"],
            answerIndex: 1,
            explanation: '"To go" means you will take the food with you.',
          },
          {
            id: "b2-q2",
            prompt: 'Most natural request: "___ I get a chicken salad?"',
            options: ["Do", "Can", "Must", "Would"],
            answerIndex: 1,
            explanation: '"Can I get...?" is very common in the U.S.',
          },
        ],
        practice: [
          {
            id: "b2-p1",
            sentence: "Complete: Could I get the ___, please? (bill)",
            answer: "check",
            hint: 'In the U.S., people often say "check" instead of "bill".',
          },
          {
            id: "b2-p2",
            sentence: "Complete: Is this for here or ___ ___ ?",
            answer: "to go",
            hint: "Two words used for takeout.",
          },
        ],
      },
    ],
  },
  {
    key: "intermediate",
    title: "Intermediate",
    description: "Speak more naturally in common American situations.",
    cefrBand: "B1-B2",
    lessons: [
      {
        slug: "small-talk-and-weather",
        title: "Small Talk and Weather",
        goal: "Keep a short casual conversation going.",
        americanTip:
          'Americans often use light topics like weather, weekends, or local events for small talk.',
        vocabulary: [
          {
            word: "humid",
            meaning: "warm with a lot of moisture in the air",
            example: "It is really humid today.",
          },
          {
            word: "traffic",
            meaning: "cars on the road",
            example: "The traffic was terrible this morning.",
          },
          {
            word: "catch up",
            meaning: "talk and share updates",
            example: "Let us catch up over coffee.",
          },
        ],
        dialogue: [
          { speaker: "Alex", line: "Hey, how is your day going?" },
          { speaker: "Priya", line: "Pretty good. The weather is finally cooling down." },
          { speaker: "Alex", line: "Yeah, last week was so hot and humid." },
          { speaker: "Priya", line: "Totally. Want to catch up after work?" },
        ],
        quiz: [
          {
            id: "i1-q1",
            prompt: 'What does "catch up" usually mean?',
            options: [
              "Run quickly",
              "Talk and share recent news",
              "Miss a meeting",
              "Cancel plans",
            ],
            answerIndex: 1,
            explanation: 'In conversation, "catch up" means reconnect and talk.',
          },
          {
            id: "i1-q2",
            prompt: 'Choose the best response to "How is your day going?"',
            options: [
              "Square root of nine",
              "Pretty good, thanks. How about yours?",
              "I am weather",
              "Not answer",
            ],
            answerIndex: 1,
            explanation: "A brief friendly response keeps small talk going.",
          },
        ],
        practice: [
          {
            id: "i1-p1",
            sentence: "Complete: The weather is cooling ___ this week.",
            answer: "down",
            hint: 'Phrasal verb: "cool down".',
          },
          {
            id: "i1-p2",
            sentence: "Complete: Let us ___ up this weekend.",
            answer: "catch",
            hint: "Use the first word of the expression.",
          },
        ],
      },
      {
        slug: "workplace-communication",
        title: "Workplace Communication",
        goal: "Speak politely in meetings and work chat.",
        americanTip:
          'In U.S. offices, softening language is common: "Could you...", "Would you mind...", "I suggest...".',
        vocabulary: [
          {
            word: "deadline",
            meaning: "the date by which work must be finished",
            example: "The deadline is next Friday.",
          },
          {
            word: "follow up",
            meaning: "contact again with more information",
            example: "I will follow up with an email.",
          },
          {
            word: "align",
            meaning: "agree on direction",
            example: "Let us align on priorities.",
          },
        ],
        dialogue: [
          { speaker: "Manager", line: "Could you share the latest draft by noon?" },
          { speaker: "Engineer", line: "Absolutely. I will send it before lunch." },
          { speaker: "Manager", line: "Great, and let us align on next steps at 2 p.m." },
          { speaker: "Engineer", line: "Sounds good. I will follow up with notes." },
        ],
        quiz: [
          {
            id: "i2-q1",
            prompt: 'What is the best paraphrase of "I will follow up"?',
            options: [
              "I will forget this",
              "I will contact you again later",
              "I will leave now",
              "I will ask no questions",
            ],
            answerIndex: 1,
            explanation: '"Follow up" means contact again with updates.',
          },
          {
            id: "i2-q2",
            prompt: "Which request sounds more polite in a U.S. workplace?",
            options: [
              "Send me the file now.",
              "Could you send me the file when you have a moment?",
              "You send it. Fast.",
              "File. Send.",
            ],
            answerIndex: 1,
            explanation: "Polite modal forms are preferred.",
          },
        ],
        practice: [
          {
            id: "i2-p1",
            sentence: "Complete: I will ___ up with an email.",
            answer: "follow",
            hint: "First word in the phrasal verb.",
          },
          {
            id: "i2-p2",
            sentence: "Complete: Let us ___ on the timeline.",
            answer: "align",
            hint: "Verb that means agree on direction.",
          },
        ],
      },
    ],
  },
  {
    key: "advanced",
    title: "Advanced",
    description: "Refine nuance, tone, and fluent American communication.",
    cefrBand: "C1-C2",
    lessons: [
      {
        slug: "nuance-and-tone",
        title: "Nuance and Tone",
        goal: "Express disagreement diplomatically and clearly.",
        americanTip:
          'American professional culture often values direct but respectful language, like "I see your point, but...".',
        vocabulary: [
          {
            word: "fair point",
            meaning: "a reasonable argument",
            example: "That is a fair point.",
          },
          {
            word: "to push back",
            meaning: "to challenge an idea",
            example: "I want to push back on that timeline.",
          },
          {
            word: "trade-off",
            meaning: "a balance between two good options",
            example: "There is a trade-off between speed and quality.",
          },
        ],
        dialogue: [
          { speaker: "Lead", line: "I see your point, but I am concerned about long-term maintenance." },
          { speaker: "PM", line: "That is fair. What alternative would you suggest?" },
          { speaker: "Lead", line: "We could ship a smaller scope first." },
          { speaker: "PM", line: "Good call. That seems like a smart trade-off." },
        ],
        quiz: [
          {
            id: "a1-q1",
            prompt: 'Best diplomatic disagreement opener:',
            options: [
              "You are wrong.",
              "I see your point, but I have a concern.",
              "No chance.",
              "That is nonsense.",
            ],
            answerIndex: 1,
            explanation: "It acknowledges the other side before presenting concern.",
          },
          {
            id: "a1-q2",
            prompt: 'What is a "trade-off"?',
            options: [
              "A random choice",
              "A complete failure",
              "A balance between competing priorities",
              "A final answer with no downsides",
            ],
            answerIndex: 2,
            explanation: "A trade-off accepts gain in one area and cost in another.",
          },
        ],
        practice: [
          {
            id: "a1-p1",
            sentence: "Complete: I ___ your point, but I disagree on timing.",
            answer: "see",
            hint: "Common diplomatic phrase.",
          },
          {
            id: "a1-p2",
            sentence: "Complete: There is a ___-off between cost and quality.",
            answer: "trade",
            hint: "First word in the compound noun.",
          },
        ],
      },
      {
        slug: "american-pronunciation-patterns",
        title: "American Pronunciation Patterns",
        goal: "Recognize key U.S. pronunciation patterns for smoother speech.",
        americanTip:
          'In many U.S. accents, "t" sounds like a soft "d" between vowels (water -> wa-der).',
        vocabulary: [
          {
            word: "flap t",
            meaning: 'a soft "t" sound between vowels',
            example: '"Water" often sounds like "wa-der".',
          },
          {
            word: "rhotic r",
            meaning: "pronouncing the letter r clearly",
            example: 'Many U.S. speakers pronounce the "r" in "car".',
          },
          {
            word: "reduction",
            meaning: "weakening of common words in fast speech",
            example: '"Want to" often sounds like "wanna".',
          },
        ],
        dialogue: [
          { speaker: "Coach", line: "Say 'water' slowly, then naturally: wa-ter -> wa-der." },
          { speaker: "Student", line: "Wa-der. That sounds more American." },
          { speaker: "Coach", line: "Great. Now try: 'I wanna get better at English.'" },
          { speaker: "Student", line: "I wanna get better at English." },
        ],
        quiz: [
          {
            id: "a2-q1",
            prompt: 'What is the "flap t" pattern in many U.S. accents?',
            options: [
              "T disappears at the start of words",
              "T becomes a soft d between vowels",
              "T is always silent",
              "T becomes k",
            ],
            answerIndex: 1,
            explanation: 'In words like "water", t often sounds like a quick soft d.',
          },
          {
            id: "a2-q2",
            prompt: 'Which reduced form is common in casual U.S. speech?',
            options: ["want to -> wanna", "go to -> goat", "did you -> ditch", "do not -> donut"],
            answerIndex: 0,
            explanation: '"Wanna" is a common casual reduction.',
          },
        ],
        practice: [
          {
            id: "a2-p1",
            sentence: "Complete: In casual speech, 'want to' often becomes ___.",
            answer: "wanna",
            hint: "Five letters, very common in U.S. casual conversation.",
          },
          {
            id: "a2-p2",
            sentence: "Complete: Many U.S. accents clearly pronounce the ___ sound in 'car'.",
            answer: "r",
            hint: "Single letter.",
          },
        ],
      },
    ],
  },
];

export function getLevel(level: string): Level | undefined {
  return curriculum.find((item) => item.key === level);
}

export function getLesson(level: string, lesson: string): Lesson | undefined {
  const selectedLevel = getLevel(level);
  if (!selectedLevel) {
    return undefined;
  }
  return selectedLevel.lessons.find((item) => item.slug === lesson);
}
