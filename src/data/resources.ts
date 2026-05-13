export type ResourceKind = "worksheet" | "reading" | "prayer-journal";

export interface Resource {
  id: string;
  title: string;
  description: string;
  kind: ResourceKind;
  category: string; // therapy type
  // For real PDFs, replace with hosted URLs. Generated as text/plain so downloads work out of the box.
  content: string;
}

const journal = (focus: string) => `IACPD Guided Prayer Journal — ${focus}\n\nDay 1 — Stillness\n  • Scripture: Psalm 46:10\n  • Reflection: Where do I sense God's invitation today?\n  • Prayer:\n\nDay 2 — Surrender\n  • Scripture: Proverbs 3:5-6\n  • Reflection: What am I holding that I need to release?\n  • Prayer:\n\nDay 3 — Gratitude\n  • Scripture: 1 Thessalonians 5:18\n  • Reflection: Three gifts of grace I notice today.\n  • Prayer:\n\nDay 4 — Healing\n  • Scripture: Isaiah 41:10\n  • Reflection: Naming the wound, inviting the Healer.\n  • Prayer:\n\nDay 5 — Hope\n  • Scripture: Romans 15:13\n  • Reflection: Where is hope rising in me?\n  • Prayer:\n`;

const worksheet = (title: string, prompts: string[]) =>
  `IACPD Worksheet — ${title}\n\n${prompts.map((p, i) => `${i + 1}. ${p}\n   _________________________________________\n   _________________________________________\n`).join("\n")}`;

const reading = (title: string, body: string) =>
  `IACPD Reading — ${title}\n\n${body}`;

export const therapyCategories = [
  "Marriage & Family",
  "Mental Health",
  "Trauma & Crisis",
  "Career & Leadership",
  "Spiritual Growth",
] as const;

export const resources: Resource[] = [
  {
    id: "mf-comm",
    title: "Communication Builder for Couples",
    description: "A 5-step worksheet to deepen listening and rebuild trust.",
    kind: "worksheet",
    category: "Marriage & Family",
    content: worksheet("Communication Builder", [
      "What is one feeling I have struggled to name this week?",
      "When did I feel most heard by my spouse recently?",
      "Where is my heart hardening, and what truth softens it?",
      "A specific way I will love my spouse this week.",
      "A prayer for our home.",
    ]),
  },
  {
    id: "mf-prayer",
    title: "30-Day Marriage Prayer Journal",
    description: "Daily prompts to pray together as a couple.",
    kind: "prayer-journal",
    category: "Marriage & Family",
    content: journal("Marriage"),
  },
  {
    id: "mh-anx",
    title: "Anxiety Reframe Worksheet",
    description: "Identify, examine, and reframe anxious thoughts with Scripture.",
    kind: "worksheet",
    category: "Mental Health",
    content: worksheet("Anxiety Reframe", [
      "What is the anxious thought?",
      "What evidence supports or challenges it?",
      "Which Scripture speaks to this fear?",
      "A grounded, faith-filled reframe.",
      "One small obedient step today.",
    ]),
  },
  {
    id: "mh-read",
    title: "Faith & Mental Health: A Primer",
    description: "Understanding the integration of faith and clinical care.",
    kind: "reading",
    category: "Mental Health",
    content: reading(
      "Faith & Mental Health",
      "Mental health is not a measure of faith but a part of being human. Scripture honors lament (Psalms), names despair (Elijah), and invites us to bring our whole selves before God. Faith-integrated counseling holds clinical wisdom and Christ-centered hope together — addressing biology, story, and spirit.",
    ),
  },
  {
    id: "tr-ground",
    title: "Trauma Grounding Toolkit",
    description: "Sensory-based grounding practices anchored in God's presence.",
    kind: "worksheet",
    category: "Trauma & Crisis",
    content: worksheet("Grounding Toolkit", [
      "5 things I can see (and thank God for).",
      "4 things I can touch.",
      "3 sounds I can hear.",
      "2 scents I notice.",
      "1 truth from Psalm 23 I will speak aloud.",
    ]),
  },
  {
    id: "tr-prayer",
    title: "Healing Prayer Journal",
    description: "5-day journey through Scripture and lament.",
    kind: "prayer-journal",
    category: "Trauma & Crisis",
    content: journal("Healing"),
  },
  {
    id: "cl-purpose",
    title: "Calling & Career Clarity",
    description: "Discern vocation through gifts, burdens, and the Spirit.",
    kind: "worksheet",
    category: "Career & Leadership",
    content: worksheet("Calling Clarity", [
      "Where do my gifts and the world's needs meet?",
      "What burden has God repeatedly laid on my heart?",
      "Who has affirmed this in me?",
      "What is one faithful next step?",
      "A prayer of surrender for my work.",
    ]),
  },
  {
    id: "sg-prayer",
    title: "Daily Spiritual Formation Journal",
    description: "Practice Lectio Divina and silent prayer.",
    kind: "prayer-journal",
    category: "Spiritual Growth",
    content: journal("Spiritual Formation"),
  },
  {
    id: "sg-read",
    title: "Rhythms of Rest",
    description: "A short reading on Sabbath as restorative practice.",
    kind: "reading",
    category: "Spiritual Growth",
    content: reading(
      "Rhythms of Rest",
      "Sabbath is not a reward for productivity — it is a return to belovedness. To rest is to declare that the world holds together not by my striving but by the One who sustains all things. Begin small: a meal unhurried, a phone set down, a psalm read aloud.",
    ),
  },
];

export const downloadResource = (r: Resource) => {
  const blob = new Blob([r.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${r.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
