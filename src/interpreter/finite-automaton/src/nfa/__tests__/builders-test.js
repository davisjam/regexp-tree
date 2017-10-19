/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

const NFA = require('../nfa');
const NFAState = require('../nfa-state');

const {
  EPSILON,
} = require('../../special-symbols');

const {
  alt,
  char,
  e,
  or,
  rep,
} = require('../builders');

function setIndex(set, index) {
  return [...set][index];
}

describe('nfa-builders', () => {

  it('char', () => {
    const a = char('a');

    expect(a).toBeInstanceOf(NFA);
    expect(a.in).toBeInstanceOf(NFAState);
    expect(a.out).toBeInstanceOf(NFAState);

    expect(a.in.accepting).toBe(false);
    expect(a.out.accepting).toBe(true);

    expect(a.in.getTransitionsOnSymbol('a').size).toBe(1);
    expect(a.in.getTransitionsOnSymbol('a')).toEqual(new Set([a.out]));
  });

  it('e', () => {
    const epsilon = e();

    expect(epsilon).toBeInstanceOf(NFA);
    expect(epsilon.in).toBeInstanceOf(NFAState);
    expect(epsilon.out).toBeInstanceOf(NFAState);

    expect(epsilon.in.accepting).toBe(false);
    expect(epsilon.out.accepting).toBe(true);

    expect(epsilon.in.getTransitionsOnSymbol(EPSILON).size).toBe(1);
    expect(epsilon.in.getTransitionsOnSymbol(EPSILON))
      .toEqual(new Set([epsilon.out]));
  });

  it('or', () => {
    const a = char('a');
    const b = char('b');
    const c = char('c');

    // Before patching chars are accepting.
    expect(a.out.accepting).toBe(true);
    expect(b.out.accepting).toBe(true);
    expect(c.out.accepting).toBe(true);

    const AorBorC = or(a, b, c);

    expect(AorBorC).toBeInstanceOf(NFA);

    // After patching chars out are not accepting.
    expect(a.out.accepting).toBe(false);
    expect(b.out.accepting).toBe(false);
    expect(c.out.accepting).toBe(false);
    expect(AorBorC.out.accepting).toBe(true);

    const AorB = setIndex(AorBorC.in.getTransitionsOnSymbol(EPSILON), 0);

    const partA = setIndex(AorB.getTransitionsOnSymbol(EPSILON), 0);
    const partB = setIndex(AorB.getTransitionsOnSymbol(EPSILON), 1);

    expect(partA).toBe(a.in);
    expect(partB).toBe(b.in);

    const partC = setIndex(AorBorC.in.getTransitionsOnSymbol(EPSILON), 1);
    expect(partC).toBe(c.in);

    const outFromB = setIndex(
      setIndex(b.out.getTransitionsOnSymbol(EPSILON), 0)
        .getTransitionsOnSymbol(EPSILON),
      0
    );

    expect(outFromB).toBe(AorBorC.out);

    const outFromC = setIndex(c.out.getTransitionsOnSymbol(EPSILON), 0);
    expect(outFromC).toBe(AorBorC.out);
  });

  it('alt', () => {
    const a = char('a');
    const b = char('b');
    const c = char('c');

    // Before patching chars are accepting.
    expect(a.out.accepting).toBe(true);
    expect(b.out.accepting).toBe(true);
    expect(c.out.accepting).toBe(true);

    const ABC = alt(a, b, c);

    expect(ABC).toBeInstanceOf(NFA);

    // After patching chars out are not accepting.
    expect(a.out.accepting).toBe(false);
    expect(b.out.accepting).toBe(false);
    expect(c.out.accepting).toBe(true);

    expect(ABC.in).toBe(a.in);
    expect(ABC.out).toBe(c.out);

    expect(setIndex(a.out.getTransitionsOnSymbol(EPSILON), 0))
      .toBe(b.in);

    expect(setIndex(b.out.getTransitionsOnSymbol(EPSILON), 0))
      .toBe(c.in);
  });

  it('kleene-closure', () => {
    const a = char('a');
    const aRep = rep(a);

    expect(aRep).toBeInstanceOf(NFA);

    const partA = setIndex(aRep.out.getTransitionsOnSymbol(EPSILON), 0);
    expect(partA).toBe(a.in);

    const partEpsilon = setIndex(aRep.in.getTransitionsOnSymbol(EPSILON), 1);

    expect(partEpsilon.accepting).toBe(true);
    expect(partEpsilon).toBe(aRep.out);

    const backToA = setIndex(aRep.out.getTransitionsOnSymbol(EPSILON), 0);
    expect(backToA).toBe(a.in);
  });

});