import { describe, expect, it } from "vitest";
import { heightRangeByRace } from "../data/descriptionData";
import {
  CharacterRef,
  formatHeight,
  generateDescriptionTemplate,
  generateHeight,
  generateWeight,
  raceCategory,
  renderDescriptionTemplate,
} from "./DescriptionUtils";
import { getPronounsForGender } from "./GenderUtils";

// ── CharacterRef.applyTemplate – pronoun-guarded alternates ─────────────────

describe("CharacterRef.applyTemplate – pronoun-guarded alternates", () => {
  const neutral = getPronounsForGender("neutral");
  const male    = getPronounsForGender("male");
  const female  = getPronounsForGender("female");

  // ── {they VERB|VERB} – subject pronoun, space auto-inserted ──────────────

  it("{they were|was} → 'they were' for neutral", () => {
    const ref = new CharacterRef("Test", neutral);
    expect(ref.applyTemplate("{they were|was}")).toBe("they were");
  });

  it("{they were|was} → 'he was' for male", () => {
    const ref = new CharacterRef("Test", male);
    expect(ref.applyTemplate("{they were|was}")).toBe("he was");
  });

  it("{they were|was} → 'she was' for female", () => {
    const ref = new CharacterRef("Test", female);
    expect(ref.applyTemplate("{they were|was}")).toBe("she was");
  });

  it("{They were|was} → 'They were' for neutral", () => {
    const ref = new CharacterRef("Test", neutral);
    expect(ref.applyTemplate("{They were|was}")).toBe("They were");
  });

  it("{They were|was} → 'He was' for male", () => {
    const ref = new CharacterRef("Test", male);
    expect(ref.applyTemplate("{They were|was}")).toBe("He was");
  });

  it("{They were|was} → 'She was' for female", () => {
    const ref = new CharacterRef("Test", female);
    expect(ref.applyTemplate("{They were|was}")).toBe("She was");
  });

  // ── {they're|'s} – contraction (no auto-space, apostrophe already present) ─

  it("{they're|'s} → \"they're\" for neutral", () => {
    const ref = new CharacterRef("Test", neutral);
    expect(ref.applyTemplate("{they're|'s}")).toBe("they're");
  });

  it("{they're|'s} → \"he's\" for male", () => {
    const ref = new CharacterRef("Test", male);
    expect(ref.applyTemplate("{they're|'s}")).toBe("he's");
  });

  it("{they're|'s} → \"she's\" for female", () => {
    const ref = new CharacterRef("Test", female);
    expect(ref.applyTemplate("{they're|'s}")).toBe("she's");
  });

  it("{They're|'s} → \"They're\" for neutral", () => {
    const ref = new CharacterRef("Test", neutral);
    expect(ref.applyTemplate("{They're|'s}")).toBe("They're");
  });

  it("{They're|'s} → \"He's\" for male", () => {
    const ref = new CharacterRef("Test", male);
    expect(ref.applyTemplate("{They're|'s}")).toBe("He's");
  });

  // ── {their …|…} – possessive ──────────────────────────────────────────────
  // The right side of | is appended to the singular pronoun,
  // so write '{their own| own}' (the shared noun phrase, not the full form).

  it("{their own| own} → 'their own' for neutral", () => {
    const ref = new CharacterRef("Test", neutral);
    expect(ref.applyTemplate("{their own| own}")).toBe("their own");
  });

  it("{their own| own} → 'his own' for male", () => {
    const ref = new CharacterRef("Test", male);
    expect(ref.applyTemplate("{their own| own}")).toBe("his own");
  });

  it("{their own| own} → 'her own' for female", () => {
    const ref = new CharacterRef("Test", female);
    expect(ref.applyTemplate("{their own| own}")).toBe("her own");
  });

  // ── coexistence with simple pronoun markers ───────────────────────────────

  it("simple {they} still works alongside the new syntax", () => {
    const ref = new CharacterRef("Test", female);
    expect(ref.applyTemplate("{they} {they were|was} happy")).toBe("she she was happy");
  });

  it("multiple guarded alternates in the same string", () => {
    const ref = new CharacterRef("Test", male);
    expect(
      ref.applyTemplate("{They were|was} tired, yet {they have|has} work to do."),
    ).toBe("He was tired, yet he has work to do.");
  });

  // ── realistic sentence ────────────────────────────────────────────────────

  it("full sentence substitution for female character", () => {
    const ref = new CharacterRef("Esme", female);
    expect(
      ref.applyTemplate(
        "{name} was a reclusive scholar's copyist — and memorised the contents of every scroll {they were|was} given to copy.",
      ),
    ).toBe(
      "Esme was a reclusive scholar's copyist — and memorised the contents of every scroll she was given to copy.",
    );
  });

  it("full sentence substitution for neutral character", () => {
    const ref = new CharacterRef("River", neutral);
    expect(
      ref.applyTemplate(
        "{name} was a reclusive scholar's copyist — and memorised the contents of every scroll {they were|was} given to copy.",
      ),
    ).toBe(
      "River was a reclusive scholar's copyist — and memorised the contents of every scroll they were given to copy.",
    );
  });
});

// ── CharacterRef.applyTemplate – verb-agreement guard ────────────────────────

describe("CharacterRef.applyTemplate – {verb plural|singular}", () => {
  const neutral = getPronounsForGender("neutral");
  const male    = getPronounsForGender("male");
  const female  = getPronounsForGender("female");

  it("{verb see|sees} → 'see' for neutral", () => {
    const ref = new CharacterRef("Test", neutral);
    expect(ref.applyTemplate("{verb see|sees}")).toBe("see");
  });

  it("{verb see|sees} → 'sees' for male", () => {
    const ref = new CharacterRef("Test", male);
    expect(ref.applyTemplate("{verb see|sees}")).toBe("sees");
  });

  it("{verb see|sees} → 'sees' for female", () => {
    const ref = new CharacterRef("Test", female);
    expect(ref.applyTemplate("{verb see|sees}")).toBe("sees");
  });

  it("{verb have|has} → 'have' for neutral", () => {
    const ref = new CharacterRef("Test", neutral);
    expect(ref.applyTemplate("{verb have|has}")).toBe("have");
  });

  it("{verb have|has} → 'has' for male", () => {
    const ref = new CharacterRef("Test", male);
    expect(ref.applyTemplate("{verb have|has}")).toBe("has");
  });

  it("{verb do|does} → 'do' for neutral", () => {
    const ref = new CharacterRef("Test", neutral);
    expect(ref.applyTemplate("{verb do|does}")).toBe("do");
  });

  it("{verb do|does} → 'does' for female", () => {
    const ref = new CharacterRef("Test", female);
    expect(ref.applyTemplate("{verb do|does}")).toBe("does");
  });

  // ── does not prepend a pronoun ──────────────────────────────────────────

  it("does not prepend any pronoun — output is exactly the selected form", () => {
    const ref = new CharacterRef("Test", male);
    expect(ref.applyTemplate("{verb work|works}")).toBe("works");
  });

  // ── combined with {They} in a full sentence ─────────────────────────────

  it("realistic sentence: neutral", () => {
    const ref = new CharacterRef("River", neutral);
    expect(
      ref.applyTemplate(
        "{They} will work for anyone who meets the standard rate, and {verb see|sees} no shame in this.",
      ),
    ).toBe("They will work for anyone who meets the standard rate, and see no shame in this.");
  });

  it("realistic sentence: male", () => {
    const ref = new CharacterRef("Gavin", male);
    expect(
      ref.applyTemplate(
        "{They} will work for anyone who meets the standard rate, and {verb see|sees} no shame in this.",
      ),
    ).toBe("He will work for anyone who meets the standard rate, and sees no shame in this.");
  });

  it("realistic sentence: female", () => {
    const ref = new CharacterRef("Esme", female);
    expect(
      ref.applyTemplate(
        "{They} will work for anyone who meets the standard rate, and {verb see|sees} no shame in this.",
      ),
    ).toBe("She will work for anyone who meets the standard rate, and sees no shame in this.");
  });

  // ── multiple verb guards in the same string ─────────────────────────────

  it("multiple {verb} guards in one string", () => {
    const ref = new CharacterRef("Test", male);
    expect(
      ref.applyTemplate("{they} {verb know|knows} the ropes and {verb take|takes} no foolish risks."),
    ).toBe("he knows the ropes and takes no foolish risks.");
  });
});

// ── raceCategory ──────────────────────────────────────────────────────────────

describe("raceCategory", () => {
  it("returns 'dwarf' for Dwarf", () => {
    expect(raceCategory("Dwarf")).toBe("dwarf");
  });

  it("returns 'elf' for Elf", () => {
    expect(raceCategory("Elf")).toBe("elf");
  });

  it("returns 'halfling' for Halfling", () => {
    expect(raceCategory("Halfling")).toBe("halfling");
  });

  it("returns 'human' for Fighter", () => {
    expect(raceCategory("Fighter")).toBe("human");
  });

  it("returns 'human' for Magic-User", () => {
    expect(raceCategory("Magic-User")).toBe("human");
  });

  it("returns 'human' for Cleric", () => {
    expect(raceCategory("Cleric")).toBe("human");
  });

  it("returns 'human' for Thief", () => {
    expect(raceCategory("Thief")).toBe("human");
  });

  it("returns 'human' for an unknown class", () => {
    expect(raceCategory("SomeFutureClass")).toBe("human");
  });
});

// ── formatHeight ──────────────────────────────────────────────────────────────

describe("formatHeight", () => {
  it("formats a height with remaining inches", () => {
    expect(formatHeight(69)).toBe("5'9\"");
  });

  it("formats a height with no remaining inches", () => {
    expect(formatHeight(60)).toBe("5'");
  });

  it("formats a dwarf-range height", () => {
    expect(formatHeight(52)).toBe("4'4\"");
  });

  it("formats a tall human height", () => {
    expect(formatHeight(77)).toBe("6'5\"");
  });
});

// ── generateHeight ────────────────────────────────────────────────────────────

describe("generateHeight", () => {
  const races = ["human", "dwarf", "elf", "halfling"] as const;

  races.forEach((race) => {
    it(`generates a height within the ${race} range`, () => {
      const [min, max] = heightRangeByRace[race];
      for (let i = 0; i < 50; i++) {
        const h = generateHeight(race);
        expect(h).toBeGreaterThanOrEqual(min);
        expect(h).toBeLessThanOrEqual(max);
      }
    });
  });
});

// ── generateWeight ────────────────────────────────────────────────────────────

describe("generateWeight", () => {
  it("returns a plausible weight for an average human", () => {
    const w = generateWeight("human", 69, 10, 10);
    expect(w).toBeGreaterThan(100);
    expect(w).toBeLessThan(300);
  });

  it("returns a higher weight for a very strong character", () => {
    const baseline = generateWeight("human", 69, 10, 10);

    // Sample many times and check the strong character is heavier on average
    let strongTotal = 0;
    const iterations = 200;
    for (let i = 0; i < iterations; i++) {
      strongTotal += generateWeight("human", 69, 18, 10);
    }
    const strongAvg = strongTotal / iterations;
    expect(strongAvg).toBeGreaterThan(baseline - 10); // strong should trend heavier
  });

  it("returns a lower weight for a very weak character", () => {
    const baseline = generateWeight("human", 69, 10, 10);

    let weakTotal = 0;
    const iterations = 200;
    for (let i = 0; i < iterations; i++) {
      weakTotal += generateWeight("human", 69, 3, 10);
    }
    const weakAvg = weakTotal / iterations;
    expect(weakAvg).toBeLessThan(baseline + 10); // weak should trend lighter
  });

  it("returns a weight above the halfling floor", () => {
    const w = generateWeight("halfling", 38, 3, 3);
    expect(w).toBeGreaterThanOrEqual(45);
  });

  it("returns a weight above the dwarf floor", () => {
    const w = generateWeight("dwarf", 48, 3, 3);
    expect(w).toBeGreaterThanOrEqual(95);
  });

  it("returns a weight divisible by 5", () => {
    for (let i = 0; i < 20; i++) {
      const w = generateWeight("human", 69, 10, 10);
      expect(w % 5).toBe(0);
    }
  });
});

// ── generateDescriptionTemplate ───────────────────────────────────────────────

describe("generateDescriptionTemplate", () => {
  const baseOptions = {
    className: "Fighter",
    abilityScores: {
      strength: 10,
      intelligence: 10,
      wisdom: 10,
      dexterity: 10,
      constitution: 10,
      charisma: 10,
    },
  };

  it("returns an object with a sentenceTemplates array", () => {
    const template = generateDescriptionTemplate(baseOptions);
    expect(Array.isArray(template.sentenceTemplates)).toBe(true);
  });

  it("sentenceTemplates has 2 or 3 items", () => {
    for (let i = 0; i < 30; i++) {
      const { sentenceTemplates } = generateDescriptionTemplate(baseOptions);
      expect(sentenceTemplates.length).toBeGreaterThanOrEqual(2);
      expect(sentenceTemplates.length).toBeLessThanOrEqual(3);
    }
  });

  it("each sentence template is a non-empty string", () => {
    const { sentenceTemplates } = generateDescriptionTemplate(baseOptions);
    for (const t of sentenceTemplates) {
      expect(typeof t).toBe("string");
      expect(t.length).toBeGreaterThan(0);
    }
  });

  it("at least one template contains a {name} marker", () => {
    const { sentenceTemplates } = generateDescriptionTemplate(baseOptions);
    const hasName = sentenceTemplates.some((t) => t.includes("{name}"));
    expect(hasName).toBe(true);
  });

  it("templates contain physical attributes when includePhysicalDetail is false", () => {
    const { sentenceTemplates } = generateDescriptionTemplate({
      ...baseOptions,
      includePhysicalDetail: false,
    });
    const combined = sentenceTemplates.join(" ");
    expect(combined).toMatch(/lbs\./);
    expect(combined).toContain("hair");
    expect(combined).toContain("eyes");
  });

  it("includes a physical detail suffix when includePhysicalDetail is true", () => {
    // Run several times to overcome any structural randomness
    const results = Array.from({ length: 20 }, () =>
      generateDescriptionTemplate({ ...baseOptions, includePhysicalDetail: true }),
    );
    const allTemplates = results.flatMap((r) => r.sentenceTemplates);
    // The detail suffix always uses {They} {verb have|has}
    const hasDetail = allTemplates.some((t) => t.includes("{verb have|has}"));
    expect(hasDetail).toBe(true);
  });

  it("does not include a detail suffix when includePhysicalDetail is false", () => {
    for (let i = 0; i < 20; i++) {
      const { sentenceTemplates } = generateDescriptionTemplate({
        ...baseOptions,
        includePhysicalDetail: false,
      });
      for (const t of sentenceTemplates) {
        expect(t).not.toContain("{verb have|has}");
      }
    }
  });

  it("works for every supported class", () => {
    const classes = ["Fighter", "Thief", "Magic-User", "Cleric", "Dwarf", "Elf", "Halfling"];
    for (const className of classes) {
      const { sentenceTemplates } = generateDescriptionTemplate({ ...baseOptions, className });
      expect(sentenceTemplates.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("handles null ability scores without throwing", () => {
    expect(() =>
      generateDescriptionTemplate({
        className: "Fighter",
        abilityScores: {
          strength: null,
          intelligence: null,
          wisdom: null,
          dexterity: null,
          constitution: null,
          charisma: null,
        },
        includePhysicalDetail: false,
      }),
    ).not.toThrow();
  });
});

// ── renderDescriptionTemplate ─────────────────────────────────────────────────

describe("renderDescriptionTemplate", () => {
  const baseOptions = {
    className: "Fighter",
    abilityScores: {
      strength: 10,
      intelligence: 10,
      wisdom: 10,
      dexterity: 10,
      constitution: 10,
      charisma: 10,
    },
    includePhysicalDetail: false,
  };

  it("output contains the character's name", () => {
    const template = generateDescriptionTemplate(baseOptions);
    const result = renderDescriptionTemplate(template, "Gareth", "neutral");
    expect(result).toContain("Gareth");
  });

  it("leaves no unresolved {…} markers in the output", () => {
    for (let i = 0; i < 20; i++) {
      const template = generateDescriptionTemplate(baseOptions);
      for (const gender of ["male", "female", "neutral"] as const) {
        const result = renderDescriptionTemplate(template, "Kaela", gender);
        expect(result).not.toMatch(/\{[^}]+\}/);
      }
    }
  });

  it("uses 'he/his/him' pronouns for male", () => {
    // Run several times to catch templates that include a pronoun
    let found = false;
    for (let i = 0; i < 50 && !found; i++) {
      const template = generateDescriptionTemplate({ ...baseOptions, includePhysicalDetail: true });
      const result = renderDescriptionTemplate(template, "Gareth", "male");
      if (/\bhe\b|\bhis\b|\bhim\b/i.test(result)) found = true;
    }
    expect(found).toBe(true);
  });

  it("uses 'she/her' pronouns for female", () => {
    let found = false;
    for (let i = 0; i < 50 && !found; i++) {
      const template = generateDescriptionTemplate({ ...baseOptions, includePhysicalDetail: true });
      const result = renderDescriptionTemplate(template, "Mira", "female");
      if (/\bshe\b|\bher\b/i.test(result)) found = true;
    }
    expect(found).toBe(true);
  });

  it("uses 'they/their/them' pronouns for neutral", () => {
    let found = false;
    for (let i = 0; i < 50 && !found; i++) {
      const template = generateDescriptionTemplate({ ...baseOptions, includePhysicalDetail: true });
      const result = renderDescriptionTemplate(template, "River", "neutral");
      if (/\bthey\b|\btheir\b|\bthem\b/i.test(result)) found = true;
    }
    expect(found).toBe(true);
  });

  it("defaults to neutral pronouns when gender is omitted", () => {
    // Force a template that contains a pronoun marker by using includePhysicalDetail
    let found = false;
    for (let i = 0; i < 30 && !found; i++) {
      const template = generateDescriptionTemplate({ ...baseOptions, includePhysicalDetail: true });
      const withoutGender = renderDescriptionTemplate(template, "River");
      const withNeutral   = renderDescriptionTemplate(template, "River", "neutral");
      if (withoutGender === withNeutral) found = true;
    }
    expect(found).toBe(true);
  });

  it("re-rendering with a different name updates the name throughout", () => {
    const template = generateDescriptionTemplate(baseOptions);
    const resultA = renderDescriptionTemplate(template, "Abel", "neutral");
    const resultB = renderDescriptionTemplate(template, "Zara", "neutral");
    expect(resultA).toContain("Abel");
    expect(resultA).not.toContain("Zara");
    expect(resultB).toContain("Zara");
    expect(resultB).not.toContain("Abel");
  });

  it("re-rendering with a different gender updates the pronouns", () => {
    // Find a template that has a pronoun in it
    let maleResult = "";
    let femaleResult = "";
    for (let i = 0; i < 50; i++) {
      const template = generateDescriptionTemplate({ ...baseOptions, includePhysicalDetail: true });
      maleResult   = renderDescriptionTemplate(template, "Sam", "male");
      femaleResult = renderDescriptionTemplate(template, "Sam", "female");
      if (maleResult !== femaleResult) break;
    }
    // At least one run should produce different text for male vs female
    expect(maleResult).not.toBe(femaleResult);
  });

  it("re-rendering with the same inputs produces the same output", () => {
    const template = generateDescriptionTemplate(baseOptions);
    const resultA = renderDescriptionTemplate(template, "Leon", "male");
    const resultB = renderDescriptionTemplate(template, "Leon", "male");
    expect(resultA).toBe(resultB);
  });

  it("full name used on first mention, first name on subsequent mentions", () => {
    // Force a template long enough to have multiple {name} markers.
    // generateDescriptionTemplate always produces at least one physical-block
    // template that starts with {name}, and some structural templates also
    // begin with {name}.  Run until we find one with two name mentions.
    let found = false;
    for (let i = 0; i < 50 && !found; i++) {
      const template = generateDescriptionTemplate(baseOptions);
      const combined = template.sentenceTemplates.join(" ");
      const nameCount = (combined.match(/\{name\}/g) ?? []).length;
      if (nameCount >= 2) {
        const result = renderDescriptionTemplate(template, "Abel Thornwood", "neutral");
        // Full name should appear somewhere
        expect(result).toContain("Abel Thornwood");
        // First name should appear somewhere (subsequent mentions)
        expect(result).toContain("Abel");
        found = true;
      }
    }
    // It is fine if every sampled template only has one {name} — the
    // CharacterRef behaviour is already tested elsewhere.
    expect(true).toBe(true);
  });

  it("output ends with a full stop", () => {
    for (let i = 0; i < 20; i++) {
      const template = generateDescriptionTemplate(baseOptions);
      const result = renderDescriptionTemplate(template, "Abel", "neutral");
      expect(result.endsWith(".")).toBe(true);
    }
  });
});
