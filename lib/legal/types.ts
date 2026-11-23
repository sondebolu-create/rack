/**
 * The legal pages are plain data, so the text can change without touching the layout.
 * Inline: **bold**. Email addresses become tap-to-email links automatically.
 */
export type LegalBlock =
  | { p: string }
  | { ul: string[] }
  | { table: { head: string[]; rows: string[][] } };

export type LegalSectionData = { heading: string; blocks: LegalBlock[] };

export type LegalDoc = {
  title: string;
  /** Shown as "Last updated: …" under the title. */
  updated: string;
  /** Opening paragraphs before the numbered sections. */
  intro?: string[];
  sections: LegalSectionData[];
};
