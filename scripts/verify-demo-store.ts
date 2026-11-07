/**
 * verify-demo-store.ts
 *
 * EMPIRICAL ADVERSARIAL VERIFICATION HARNESS FOR DEMO-STORE
 *
 * Verifies:
 * 1. Perspective switching between all 5 players (demo-user-anna, bartek, celina, dawid, ewa)
 * 2. Strict validation of 8 chameleon colors (hex format, unique, complete palette mapping)
 * 3. Mock data immutability for Zespół Alfa (deep checks against base mock exports)
 * 4. High-frequency memory stress resilience (10,000 rapid mutations + resets)
 */

import { useDemoStore } from '../src/lib/demo-store';
import {
  DEMO_ORGANIZATION_ALFA,
  DEMO_MEMBERS_ALFA,
  DEMO_MOTIVATORS_RANKINGS,
  DEMO_LOST_AT_SEA_DATA,
  DEMO_RELATIONSHIP_GRAPH_DATA,
  DEMO_TEENBOARD_ELEMENTS,
} from '../src/lib/demo-mock-data';
import { CHAMELEON_PALETTE } from '../src/types/chameleon';
import { getChameleonDef } from '../src/lib/constants';

interface AssertionResult {
  suite: string;
  test: string;
  passed: boolean;
  details?: string;
}

const results: AssertionResult[] = [];

function assert(suite: string, test: string, condition: boolean, details?: string) {
  results.push({ suite, test, passed: condition, details });
  if (!condition) {
    console.error(`❌ FAIL [${suite}] ${test}${details ? ` -> ${details}` : ''}`);
  } else {
    console.log(`✅ PASS [${suite}] ${test}`);
  }
}

async function runEmpiricalVerification() {
  console.log('='.repeat(80));
  console.log('STARTING EMPIRICAL DEMO-STORE VERIFICATION & STRESS HARNESS');
  console.log('='.repeat(80));

  // =========================================================================
  // SUITE 1: Perspective Switching Between 5 Players
  // =========================================================================
  console.log('\n--- SUITE 1: Perspective Switching Between 5 Players ---');
  const store = useDemoStore.getState();
  useDemoStore.getState().resetToInitial();

  // Test 1.1: Default active user
  const initialUser = useDemoStore.getState().getActiveUser();
  assert(
    'Perspective Switching',
    'Initial active user is Anna (Leader)',
    initialUser.id === 'demo-user-anna' && initialUser.role === 'leader',
    `Got user: ${initialUser.name} (${initialUser.id}), role: ${initialUser.role}`
  );

  // Test 1.2: Switching through all 5 members
  const expectedMembers = [
    { id: 'demo-user-anna', name: 'Anna', role: 'leader' },
    { id: 'demo-user-bartek', name: 'Bartek', role: 'member' },
    { id: 'demo-user-celina', name: 'Celina', role: 'member' },
    { id: 'demo-user-dawid', name: 'Dawid', role: 'member' },
    { id: 'demo-user-ewa', name: 'Ewa', role: 'member' },
  ];

  for (const expected of expectedMembers) {
    useDemoStore.getState().switchActiveUser(expected.id);
    const current = useDemoStore.getState().getActiveUser();
    assert(
      'Perspective Switching',
      `Switched to ${expected.name} (${expected.id})`,
      current.id === expected.id &&
        current.name === expected.name &&
        current.role === expected.role,
      `Expected ${expected.name} (${expected.id}), got ${current.name} (${current.id})`
    );
  }

  // Test 1.3: Role-based switching
  useDemoStore.getState().switchRole('leader');
  const userAfterLeaderSwitch = useDemoStore.getState().getActiveUser();
  assert(
    'Perspective Switching',
    'switchRole("leader") switches to leader',
    userAfterLeaderSwitch.role === 'leader' && userAfterLeaderSwitch.id === 'demo-user-anna',
    `Role: ${userAfterLeaderSwitch.role}, ID: ${userAfterLeaderSwitch.id}`
  );

  useDemoStore.getState().switchRole('member');
  const userAfterMemberSwitch = useDemoStore.getState().getActiveUser();
  assert(
    'Perspective Switching',
    'switchRole("member") switches to a member',
    userAfterMemberSwitch.role === 'member',
    `Role: ${userAfterMemberSwitch.role}, ID: ${userAfterMemberSwitch.id}`
  );

  // Test 1.4: Adversarial perspective switching (non-existent user)
  const userBeforeInvalid = useDemoStore.getState().getActiveUser().id;
  useDemoStore.getState().switchActiveUser('non-existent-user-id-9999');
  const userAfterInvalid = useDemoStore.getState().getActiveUser();
  assert(
    'Perspective Switching',
    'switchActiveUser with invalid ID is safely ignored and retains current user',
    userAfterInvalid.id === userBeforeInvalid,
    `Retained user: ${userAfterInvalid.id}, expected: ${userBeforeInvalid}`
  );

  // Test 1.5: Rapid random perspective switching (1,000 cycles)
  let lastSwitchedId = '';
  for (let i = 0; i < 1000; i++) {
    const target = expectedMembers[i % expectedMembers.length];
    useDemoStore.getState().switchActiveUser(target.id);
    lastSwitchedId = target.id;
  }
  const userAfterRapid = useDemoStore.getState().getActiveUser();
  assert(
    'Perspective Switching',
    '1,000 rapid perspective switches maintain deterministic active state',
    userAfterRapid.id === lastSwitchedId,
    `Final user: ${userAfterRapid.id}, expected: ${lastSwitchedId}`
  );

  // =========================================================================
  // SUITE 2: Validation of 8 Chameleon Colors
  // =========================================================================
  console.log('\n--- SUITE 2: Validation of 8 Chameleon Colors ---');

  // Test 2.1: Palette length
  assert(
    'Chameleon Palette',
    'CHAMELEON_PALETTE contains exactly 8 approved colors',
    CHAMELEON_PALETTE.length === 8,
    `Count: ${CHAMELEON_PALETTE.length}`
  );

  // Test 2.2: Hex code format and uniqueness
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  const seenIds = new Set<string>();
  const seenHexes = new Set<string>();
  let allHexesValid = true;

  for (const color of CHAMELEON_PALETTE) {
    if (!hexPattern.test(color.hex)) {
      allHexesValid = false;
      console.error(`Invalid hex code: ${color.hex} for color ${color.id}`);
    }
    seenIds.add(color.id);
    seenHexes.add(color.hex.toUpperCase());

    // Validate utility classes
    const classesValid =
      color.bgClass.startsWith('bg-') &&
      color.borderClass.startsWith('border-') &&
      color.textClass.startsWith('text-') &&
      color.ringClass.startsWith('ring-') &&
      color.glowClass.includes('shadow-');
    if (!classesValid) {
      assert('Chameleon Palette', `Utility classes for ${color.id} are valid Tailwind classes`, false);
    }
  }

  assert(
    'Chameleon Palette',
    'All 8 colors have valid 6-char hex format (#RRGGBB)',
    allHexesValid
  );

  assert(
    'Chameleon Palette',
    'All 8 color IDs and hex values are strictly unique',
    seenIds.size === 8 && seenHexes.size === 8,
    `Unique IDs: ${seenIds.size}, Unique Hexes: ${seenHexes.size}`
  );

  // Test 2.3: Zespół Alfa member colors
  const paletteHexesUpper = new Set(CHAMELEON_PALETTE.map((c) => c.hex.toUpperCase()));
  const memberColorsUpper = DEMO_MEMBERS_ALFA.map((m) => m.chameleonColor.toUpperCase());
  const allMembersValid = memberColorsUpper.every((h) => paletteHexesUpper.has(h));
  const uniqueMemberColors = new Set(memberColorsUpper);

  assert(
    'Chameleon Palette',
    'All 5 Zespół Alfa members use approved palette colors',
    allMembersValid,
    `Member colors: ${memberColorsUpper.join(', ')}`
  );

  assert(
    'Chameleon Palette',
    'All 5 Zespół Alfa members have distinct chameleon colors',
    uniqueMemberColors.size === 5,
    `Unique count: ${uniqueMemberColors.size}`
  );

  // Test 2.4: getChameleonDef resolution & fallbacks
  const emeraldDef = getChameleonDef('emerald');
  const hexDef = getChameleonDef('#3B82F6');
  const legacyDef = getChameleonDef('#22c55e');
  const fallbackDef = getChameleonDef('non-existent-color');

  assert(
    'Chameleon Palette',
    'getChameleonDef resolves by ID ("emerald" -> #10B981)',
    emeraldDef.id === 'emerald' && emeraldDef.hex === '#10B981'
  );
  assert(
    'Chameleon Palette',
    'getChameleonDef resolves by hex ("#3B82F6" -> blue)',
    hexDef.id === 'blue'
  );
  assert(
    'Chameleon Palette',
    'getChameleonDef handles legacy draft hex (#22c55e -> emerald)',
    legacyDef.id === 'emerald'
  );
  assert(
    'Chameleon Palette',
    'getChameleonDef falls back gracefully for unknown values',
    fallbackDef.id === 'emerald'
  );

  // =========================================================================
  // SUITE 3: Immutability of Zespół Alfa Mock Data
  // =========================================================================
  console.log('\n--- SUITE 3: Immutability of Zespół Alfa Mock Data ---');

  // Deep snapshot baseline of original mock constants
  const snapshotMembers = JSON.stringify(DEMO_MEMBERS_ALFA);
  const snapshotOrg = JSON.stringify(DEMO_ORGANIZATION_ALFA);
  const snapshotMotivators = JSON.stringify(DEMO_MOTIVATORS_RANKINGS);
  const snapshotDecisions = JSON.stringify(DEMO_LOST_AT_SEA_DATA);
  const snapshotGraph = JSON.stringify(DEMO_RELATIONSHIP_GRAPH_DATA);
  const snapshotElements = JSON.stringify(DEMO_TEENBOARD_ELEMENTS);

  // Apply massive state mutations to store
  useDemoStore.getState().enableDemoMode('demo-user-bartek');
  useDemoStore.getState().updateMotivatorRanking('demo-user-anna', [
    'STATUS', 'POWER', 'HONOR', 'FREEDOM', 'CURIOSITY',
    'MASTERY', 'ORDER', 'GOAL', 'ACCEPTANCE', 'RELATEDNESS',
  ]);
  useDemoStore.getState().updateMotivatorRanking('demo-user-dawid', [
    'ORDER', 'GOAL', 'MASTERY', 'HONOR', 'FREEDOM',
    'CURIOSITY', 'ACCEPTANCE', 'RELATEDNESS', 'POWER', 'STATUS',
  ]);
  useDemoStore.getState().addTeenBoardElement({
    id: 'adversarial-sticky-999',
    type: 'sticky',
    x: 400,
    y: 300,
    width: 200,
    height: 200,
    content: 'Adversarial Injection Test Content',
    color: '#EF4444',
    createdBy: 'demo-user-bartek',
  });

  // Verify that base mock data objects were NOT mutated
  const currentMembersSnapshot = JSON.stringify(DEMO_MEMBERS_ALFA);
  const currentOrgSnapshot = JSON.stringify(DEMO_ORGANIZATION_ALFA);
  const currentMotivatorsSnapshot = JSON.stringify(DEMO_MOTIVATORS_RANKINGS);
  const currentDecisionsSnapshot = JSON.stringify(DEMO_LOST_AT_SEA_DATA);
  const currentGraphSnapshot = JSON.stringify(DEMO_RELATIONSHIP_GRAPH_DATA);
  const currentElementsSnapshot = JSON.stringify(DEMO_TEENBOARD_ELEMENTS);

  assert(
    'Mock Immutability',
    'DEMO_MEMBERS_ALFA was not mutated by store operations',
    currentMembersSnapshot === snapshotMembers
  );
  assert(
    'Mock Immutability',
    'DEMO_ORGANIZATION_ALFA was not mutated by store operations',
    currentOrgSnapshot === snapshotOrg
  );
  assert(
    'Mock Immutability',
    'DEMO_MOTIVATORS_RANKINGS export was not mutated by updateMotivatorRanking',
    currentMotivatorsSnapshot === snapshotMotivators
  );
  assert(
    'Mock Immutability',
    'DEMO_LOST_AT_SEA_DATA was not mutated by store operations',
    currentDecisionsSnapshot === snapshotDecisions
  );
  assert(
    'Mock Immutability',
    'DEMO_RELATIONSHIP_GRAPH_DATA was not mutated by store operations',
    currentGraphSnapshot === snapshotGraph
  );
  assert(
    'Mock Immutability',
    'DEMO_TEENBOARD_ELEMENTS export was not mutated by addTeenBoardElement',
    currentElementsSnapshot === snapshotElements
  );

  // Verify resetToInitial restores store clean slate
  useDemoStore.getState().resetToInitial();
  const storeAfterReset = useDemoStore.getState();

  assert(
    'Mock Immutability',
    'resetToInitial() restores activeUserId to demo-user-anna',
    storeAfterReset.activeUserId === 'demo-user-anna'
  );
  assert(
    'Mock Immutability',
    'resetToInitial() restores motivators to original baseline',
    JSON.stringify(storeAfterReset.motivators) === snapshotMotivators
  );
  assert(
    'Mock Immutability',
    'resetToInitial() restores teenboard elements count to baseline',
    storeAfterReset.teenboardElements.length === DEMO_TEENBOARD_ELEMENTS.length,
    `Count: ${storeAfterReset.teenboardElements.length}, Expected: ${DEMO_TEENBOARD_ELEMENTS.length}`
  );

  // =========================================================================
  // SUITE 4: High-Frequency Mutation Stress Resilience (10,000 Operations)
  // =========================================================================
  console.log('\n--- SUITE 4: High-Frequency Mutation Stress Resilience ---');

  const CHAMPFROGS_KEYS = [
    'ACCEPTANCE', 'CURIOSITY', 'FREEDOM', 'GOAL', 'HONOR',
    'MASTERY', 'ORDER', 'POWER', 'RELATEDNESS', 'STATUS'
  ];

  function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const stressStartTime = Date.now();
  const TOTAL_OPERATIONS = 10_000;
  let errorCount = 0;

  for (let i = 0; i < TOTAL_OPERATIONS; i++) {
    try {
      const opType = i % 4;
      const targetUser = expectedMembers[i % 5];

      if (opType === 0) {
        // Perspective switch
        useDemoStore.getState().switchActiveUser(targetUser.id);
        const active = useDemoStore.getState().getActiveUser();
        if (active.id !== targetUser.id) {
          errorCount++;
        }
      } else if (opType === 1) {
        // Motivator permutation mutation
        const permuted = shuffle(CHAMPFROGS_KEYS);
        useDemoStore.getState().updateMotivatorRanking(targetUser.id, permuted);
        const stored = useDemoStore.getState().motivators[targetUser.id];
        if (!stored || stored.length !== 10) {
          errorCount++;
        }
      } else if (opType === 2) {
        // TeenBoard element append
        useDemoStore.getState().addTeenBoardElement({
          id: `stress-elem-${i}`,
          type: 'sticky',
          x: (i * 13) % 1000,
          y: (i * 17) % 800,
          width: 150,
          height: 150,
          content: `Stress item #${i}`,
          color: '#3B82F6',
          createdBy: targetUser.id,
        });
      } else if (opType === 3) {
        // Role switch & verification
        const roleToSwitch = i % 2 === 0 ? 'leader' : 'member';
        useDemoStore.getState().switchRole(roleToSwitch);
        const active = useDemoStore.getState().getActiveUser();
        if (active.role !== roleToSwitch) {
          errorCount++;
        }
      }

      // Periodic mid-stress reset every 2,500 operations
      if ((i + 1) % 2500 === 0) {
        useDemoStore.getState().resetToInitial();
        const activeAfterReset = useDemoStore.getState().getActiveUser();
        if (activeAfterReset.id !== 'demo-user-anna') {
          errorCount++;
        }
      }
    } catch (err) {
      errorCount++;
      console.error(`Crash at mutation #${i}:`, err);
    }
  }

  const stressDuration = Date.now() - stressStartTime;

  assert(
    'Stress Resilience',
    `10,000 successive state mutations completed without exceptions (Duration: ${stressDuration}ms)`,
    errorCount === 0,
    `Error count: ${errorCount}`
  );

  // Final cleanup and state check
  useDemoStore.getState().resetToInitial();
  const finalState = useDemoStore.getState();

  assert(
    'Stress Resilience',
    'Store fully recovers and maintains consistency after 10,000 mutations',
    finalState.activeUserId === 'demo-user-anna' &&
      finalState.members.length === 5 &&
      finalState.teenboardElements.length === DEMO_TEENBOARD_ELEMENTS.length,
    `Members: ${finalState.members.length}, Elements: ${finalState.teenboardElements.length}`
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n' + '='.repeat(80));
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`VERIFICATION SUMMARY: ${passed}/${total} assertions passed.`);
  if (failed > 0) {
    console.error(`❌ ${failed} ASSERTIONS FAILED!`);
    process.exit(1);
  } else {
    console.log(`✅ 100% EMPIRICAL PASS. Demo store is robust, immutable, and resilient.`);
    process.exit(0);
  }
}

runEmpiricalVerification().catch((err) => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
