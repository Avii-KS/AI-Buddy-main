import { ClassificationResult } from '../types';

const INTENT_KEYWORDS = {
  concept_explanation: ['explain', 'what is', 'kya hai', 'batao', 'samjhao', 'meaning', 'definition'],
  story: ['story', 'kahani', 'tale', 'suna', 'sunao'],
  doubt: ['doubt', 'confused', 'help', 'stuck', 'samajh nahi', 'clear karo'],
  practice: ['practice', 'exercise', 'problems', 'questions', 'solve'],
  homework: ['homework', 'assignment', 'project', 'task'],
  fun: ['fun', 'game', 'quiz', 'challenge', 'interesting', 'cool']
};

const SUBJECT_KEYWORDS = {
  math: ['math', 'maths', 'algebra', 'geometry', 'calculation', 'number', 'equation'],
  science: ['science', 'physics', 'chemistry', 'biology', 'experiment', 'photosynthesis', 'gravity'],
  english: ['english', 'grammar', 'essay', 'writing', 'story'],
  hindi: ['hindi', 'kavita', 'poem'],
  social: ['history', 'geography', 'civics', 'social']
};

const HINGLISH_PATTERNS = /[a-zA-Z]+.*[\u0900-\u097F]+|[\u0900-\u097F]+.*[a-zA-Z]+/;
const HINDI_PATTERNS = /[\u0900-\u097F]/;

export class MLClassifier {
  classifyIntent(query: string): string {
    const lowerQuery = query.toLowerCase();
    let maxScore = 0;
    let detectedIntent = 'concept_explanation';

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      const score = keywords.filter(keyword => lowerQuery.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }

    return detectedIntent;
  }

  classifyLanguage(query: string): string {
    if (HINGLISH_PATTERNS.test(query)) {
      return 'Hinglish';
    } else if (HINDI_PATTERNS.test(query)) {
      return 'Hindi';
    }
    return 'English';
  }

  classifyAgeGroup(query: string): string {
    const wordCount = query.split(/\s+/).length;
    const avgWordLength = query.replace(/\s/g, '').length / wordCount;
    const hasComplexWords = /photosynthesis|equation|polynomial|mitochondria/i.test(query);

    if (wordCount < 8 && avgWordLength < 5 && !hasComplexWords) {
      return 'Primary (6-10)';
    } else if (hasComplexWords || wordCount > 15) {
      return 'Senior (16-18)';
    }
    return 'Secondary (11-15)';
  }

  classifySubject(query: string): string {
    const lowerQuery = query.toLowerCase();
    let maxScore = 0;
    let detectedSubject = 'General';

    for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
      const score = keywords.filter(keyword => lowerQuery.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        detectedSubject = subject;
      }
    }

    return detectedSubject;
  }

  classifyComplexity(query: string, ageGroup: string): string {
    const wordCount = query.split(/\s+/).length;

    if (ageGroup === 'Primary (6-10)') {
      return wordCount > 10 ? 'Medium' : 'Easy';
    } else if (ageGroup === 'Senior (16-18)') {
      return wordCount > 20 ? 'Hard' : 'Medium';
    }
    return 'Medium';
  }

  classify(query: string): ClassificationResult {
    const intent = this.classifyIntent(query);
    const language = this.classifyLanguage(query);
    const ageGroup = this.classifyAgeGroup(query);
    const subject = this.classifySubject(query);
    const complexity = this.classifyComplexity(query, ageGroup);

    return {
      intent,
      language,
      ageGroup,
      subject,
      complexity,
      confidence: 0.85
    };
  }
}

export const classifier = new MLClassifier();
