import { db } from "@/lib/db";
import * as bcrypt from "bcryptjs";

const SUBJECTS = [
  // COMPULSORY
  {
    slug: "current-affairs",
    name: "Current Affairs",
    category: "COMPULSORY",
    shortDesc: "Top 44 questions with detailed outlines + 25 full model answers, plus 2016–2025 past papers.",
    longDesc:
      "The most high-yield Current Affairs prep pack available. Topic-wise 44 most likely questions with detailed outlines, complete model answers for the 25 most important, and a thorough 2016–2025 past paper analysis (subjective + objective). Built around the CSS examiner's pattern — you walk in knowing exactly what to expect.",
    iconKey: "Newspaper",
    accentColor: "emerald",
    order: 1,
    pricePkr: 1500,
    questionsCount: 44,
    answersCount: 25,
    mcqsCount: 0,
    features: [
      "Top 44 Questions (topic-wise) with detailed outlines",
      "Full model answers for 25 most important questions",
      "Past Papers 2016–2025 (subjective + objective)",
      "Thorough past paper analysis",
    ],
    samples: [
      { q: "Evaluate the impact of CPEC on Pakistan's economy and regional connectivity.", likelihood: "high" },
      { q: "Discuss the evolving nature of Pak-US relations in the post-withdrawal Afghanistan scenario.", likelihood: "high" },
      { q: "Analyze the role of OIC in resolving the Palestine issue.", likelihood: "medium" },
    ],
  },
  {
    slug: "essay",
    name: "Essay",
    category: "COMPULSORY",
    shortDesc: "Top 25 topics with detailed outlines + most expected full model essays, plus past papers.",
    longDesc:
      "Master the CSS Essay paper. Topic-wise top 25 topics with detailed outlines, full model essays for the most expected ones, and complete 2016–2025 past paper analysis with all topics ever asked. Includes thesis-building techniques, structure templates, and examiner expectations.",
    iconKey: "PenLine",
    accentColor: "emerald",
    order: 2,
    pricePkr: 1500,
    questionsCount: 25,
    answersCount: 8,
    mcqsCount: 0,
    features: [
      "Top 25 Topics (topic-wise) with detailed outlines",
      "Most expected full model essays",
      "Past Papers 2016–2025 — all topics asked",
      "Thorough past paper analysis",
    ],
    samples: [
      { q: "Sometimes we do not see what we see — explore the paradox.", likelihood: "high" },
      { q: "Global warming: fact or fiction?", likelihood: "high" },
      { q: "The crisis of good governance in Pakistan.", likelihood: "medium" },
    ],
  },
  {
    slug: "gsa",
    name: "General Science & Ability (GSA)",
    category: "COMPULSORY",
    shortDesc: "All most likely questions + full answers for the General Science portion, plus 2016–2025 past papers.",
    longDesc:
      "Complete GSA prep — every most likely question topic-wise with full model answers for the General Science portion. Includes ability/quant section strategies and a full 2016–2025 past paper analysis. Designed so you cover exactly what the examiner asks.",
    iconKey: "Atom",
    accentColor: "emerald",
    order: 3,
    pricePkr: 1500,
    questionsCount: 38,
    answersCount: 22,
    mcqsCount: 0,
    features: [
      "All most likely questions (topic-wise) for General Science portion",
      "Full model answers for the General Science portion",
      "Past Papers 2016–2025 (all subjective questions)",
      "Thorough past paper analysis",
    ],
    samples: [
      { q: "Discuss the causes of earthquakes and the precautionary measures to reduce their impact.", likelihood: "high" },
      { q: "Explain the working principle of a microwave oven.", likelihood: "high" },
      { q: "Differentiate between renewable and non-renewable energy resources.", likelihood: "medium" },
    ],
  },
  {
    slug: "islamic-studies",
    name: "Islamic Studies",
    category: "COMPULSORY",
    shortDesc: "44 most likely questions + guaranteed 25, full answers, 207-MCQ bank, past papers 2016–2025.",
    longDesc:
      "The complete Islamic Studies pack. 44 most likely questions topic-wise, a condensed guaranteed list of 25, outlines for all 44, full answers for all 44, plus a comprehensive 207-question MCQ bank covering everything possible. 2016–2025 past papers with analysis included.",
    iconKey: "Moon",
    accentColor: "emerald",
    order: 4,
    pricePkr: 1500,
    questionsCount: 44,
    answersCount: 44,
    mcqsCount: 207,
    features: [
      "44 Most Likely Questions (topic-wise)",
      "Condensed guaranteed list of 25 questions",
      "Detailed past paper analysis",
      "Outlines for all 44 questions",
      "Comprehensive Objective MCQs Bank (207 questions)",
      "Full answers for all 44 questions",
      "Past Papers 2016–2025 (subjective + objective)",
    ],
    samples: [
      { q: "Discuss the administrative structure of the Islamic state established by the Holy Prophet (PBUH).", likelihood: "high" },
      { q: "Explain the concept of Ijtihad and its role in the modern Islamic world.", likelihood: "high" },
      { q: "Highlight the contributions of Muslim scientists during the Abbasid era.", likelihood: "medium" },
    ],
  },
  {
    slug: "pakistan-affairs",
    name: "Pakistan Affairs",
    category: "COMPULSORY",
    shortDesc: "50 most likely questions + guaranteed 20, 34 full answers, 250 dates, tiered MCQs, past papers.",
    longDesc:
      "The most comprehensive Pakistan Affairs prep pack available. 50 most likely questions topic-wise, condensed high-priority list of 20, outlines for 40 most likely questions, full answers for 34, the Ultimate 250 Dates Master List for MCQs, and a tiered MCQ list covering everything that can appear. 2016–2025 past papers with analysis.",
    iconKey: "Flag",
    accentColor: "emerald",
    order: 5,
    pricePkr: 1500,
    questionsCount: 50,
    answersCount: 34,
    mcqsCount: 250,
    features: [
      "50 Most Likely Questions (topic-wise)",
      "Condensed list of 20 high-priority questions",
      "Detailed past paper analysis",
      "Outlines for 40 most likely questions",
      "Ultimate 250 Dates Master List (for MCQs)",
      "Tiered MCQs list covering everything that can appear",
      "Full answers for 34 most likely questions",
      "Past Papers 2016–2025 (subjective + objective)",
    ],
    samples: [
      { q: "Critically analyze the role of Sir Syed Ahmad Khan in the renaissance of Muslims of the subcontinent.", likelihood: "high" },
      { q: "Discuss the circumstances that led to the creation of Bangladesh in 1971.", likelihood: "high" },
      { q: "Evaluate the administrative reforms introduced by Ayub Khan.", likelihood: "medium" },
    ],
  },
  {
    slug: "precis-composition",
    name: "Precis & Composition",
    category: "COMPULSORY",
    shortDesc: "Detailed paper structure and pattern, plus thorough past paper analysis.",
    longDesc:
      "A focused, exam-oriented guide to the Precis & Composition paper. Detailed breakdown of paper structure and pattern, with a thorough past paper analysis so you know exactly what to expect in each section.",
    iconKey: "FileText",
    accentColor: "emerald",
    order: 6,
    pricePkr: 1500,
    questionsCount: 12,
    answersCount: 6,
    mcqsCount: 0,
    features: [
      "Detailed paper structure and pattern",
      "Thorough past paper analysis",
      "Section-by-section approach",
    ],
    samples: [
      { q: "Make a precis of the passage and suggest a suitable title.", likelihood: "high" },
      { q: "Correct the following sentences and rewrite them.", likelihood: "high" },
      { q: "Use the following idiomatic expressions in sentences.", likelihood: "medium" },
    ],
  },

  // OPTIONAL
  {
    slug: "gender-studies",
    name: "Gender Studies",
    category: "OPTIONAL",
    shortDesc: "61 top questions + 22 guaranteed, 21 full answers, 250 MCQs, past papers.",
    longDesc:
      "The complete Gender Studies optional pack. 61 top questions topic/section-wise, color-coded by recurrence & likelihood, a condensed list of 32, 22 guaranteed questions based on past paper trends, notes + outlines for 54 questions, full answers for 21, and a complete most likely objective MCQs bank (250 MCQs). 2016–2025 past papers with thorough analysis.",
    iconKey: "Users",
    accentColor: "amber",
    order: 7,
    pricePkr: 1500,
    questionsCount: 61,
    answersCount: 21,
    mcqsCount: 250,
    features: [
      "61 Top Questions (topic/section-wise) — color-coded by recurrence & likelihood",
      "Condensed list of 32 questions",
      "22 Guaranteed Questions (based on past paper trends)",
      "Thorough past paper analysis",
      "Notes + outlines for 54 questions",
      "Complete most likely objective MCQs (250 MCQs)",
      "Full answers for 21 questions",
    ],
    samples: [
      { q: "Discuss the feminist movement in Pakistan and its achievements.", likelihood: "high" },
      { q: "Critically analyze the status of women under the Constitution of Pakistan.", likelihood: "high" },
      { q: "Explain the concept of gender mainstreaming.", likelihood: "medium" },
    ],
  },
  {
    slug: "criminology",
    name: "Criminology",
    category: "OPTIONAL",
    shortDesc: "52 most likely questions + 30 full answers, 220 tiered MCQs, past papers.",
    longDesc:
      "Complete Criminology optional pack. 52 most likely questions topic-wise, color-coded by likelihood, condensed list of 28, notes + outlines for 45 questions, full answers for 30, and a complete tiered MCQs list (220 MCQs). 2016–2025 past papers with thorough analysis.",
    iconKey: "ShieldAlert",
    accentColor: "amber",
    order: 8,
    pricePkr: 1500,
    questionsCount: 52,
    answersCount: 30,
    mcqsCount: 220,
    features: [
      "52 Most Likely Questions (topic-wise) — color-coded",
      "Condensed list of 28 questions",
      "Thorough past paper analysis",
      "Notes + outlines for 45 questions",
      "Complete tiered MCQs list (220 MCQs)",
      "Full answers for 30 questions",
    ],
    samples: [
      { q: "Discuss the major schools of criminological thought.", likelihood: "high" },
      { q: "Evaluate the effectiveness of the juvenile justice system in Pakistan.", likelihood: "high" },
      { q: "Explain white-collar crime with examples from Pakistan.", likelihood: "medium" },
    ],
  },
  {
    slug: "usa-history",
    name: "USA History",
    category: "OPTIONAL",
    shortDesc: "63 most likely questions + 17 full answers, 350 MCQs, important dates, past papers.",
    longDesc:
      "Complete USA History optional pack. 63 most likely questions topic-wise, color-coded by likelihood, condensed list of 23, the most important dates list, outlines for 43 questions, 350 topic-wise MCQs, and full answers for 17. 2016–2025 past papers with thorough analysis.",
    iconKey: "Landmark",
    accentColor: "amber",
    order: 9,
    pricePkr: 1500,
    questionsCount: 63,
    answersCount: 17,
    mcqsCount: 350,
    features: [
      "63 Most Likely Questions (topic-wise) — color-coded",
      "Condensed list of 23 questions",
      "Thorough past paper analysis",
      "Most important dates list",
      "Outlines for 43 questions",
      "350 MCQs (topic-wise)",
      "Full answers for 17 questions",
    ],
    samples: [
      { q: "Discuss the causes and consequences of the American Civil War.", likelihood: "high" },
      { q: "Evaluate the foreign policy of the USA during the Cold War.", likelihood: "high" },
      { q: "Analyze the New Deal and its impact on American society.", likelihood: "medium" },
    ],
  },
  {
    slug: "ir-paper-1",
    name: "International Relations — Paper 1",
    category: "OPTIONAL",
    shortDesc: "58 most likely questions + 18 full answers, 280 MCQs, outlines for 47, past papers.",
    longDesc:
      "Complete IR Paper 1 optional pack. 58 most likely questions topic-wise, color-coded by likelihood, condensed list of 35, outlines for 47 questions, 280 MCQs, and full answers for 18. 2016–2025 past papers with thorough analysis.",
    iconKey: "Globe",
    accentColor: "amber",
    order: 10,
    pricePkr: 1500,
    questionsCount: 58,
    answersCount: 18,
    mcqsCount: 280,
    features: [
      "58 Most Likely Questions (topic-wise) — color-coded",
      "Condensed list of 35 questions",
      "Thorough past paper analysis",
      "Outlines for 47 questions",
      "280 MCQs",
      "Full answers for 18 questions",
    ],
    samples: [
      { q: "Discuss the realist theory of International Relations.", likelihood: "high" },
      { q: "Evaluate the role of the United Nations in maintaining world peace.", likelihood: "high" },
      { q: "Analyze the concept of balance of power in international politics.", likelihood: "medium" },
    ],
  },
  {
    slug: "ir-paper-2",
    name: "International Relations — Paper 2",
    category: "OPTIONAL",
    shortDesc: "58 top questions, 300 MCQs, outlines for 24, past papers with analysis.",
    longDesc:
      "Complete IR Paper 2 optional pack. 58 top questions topic-wise, color-coded by likelihood, condensed list of 27, outlines for 24 questions, and 300 MCQs. 2016–2025 past papers with thorough analysis. Focused on regional and contemporary issues.",
    iconKey: "Globe2",
    accentColor: "amber",
    order: 11,
    pricePkr: 1500,
    questionsCount: 58,
    answersCount: 12,
    mcqsCount: 300,
    features: [
      "58 Top Questions (topic-wise) — color-coded",
      "Condensed list of 27 questions",
      "Thorough past paper analysis",
      "Outlines for 24 questions",
      "300 MCQs",
    ],
    samples: [
      { q: "Analyze Pakistan's foreign policy towards its neighbors.", likelihood: "high" },
      { q: "Discuss the impact of the Indo-US strategic partnership on South Asia.", likelihood: "high" },
      { q: "Evaluate the role of SAARC in regional cooperation.", likelihood: "medium" },
    ],
  },
  {
    slug: "public-administration",
    name: "Public Administration",
    category: "OPTIONAL",
    shortDesc: "56 top questions + 35 full answers, 220 MCQs, outlines for 36, past papers.",
    longDesc:
      "Complete Public Administration optional pack. 56 top questions, color-coded by likelihood, condensed list of 29, notes + outlines for 36 questions, 220 MCQs, and full answers for 35 questions. 2016–2025 past papers with thorough analysis.",
    iconKey: "Building2",
    accentColor: "amber",
    order: 12,
    pricePkr: 1500,
    questionsCount: 56,
    answersCount: 35,
    mcqsCount: 220,
    features: [
      "56 Top Questions — color-coded",
      "Condensed list of 29 questions",
      "Thorough past paper analysis",
      "Notes + outlines for 36 questions",
      "220 MCQs",
      "Full answers for 35 questions",
    ],
    samples: [
      { q: "Discuss the principles of scientific management by F.W. Taylor.", likelihood: "high" },
      { q: "Evaluate the structure of civil service in Pakistan.", likelihood: "high" },
      { q: "Explain the concept of Good Governance and its indicators.", likelihood: "medium" },
    ],
  },
];

const DEFAULT_SETTINGS: { key: string; value: string }[] = [
  { key: "JAZZCASH_NUMBER", value: "0300-XXXXXXX" },
  { key: "JAZZCASH_TITLE", value: "Ali Ihsan" },
  { key: "EASYPaisa_NUMBER", value: "0345-XXXXXXX" },
  { key: "EASYPaisa_TITLE", value: "Ali Ihsan" },
  { key: "NAYAPAY_ID", value: "aliihsan@nayapay" },
  { key: "NAYAPAY_TITLE", value: "Ali Ihsan" },
  { key: "SADAPAY_NUMBER", value: "0301-XXXXXXX" },
  { key: "SADAPAY_TITLE", value: "Ali Ihsan" },
  { key: "PAYONEER_ID", value: "aliihsan.devs@gmail.com" },
  { key: "PAYONEER_TITLE", value: "Ali Ihsan" },
  { key: "SUPPORT_WHATSAPP", value: "+923085202620" },
  { key: "SUPPORT_EMAIL", value: "aliihsan.devs@gmail.com" },
  { key: "LAUNCH_PRICE_ENABLED", value: "true" },
  { key: "LAUNCH_PRICE", value: "8999" },
  { key: "FULL_BUNDLE_PRICE", value: "11000" },
  { key: "COMPULSORY_BUNDLE_PRICE", value: "6000" },
  { key: "OPTIONAL_BUNDLE_PRICE", value: "6000" },
  { key: "BANK_TRANSFER_INSTRUCTIONS", value: "Pay the exact amount to any of the methods below. After payment, upload a screenshot/receipt. Your access is granted within minutes after verification." },
];

async function main() {
  console.log("Seeding...");

  // Create or update admin user
  const adminEmail = "aliihsan.devs@gmail.com";
  const adminPass = "admin12345"; // change after first login
  const adminHash = await bcrypt.hash(adminPass, 10);

  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await db.user.create({
      data: {
        email: adminEmail,
        name: "Ali Ihsan (Admin)",
        passwordHash: adminHash,
        role: "ADMIN",
        phone: "+923085202620",
      },
    });
    console.log(`✓ Admin user created: ${adminEmail} / ${adminPass} (change this password immediately!)`);
  } else {
    await db.user.update({
      where: { email: adminEmail },
      data: { role: "ADMIN", passwordHash: adminHash },
    });
    console.log(`✓ Admin user already exists. Password reset to: ${adminPass}`);
  }

  // Upsert subjects
  for (const s of SUBJECTS) {
    const data = {
      slug: s.slug,
      name: s.name,
      category: s.category,
      shortDesc: s.shortDesc,
      longDesc: s.longDesc,
      iconKey: s.iconKey,
      accentColor: s.accentColor,
      order: s.order,
      pricePkr: s.pricePkr,
      questionsCount: s.questionsCount,
      answersCount: s.answersCount,
      mcqsCount: s.mcqsCount,
      pastPapersFrom: 2016,
      pastPapersTo: 2025,
      featuresJson: JSON.stringify(s.features),
      sampleJson: JSON.stringify(s.samples),
      isActive: true,
    };
    await db.subject.upsert({
      where: { slug: s.slug },
      create: data,
      update: data,
    });
    console.log(`✓ Subject: ${s.name}`);
  }

  // Upsert settings
  for (const setting of DEFAULT_SETTINGS) {
    await db.setting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { value: setting.value },
    });
  }
  console.log("✓ Settings seeded");

  console.log("\n=== SEED COMPLETE ===");
  console.log(`Admin login: ${adminEmail} / ${adminPass}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
