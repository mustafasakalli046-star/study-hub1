// AI-powered note summarization system
// Uses extractive summarization algorithm with Turkish language support

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  importantTerms: string[];
  estimatedReadTime: number;
  difficulty: 'kolay' | 'orta' | 'zor';
}

// Stop words for Turkish
const STOP_WORDS = new Set([
  've', 'ile', 'bir', 'bu', 'şu', 'o', 'da', 'de', 'ki', 'mi', 'mı', 'mu', 'mü',
  'için', 'gibi', 'kadar', 'ama', 'fakat', 'ancak', 'çünkü', 'eğer', 'ise', 'ya',
  'veya', 'yahut', 'hem', 'ne', 'her', 'hiç', 'bazı', 'çok', 'az', 'daha', 'en',
  'en', 'sonra', 'önce', 'şimdi', 'bugün', 'yarın', 'dün', 'burada', 'şurada',
  'orada', 'nerede', 'nasıl', 'neden', 'niçin', 'kim', 'ne', 'hangi', 'ben',
  'sen', 'biz', 'siz', 'onlar', 'benim', 'senin', 'bizim', 'sizin', 'onların',
  'bana', 'sana', 'bize', 'size', 'onlara', 'beni', 'seni', 'bizi', 'sizi', 'onları',
  'benden', 'senden', 'bizden', 'sizden', 'onlardan', 'var', 'yok', 'olarak',
  'olan', 'olur', 'olmak', 'oldu', 'olmuş', 'olacak', 'oluyor', 'etti', 'etmek',
  'eden', 'edilen', 'edilmiş', 'şekilde', 'şeklindedir', 'şeklinde', 'olarak',
  'olarak', 'üzere', 'doğru', 'rağmen', 'karşın', 'beri', 'itibaren', 'dair',
]);

// Split text into sentences
function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 10);
}

// Tokenize text into words
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

// Calculate word frequency
function wordFrequency(words: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  return freq;
}

// Score sentences based on word frequency
function scoreSentences(sentences: string[], wordFreq: Map<string, number>): number[] {
  return sentences.map(sentence => {
    const words = tokenize(sentence);
    if (words.length === 0) return 0;
    const score = words.reduce((sum, word) => sum + (wordFreq.get(word) || 0), 0);
    // Normalize by sentence length to avoid bias towards long sentences
    return score / Math.sqrt(words.length);
  });
}

// Extract important terms (words that appear frequently but aren't stop words)
function extractImportantTerms(text: string, maxTerms: number = 8): string[] {
  const words = tokenize(text);
  const freq = wordFrequency(words);
  
  // Sort by frequency and take top terms
  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTerms)
    .map(([word]) => word);
  
  return sorted;
}

// Detect difficulty level
function detectDifficulty(text: string, terms: string[]): 'kolay' | 'orta' | 'zor' {
  const words = tokenize(text);
  const uniqueRatio = new Set(words).size / words.length;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  
  // Technical terms indicate higher difficulty
  const technicalTerms = terms.filter(t => t.length > 8).length;
  
  if (uniqueRatio > 0.7 || avgWordLength > 7 || technicalTerms > 5) return 'zor';
  if (uniqueRatio > 0.5 || avgWordLength > 5 || technicalTerms > 2) return 'orta';
  return 'kolay';
}

// Extract key points from text
function extractKeyPoints(sentences: string[], scores: number[], maxPoints: number = 5): string[] {
  // Get indices sorted by score
  const indices = scores
    .map((score, idx) => ({ score, idx }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPoints)
    .map(item => item.idx)
    .sort((a, b) => a - b); // Sort back to original order
  
  return indices.map(idx => sentences[idx]).filter(Boolean);
}

// Generate summary
function generateSummary(sentences: string[], scores: number[], ratio: number = 0.3): string {
  const numSentences = Math.max(2, Math.ceil(sentences.length * ratio));
  const indices = scores
    .map((score, idx) => ({ score, idx }))
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .map(item => item.idx)
    .sort((a, b) => a - b);
  
  return indices.map(idx => sentences[idx]).join(' ');
}

// Main summarization function
export function summarizeNote(content: string, title?: string): SummaryResult {
  if (!content || content.trim().length === 0) {
    return {
      summary: 'Özetlenecek içerik bulunamadı.',
      keyPoints: [],
      importantTerms: [],
      estimatedReadTime: 0,
      difficulty: 'kolay',
    };
  }

  const sentences = splitSentences(content);
  
  if (sentences.length <= 2) {
    // Too short to summarize, return as-is
    const terms = extractImportantTerms(content, 5);
    return {
      summary: content.trim(),
      keyPoints: [content.trim()],
      importantTerms: terms,
      estimatedReadTime: Math.ceil(content.split(/\s+/).length / 200),
      difficulty: 'kolay',
    };
  }

  const words = tokenize(content);
  const wordFreq = wordFrequency(words);
  const scores = scoreSentences(sentences, wordFreq);
  const importantTerms = extractImportantTerms(content);
  const keyPoints = extractKeyPoints(sentences, scores);
  const summary = generateSummary(sentences, scores);
  const difficulty = detectDifficulty(content, importantTerms);
  const wordCount = content.split(/\s+/).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    summary: title ? `📌 ${title}\n\n${summary}` : summary,
    keyPoints,
    importantTerms,
    estimatedReadTime,
    difficulty,
  };
}

// Format summary for display
export function formatSummaryDisplay(result: SummaryResult): string {
  let output = '';
  
  output += `📋 ÖZET\n`;
  output += `${result.summary}\n\n`;
  
  if (result.keyPoints.length > 0) {
    output += `🔑 ANA NOKTALAR\n`;
    result.keyPoints.forEach((point, i) => {
      output += `${i + 1}. ${point}\n`;
    });
    output += '\n';
  }
  
  if (result.importantTerms.length > 0) {
    output += `📚 ÖNEMLİ KAVRAMLAR\n`;
    output += result.importantTerms.map(t => `• ${t}`).join('\n');
    output += '\n\n';
  }
  
  output += `⏱️ Tahmini Okuma Süresi: ${result.estimatedReadTime} dk\n`;
  output += `📊 Zorluk: ${result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}`;
  
  return output;
}

// Quick summary (one-liner)
export function quickSummary(content: string): string {
  const sentences = splitSentences(content);
  if (sentences.length === 0) return content.trim().substring(0, 100);
  
  const words = tokenize(content);
  const wordFreq = wordFrequency(words);
  const scores = scoreSentences(sentences, wordFreq);
  
  const bestIdx = scores.indexOf(Math.max(...scores));
  const bestSentence = sentences[bestIdx] || sentences[0];
  
  return bestSentence.length > 150 ? bestSentence.substring(0, 147) + '...' : bestSentence;
}

// Generate study questions from notes
export function generateStudyQuestions(content: string, title?: string): string[] {
  const terms = extractImportantTerms(content, 6);
  const sentences = splitSentences(content);
  const questions: string[] = [];
  
  // Generate definition questions
  if (terms.length > 0) {
    questions.push(`"${terms[0]}" kavramını tanımlayınız.`);
  }
  if (terms.length > 1) {
    questions.push(`"${terms[0]}" ile "${terms[1]}" arasındaki ilişkiyi açıklayınız.`);
  }
  if (terms.length > 2) {
    questions.push(`Aşağıdaki kavramları karşılaştırınız: ${terms.slice(0, 3).join(', ')}`);
  }
  
  // Generate comprehension questions from key sentences
  if (sentences.length > 0) {
    const words = tokenize(content);
    const wordFreq = wordFrequency(words);
    const scores = scoreSentences(sentences, wordFreq);
    const bestIdx = scores.indexOf(Math.max(...scores));
    const keySentence = sentences[bestIdx];
    
    if (keySentence) {
      questions.push(`"${keySentence.substring(0, 50)}..." ifadesini açıklayınız.`);
    }
  }
  
  // Add general questions
  questions.push(`${title || 'Bu konunun'} ana fikirlerini maddeler halinde yazınız.`);
  questions.push(`Bu konuyu bir arkadaşınıza anlatır gibi özetleyiniz.`);
  
  return questions.slice(0, 5);
}

// Flashcard generation
export function generateFlashcards(content: string): { front: string; back: string }[] {
  const terms = extractImportantTerms(content, 5);
  const sentences = splitSentences(content);
  const flashcards: { front: string; back: string }[] = [];
  
  terms.forEach(term => {
    // Find the sentence containing this term
    const relevantSentence = sentences.find(s => s.toLowerCase().includes(term.toLowerCase()));
    if (relevantSentence) {
      flashcards.push({
        front: term,
        back: relevantSentence,
      });
    }
  });
  
  return flashcards.slice(0, 5);
}
