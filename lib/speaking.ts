function normalizeForSpeech(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0),
  );

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function evaluateSpeakingAccuracy(
  targetText: string,
  transcriptText: string,
): { score: number; feedback: string } {
  const targetWords = normalizeForSpeech(targetText);
  const heardWords = normalizeForSpeech(transcriptText);

  const targetWordSet = new Set(targetWords);
  const overlapCount = heardWords.filter((word) => targetWordSet.has(word)).length;
  const wordCoverage =
    targetWords.length === 0 ? 0 : overlapCount / Math.max(targetWords.length, 1);

  const targetJoined = targetWords.join(" ");
  const heardJoined = heardWords.join(" ");
  const editDistance = levenshtein(targetJoined, heardJoined);
  const maxLen = Math.max(targetJoined.length, heardJoined.length, 1);
  const charSimilarity = 1 - editDistance / maxLen;

  const blended = Math.max(0, Math.min(1, wordCoverage * 0.6 + charSimilarity * 0.4));
  const score = Math.round(blended * 100);

  let feedback = "Great job. Keep your pace natural and clear.";
  if (score < 55) {
    feedback =
      "Try again more slowly. Focus on each stressed word and keep final consonants clear.";
  } else if (score < 75) {
    feedback =
      "Good effort. You are close. Repeat once more and emphasize key words in the sentence.";
  } else if (score < 90) {
    feedback =
      "Very good. Your pronunciation is understandable and natural in American English style.";
  }

  return { score, feedback };
}
