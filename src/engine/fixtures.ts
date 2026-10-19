/**
 * Test fixtures. Provenance is noted per grid:
 *  - "published": a well-known grid (source named). The sandbox had no access to
 *    sudokuwiki.org / Sudopedia, so these were recalled and each is re-verified
 *    here by the solver (unique, and the technique is asserted in the tests).
 *  - "searched": found by generating random irreducible puzzles with this
 *    engine's own solver and picking one that genuinely needs the technique.
 */
import { Technique } from './techniques';

export interface TechniqueFixture {
  name: string;
  puzzle: string;
  source: 'published' | 'searched';
  /** Technique that must appear among the analysis steps. */
  technique: Technique;
  /** The hardest technique the analysis must report. */
  hardest: Technique;
}

export const TECHNIQUE_FIXTURES: TechniqueFixture[] = [
  {
    name: 'naked/hidden singles (Wikipedia example puzzle)',
    puzzle: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
    source: 'published',
    technique: Technique.NakedSingle,
    hardest: Technique.NakedSingle,
  },
  {
    name: 'locked candidates',
    puzzle: '000700560070000000600035098000000000100000203350001079090400600200060000860007304',
    source: 'searched',
    technique: Technique.LockedCandidates,
    hardest: Technique.LockedCandidates,
  },
  {
    name: 'naked pair',
    puzzle: '000100008000030000000007020001500000030000901026910850005000002060348000019006047',
    source: 'searched',
    technique: Technique.NakedPair,
    hardest: Technique.NakedPair,
  },
  {
    name: 'hidden pair',
    puzzle: '000007000000500140004000000100008073000030900030075420801000030905000204700060809',
    source: 'searched',
    technique: Technique.HiddenPair,
    hardest: Technique.HiddenPair,
  },
  {
    name: 'naked triple',
    puzzle: '006000000709800000040007000000000300000001074010403028401070800800090530030100090',
    source: 'searched',
    technique: Technique.NakedTriple,
    hardest: Technique.NakedTriple,
  },
  {
    name: 'hidden triple',
    puzzle: '000000000004015300005028409000000000907250064840007030009030008200049000000060200',
    source: 'searched',
    technique: Technique.HiddenTriple,
    hardest: Technique.HiddenTriple,
  },
  {
    name: 'naked quad',
    puzzle: '100080790400200006007600005000000017003000000005000200749010000800003000000790000',
    source: 'searched',
    technique: Technique.NakedQuad,
    hardest: Technique.NakedQuad,
  },
  {
    name: 'hidden quad',
    puzzle: '008009004209064508700050020006000000001070005020100900000890001000000050000000307',
    source: 'searched',
    technique: Technique.HiddenQuad,
    hardest: Technique.HiddenQuad,
  },
  {
    name: 'X-Wing (sudokuwiki.org X-Wing example)',
    puzzle: '100000569492056108056109240009640801064010000218035604040500016905061402621000005',
    source: 'published',
    technique: Technique.XWing,
    hardest: Technique.XWing,
  },
  {
    name: 'Swordfish',
    puzzle: '900000700028450900041000000030072008000000000410000030000068200800000000070523006',
    source: 'searched',
    technique: Technique.Swordfish,
    hardest: Technique.Swordfish,
  },
  {
    name: 'XY-Wing',
    puzzle: '050000000080006500100000063900060300826090010300705900000601000000007001000940672',
    source: 'searched',
    technique: Technique.XYWing,
    hardest: Technique.XYWing,
  },
];

/** One fixture per difficulty level (indexes into the Difficulty enum order). */
export const GRADE_FIXTURES = {
  easy: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
  medium: '000100008000030000000007020001500000030000901026910850005000002060348000019006047',
  hard: '100000569492056108056109240009640801064010000218035604040500016905061402621000005',
  extreme: '900000700028450900041000000030072008000000000410000030000068200800000000070523006',
  // Arto Inkala's 2012 puzzle: no technique here applies at all.
  almostImpossible: '800000000003600000070090200050007000000045700000100030001000068008500010090000400',
  // AI Escargot: stalls the implemented techniques too.
  escargot: '1....7.9..3..2...8..96..5....53..9...1..8...26....4...3......1..4......7..7...3..',
};
