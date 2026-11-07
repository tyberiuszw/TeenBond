import fs from 'fs';
import path from 'path';
import {
  CHAMPFROGS_DEFINITIONS,
  resolveCardAssetUrl,
  findCardDef,
  validateMotivatorRanking,
} from '../src/lib/motivators/cardData';
import {
  calculateAbsoluteDifferenceSum,
  categorizeScore,
  getSurvivalTier,
  SURVIVAL_TIERS,
} from '../src/lib/decisions/scoring';
import {
  calculateSynergy,
  detectSilentExpert,
  calculateItemControversy,
} from '../src/lib/decisions/synergy';
import {
  LOST_AT_SEA_SCENARIO,
  NASA_MOON_SCENARIO as MOON_SURVIVAL_SCENARIO,
} from '../src/lib/decisions/scenarios';
import {
  LOST_AT_SEA_EXPERT_RATIONALES,
  NASA_MOON_EXPERT_RATIONALES,
} from '../src/lib/decisions/expertKeys';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function record(suite: string, name: string, passed: boolean, details?: string, error?: string) {
  results.push({ suite, name, passed, details, error });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${status}] [${suite}] ${name}${details ? ` - ${details}` : ''}${error ? ` ERROR: ${error}` : ''}`);
}

// Helper for random permutation (Fisher-Yates shuffle)
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

console.log('================================================================');
console.log('🚀 EMPIRICAL STRESS TEST HARNESS — MILESTONE 2 (TEENBOND)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: CHAMPFROGS Card Assets & Typography Verification
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: CHAMPFROGS Card Assets & Typography Verification ---');
const cardsDir = path.resolve(process.cwd(), 'public/images/cards');

try {
  const exists = fs.existsSync(cardsDir);
  record('Suite 1', 'cards_directory_exists', exists, `Path: ${cardsDir}`);

  if (exists) {
    let allCardsValid = true;
    let cardCount = 0;

    for (const card of CHAMPFROGS_DEFINITIONS) {
      cardCount++;
      // Verify Front file
      const frontPath = path.join(cardsDir, card.frontFilename);
      const frontExists = fs.existsSync(frontPath);
      const frontStat = frontExists ? fs.statSync(frontPath) : null;
      const frontSize = frontStat ? frontStat.size : 0;

      // Verify Back file
      const backPath = path.join(cardsDir, card.backFilename);
      const backExists = fs.existsSync(backPath);
      const backStat = backExists ? fs.statSync(backPath) : null;
      const backSize = backStat ? backStat.size : 0;

      // Check JPEG magic numbers (0xFF, 0xD8, 0xFF)
      let frontValidJpeg = false;
      let backValidJpeg = false;

      if (frontExists && frontSize > 10) {
        const buffer = Buffer.alloc(3);
        const fd = fs.openSync(frontPath, 'r');
        fs.readSync(fd, buffer, 0, 3, 0);
        fs.closeSync(fd);
        frontValidJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      }

      if (backExists && backSize > 10) {
        const buffer = Buffer.alloc(3);
        const fd = fs.openSync(backPath, 'r');
        fs.readSync(fd, buffer, 0, 3, 0);
        fs.closeSync(fd);
        backValidJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      }

      const cardValid = frontExists && backExists && frontSize > 100000 && backSize > 100000 && frontValidJpeg && backValidJpeg;
      if (!cardValid) allCardsValid = false;

      record(
        'Suite 1',
        `card_${card.id}_asset_integrity`,
        cardValid,
        `Front: ${card.frontFilename} (${(frontSize / 1024).toFixed(1)} KB, JPEG: ${frontValidJpeg}), Back: ${card.backFilename} (${(backSize / 1024).toFixed(1)} KB, JPEG: ${backValidJpeg})`
      );
    }

    record('Suite 1', 'all_10_pairs_verified', allCardsValid && cardCount === 10, `Total 20 card images verified intact and high-res`);

    // Verify Curiosity typo handling
    const curiosityDef = findCardDef('curiosity');
    if (curiosityDef) {
      const typoPath = path.join(cardsDir, 'Curiotisy Front.jpg');
      const standardPath = path.join(cardsDir, 'Curiosity Front.jpg');
      const typoExists = fs.existsSync(typoPath);
      const standardExists = fs.existsSync(standardPath);

      record(
        'Suite 1',
        'curiosity_typo_resilience',
        typoExists && standardExists,
        `Typo file ('Curiotisy Front.jpg') exists: ${typoExists}, Standard file exists: ${standardExists}`
      );

      const resolvedUrlTypo = resolveCardAssetUrl(curiosityDef.frontFilename);
      const resolvedUrlAlt = resolveCardAssetUrl(curiosityDef.frontFilenameAlternative);
      record(
        'Suite 1',
        'curiosity_url_resolution',
        resolvedUrlTypo.includes('Curiotisy%20Front.jpg') && resolvedUrlAlt.includes('Curiosity%20Front.jpg'),
        `Resolved URLs: typo=${resolvedUrlTypo}, alt=${resolvedUrlAlt}`
      );
    } else {
      record('Suite 1', 'curiosity_def_found', false, 'Curiosity definition missing');
    }

    // Ranking validation logic stress
    const validPerm = CHAMPFROGS_DEFINITIONS.map((c) => c.id);
    const validCheck = validateMotivatorRanking(validPerm);
    record('Suite 1', 'valid_ranking_check', validCheck.isValid, 'Accepts valid 10-card permutation');

    const duplicatePerm = [...validPerm.slice(0, 9), validPerm[0]];
    const dupCheck = validateMotivatorRanking(duplicatePerm);
    record('Suite 1', 'duplicate_cards_rejected', !dupCheck.isValid, `Correctly rejected: ${dupCheck.error}`);

    const tooShortPerm = validPerm.slice(0, 8);
    const shortCheck = validateMotivatorRanking(tooShortPerm);
    record('Suite 1', 'too_short_rejected', !shortCheck.isValid, `Correctly rejected: ${shortCheck.error}`);

    const unknownCardPerm = [...validPerm.slice(0, 9), 'non_existent_card'];
    const unknownCheck = validateMotivatorRanking(unknownCardPerm);
    record('Suite 1', 'unknown_card_rejected', !unknownCheck.isValid, `Correctly rejected: ${unknownCheck.error}`);
  }
} catch (err: any) {
  record('Suite 1', 'suite_1_exception', false, undefined, err.message);
}

// -----------------------------------------------------------------------------
// SUITE 2: Decision Games Scoring & Invariants (Lost at Sea & NASA Moon Survival)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Decision Games Mathematical Invariants (500 Permutations Each) ---');

const baseRanks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

// 2.1 Lost at Sea
const seaExpertRanks = LOST_AT_SEA_EXPERT_RATIONALES
  .slice()
  .sort((a, b) => a.officialRank - b.officialRank)
  .map((r) => r.officialRank);

// Identity permutation: score must be 0
const seaScore0 = calculateAbsoluteDifferenceSum(seaExpertRanks, seaExpertRanks);
record('Suite 2', 'lost_at_sea_identity_score_0', seaScore0 === 0, `Exact match score = ${seaScore0}`);

// Reverse permutation: score must be 112
const reverseRanks = [...seaExpertRanks].reverse();
const seaScore112 = calculateAbsoluteDifferenceSum(reverseRanks, seaExpertRanks);
record('Suite 2', 'lost_at_sea_reverse_score_112', seaScore112 === 112, `Reverse match score = ${seaScore112}`);

// 500 Random Permutations for Lost at Sea
let seaAllInRange = true;
let seaAllEven = true;
let seaTierDistribution: Record<string, number> = {
  excellent: 0,
  good: 0,
  average: 0,
  fair: 0,
  poor: 0,
  very_poor: 0,
};

for (let i = 0; i < 500; i++) {
  const perm = shuffle(baseRanks);
  const score = calculateAbsoluteDifferenceSum(perm, seaExpertRanks);
  if (score < 0 || score > 112) {
    seaAllInRange = false;
  }
  if (score % 2 !== 0) {
    seaAllEven = false;
  }
  const tier = getSurvivalTier(score);
  seaTierDistribution[tier.tier] = (seaTierDistribution[tier.tier] || 0) + 1;
}

record('Suite 2', 'lost_at_sea_500_permutations_range_[0,112]', seaAllInRange, 'All 500 scores in [0, 112]');
record('Suite 2', 'lost_at_sea_500_permutations_even_parity', seaAllEven, 'All 500 scores have even parity (score % 2 === 0)');
console.log(`   [Distribution] Sea Tiers across 500 random permutations:`, JSON.stringify(seaTierDistribution));

// 2.2 NASA Moon Survival
const moonExpertRanks = NASA_MOON_EXPERT_RATIONALES
  .slice()
  .sort((a, b) => a.officialRank - b.officialRank)
  .map((r) => r.officialRank);

const moonScore0 = calculateAbsoluteDifferenceSum(moonExpertRanks, moonExpertRanks);
record('Suite 2', 'moon_survival_identity_score_0', moonScore0 === 0, `Exact match score = ${moonScore0}`);

const moonReverseRanks = [...moonExpertRanks].reverse();
const moonScore112 = calculateAbsoluteDifferenceSum(moonReverseRanks, moonExpertRanks);
record('Suite 2', 'moon_survival_reverse_score_112', moonScore112 === 112, `Reverse match score = ${moonScore112}`);

// 500 Random Permutations for NASA Moon Survival
let moonAllInRange = true;
let moonAllEven = true;
let moonTierDistribution: Record<string, number> = {
  excellent: 0,
  good: 0,
  average: 0,
  fair: 0,
  poor: 0,
  very_poor: 0,
};

for (let i = 0; i < 500; i++) {
  const perm = shuffle(baseRanks);
  const score = calculateAbsoluteDifferenceSum(perm, moonExpertRanks);
  if (score < 0 || score > 112) {
    moonAllInRange = false;
  }
  if (score % 2 !== 0) {
    moonAllEven = false;
  }
  const tier = getSurvivalTier(score);
  moonTierDistribution[tier.tier] = (moonTierDistribution[tier.tier] || 0) + 1;
}

record('Suite 2', 'moon_500_permutations_range_[0,112]', moonAllInRange, 'All 500 scores in [0, 112]');
record('Suite 2', 'moon_500_permutations_even_parity', moonAllEven, 'All 500 scores have even parity (score % 2 === 0)');
console.log(`   [Distribution] Moon Tiers across 500 random permutations:`, JSON.stringify(moonTierDistribution));

// Boundary checks: length mismatch throws error
let lengthMismatchThrows = false;
try {
  calculateAbsoluteDifferenceSum([1, 2, 3], seaExpertRanks);
} catch (e: any) {
  lengthMismatchThrows = true;
}
record('Suite 2', 'length_mismatch_throws_error', lengthMismatchThrows, 'Throws error when lengths differ');

// -----------------------------------------------------------------------------
// SUITE 3: Synergy Formula on Random Player Profiles
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Synergy Formula Behavior on Random Player Profiles ---');

let synergyInvariantsHold = true;
let positiveSynergyCount = 0;
let negativeSynergyCount = 0;
let neutralSynergyCount = 0;

for (let t = 0; t < 200; t++) {
  const teamSize = Math.floor(Math.random() * 7) + 2; // 2 to 8 members
  const soloScores: number[] = [];
  for (let m = 0; m < teamSize; m++) {
    // Generate an even score in [0, 112]
    const perm = shuffle(baseRanks);
    soloScores.push(calculateAbsoluteDifferenceSum(perm, seaExpertRanks));
  }

  // Random team score
  const teamPerm = shuffle(baseRanks);
  const teamScore = calculateAbsoluteDifferenceSum(teamPerm, seaExpertRanks);

  const res = calculateSynergy(soloScores, teamScore);
  const expectedAvg = Math.round((soloScores.reduce((a, b) => a + b, 0) / soloScores.length) * 100) / 100;
  const expectedDelta = Math.round((expectedAvg - teamScore) * 100) / 100;

  if (res.averageIndividualScore !== expectedAvg || res.synergyDelta !== expectedDelta) {
    synergyInvariantsHold = false;
  }
  if (res.synergyDelta > 0 && !res.isSynergyPositive) {
    synergyInvariantsHold = false;
  }
  if (res.synergyDelta <= 0 && res.isSynergyPositive) {
    synergyInvariantsHold = false;
  }

  if (res.synergyDelta > 0) positiveSynergyCount++;
  else if (res.synergyDelta < 0) negativeSynergyCount++;
  else neutralSynergyCount++;
}

record(
  'Suite 3',
  'synergy_200_random_teams_invariants',
  synergyInvariantsHold,
  `Tested 200 teams (Positive: ${positiveSynergyCount}, Negative: ${negativeSynergyCount}, Neutral: ${neutralSynergyCount})`
);

// Targeted boundary cases for Synergy
const zeroDeltaCase = calculateSynergy([40, 40, 40], 40);
record(
  'Suite 3',
  'synergy_zero_delta_neutral',
  zeroDeltaCase.synergyDelta === 0 && zeroDeltaCase.isSynergyPositive === false && zeroDeltaCase.synergyPercentage === 0,
  `Delta = ${zeroDeltaCase.synergyDelta}, isPositive = ${zeroDeltaCase.isSynergyPositive}`
);

const emptyTeamCase = calculateSynergy([], 40);
record(
  'Suite 3',
  'synergy_empty_team_safe',
  emptyTeamCase.synergyDelta === 0 && emptyTeamCase.isSynergyPositive === false,
  'Safe handling without divide-by-zero or NaN'
);

const highSynergyCase = calculateSynergy([50, 60, 70], 30);
record(
  'Suite 3',
  'synergy_positive_improvement',
  highSynergyCase.synergyDelta === 30 && highSynergyCase.isSynergyPositive === true && highSynergyCase.synergyPercentage === 50,
  `Avg=60, Team=30, Delta=30, Percentage=50%`
);

// -----------------------------------------------------------------------------
// SUITE 4: Silent Expert Detection Boundary Cases (diff = 4 vs diff = 5)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Silent Expert Detection Boundary Cases ---');

// Case A: TeamScore = 34, BestSolo = 30 -> Difference = 4 (THRESHOLD NOT MET: should be FALSE)
const caseDiff4 = detectSilentExpert(
  [
    { userId: 'u1', userName: 'Alice', score: 30 },
    { userId: 'u2', userName: 'Bob', score: 50 },
    { userId: 'u3', userName: 'Charlie', score: 54 },
  ],
  34
);
record(
  'Suite 4',
  'silent_expert_diff_4_not_active',
  caseDiff4.isSilentExpert === false && caseDiff4.difference === 4,
  `diff=4 -> isSilentExpert=${caseDiff4.isSilentExpert} (expected false)`
);

// Case B: TeamScore = 35, BestSolo = 30 -> Difference = 5 (THRESHOLD MET: should be TRUE)
const caseDiff5 = detectSilentExpert(
  [
    { userId: 'u1', userName: 'Alice', score: 30 },
    { userId: 'u2', userName: 'Bob', score: 50 },
    { userId: 'u3', userName: 'Charlie', score: 54 },
  ],
  35
);
record(
  'Suite 4',
  'silent_expert_diff_5_active',
  caseDiff5.isSilentExpert === true &&
    caseDiff5.difference === 5 &&
    caseDiff5.silentExpertUserId === 'u1' &&
    caseDiff5.silentExpertName === 'Alice' &&
    caseDiff5.expertSoloScore === 30,
  `diff=5 -> isSilentExpert=${caseDiff5.isSilentExpert}, expert=${caseDiff5.silentExpertName} (expected Alice, true)`
);

// Case C: TeamScore = 30, BestSolo = 30 -> Difference = 0 (No difference: should be FALSE)
const caseDiff0 = detectSilentExpert(
  [
    { userId: 'u1', userName: 'Alice', score: 30 },
    { userId: 'u2', userName: 'Bob', score: 40 },
  ],
  30
);
record(
  'Suite 4',
  'silent_expert_diff_0_not_active',
  caseDiff0.isSilentExpert === false && caseDiff0.difference === 0,
  `diff=0 -> isSilentExpert=${caseDiff0.isSilentExpert} (expected false)`
);

// Case D: TeamScore = 20, BestSolo = 30 -> Difference = -10 (Team out-performed best individual: should be FALSE)
const caseDiffNeg = detectSilentExpert(
  [
    { userId: 'u1', userName: 'Alice', score: 30 },
    { userId: 'u2', userName: 'Bob', score: 40 },
  ],
  20
);
record(
  'Suite 4',
  'silent_expert_negative_diff_not_active',
  caseDiffNeg.isSilentExpert === false && caseDiffNeg.difference === -10,
  `diff=-10 -> isSilentExpert=${caseDiffNeg.isSilentExpert} (expected false)`
);

// Case E: Large difference (diff = 40)
const caseDiff40 = detectSilentExpert(
  [
    { userId: 'u_silent', userName: 'Silent Pro', score: 10 },
    { userId: 'u_loud', userName: 'Loud Guy', score: 60 },
  ],
  50
);
record(
  'Suite 4',
  'silent_expert_diff_40_active',
  caseDiff40.isSilentExpert === true &&
    caseDiff40.difference === 40 &&
    caseDiff40.silentExpertUserId === 'u_silent',
  `diff=40 -> isSilentExpert=${caseDiff40.isSilentExpert}, expert=${caseDiff40.silentExpertName}`
);

// Case F: Empty submissions
const caseEmpty = detectSilentExpert([], 40);
record(
  'Suite 4',
  'silent_expert_empty_submissions_safe',
  caseEmpty.isSilentExpert === false && caseEmpty.difference === 0,
  'Safe handling with empty submissions list'
);

// -----------------------------------------------------------------------------
// SUITE 5: Item Controversy & Variance Analysis
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Item Controversy & Variance Analysis ---');

const itemIds = LOST_AT_SEA_SCENARIO.items.map((it) => it.id);
const mockSubmissions: Record<string, string[]> = {
  u1: [...itemIds],
  u2: [...itemIds].reverse(),
  u3: shuffle([...itemIds]),
};

const controversy = calculateItemControversy(mockSubmissions, itemIds);
const hotspots = controversy.filter((c) => c.isHotspot);

record(
  'Suite 5',
  'item_controversy_calculation',
  controversy.length === 15 && controversy.every((c) => c.variance >= 0),
  `Calculated variance for all 15 items`
);

record(
  'Suite 5',
  'item_controversy_hotspots_top_3',
  hotspots.length === 3,
  `Flagged top 3 highest variance items as hotspots (${hotspots.map((h) => h.itemId).join(', ')})`
);

// -----------------------------------------------------------------------------
// FINAL SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('📊 EMPIRICAL STRESS TEST RESULTS SUMMARY');
console.log('================================================================');
const totalTests = results.length;
const passedTests = results.filter((r) => r.passed).length;
const failedTests = results.filter((r) => !r.passed).length;

console.log(`Total empirical checks: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Pass rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests > 0) {
  console.log('\n❌ FAILED TESTS:');
  for (const f of results.filter((r) => !r.passed)) {
    console.log(` - [${f.suite}] ${f.name}: ${f.details || ''} ${f.error || ''}`);
  }
  process.exit(1);
} else {
  console.log('\n✨ ALL EMPIRICAL AND STRESS CHECKS PASSED PERFECTLY!');
  process.exit(0);
}
