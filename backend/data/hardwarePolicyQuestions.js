const hardwarePolicyQuestions = [
  {
    id: 1,
    text: "An employee’s laptop is damaged within 1 year due to a fall at home. The employee submits a repair invoice but no FIR or proof of incident. Management is unsure whether it was negligence. What is the most appropriate action?",
    options: [
      { letter: "A", text: "Employee bears full cost automatically" },
      { letter: "B", text: "Company bears full cost automatically" },
      { letter: "C", text: "Management evaluates and decides liability case-by-case" },
      { letter: "D", text: "Insurance must cover it" }
    ],
    correctAnswers: ["Management evaluates and decides liability case-by-case"],
    explanation: "The policy states: 'The final decision on cost liability will rest with management, after reviewing the circumstances in a fair and reasonable manner.'"
  },
  {
    id: 2,
    text: "Which of the following situations are most likely to result in employee financial liability within the first 2 years?",
    options: [
      { letter: "A", text: "Damage due to careless handling" },
      { letter: "B", text: "Hardware failure due to aging" },
      { letter: "C", text: "Damage with valid accident proof" },
      { letter: "D", text: "Improper usage leading to malfunction" }
    ],
    correctAnswers: ["Damage due to careless handling", "Improper usage leading to malfunction"],
    explanation: "Within first 2 years, employee bears cost if damage is due to mishandling, negligence, or improper usage."
  },
  {
    id: 3,
    text: "An employee claims accidental damage but submits a witness statement that is inconsistent with device logs. What is the strongest basis for management’s decision?",
    options: [
      { letter: "A", text: "Employee statement" },
      { letter: "B", text: "Witness statement" },
      { letter: "C", text: "Technical evidence and overall review" },
      { letter: "D", text: "First-come-first-serve decision" }
    ],
    correctAnswers: ["Technical evidence and overall review"],
    explanation: "Management reviews all circumstances; technical evidence is key."
  },
  {
    id: 4,
    text: "An employee cleans the laptop regularly but installs unauthorized heavy software, leading to overheating and damage within 18 months. Who is responsible?",
    options: [
      { letter: "A", text: "Company, due to maintenance compliance" },
      { letter: "B", text: "Employee, due to improper usage" },
      { letter: "C", text: "IT team" },
      { letter: "D", text: "Vendor" }
    ],
    correctAnswers: ["Employee, due to improper usage"],
    explanation: "Installing unauthorized software is improper usage; employee is liable."
  },
  {
    id: 5,
    text: "Which scenarios violate remote work responsibilities?",
    options: [
      { letter: "A", text: "Using unsecured public Wi-Fi without precautions" },
      { letter: "B", text: "Sharing device with a family member" },
      { letter: "C", text: "Following all IT policies from home" },
      { letter: "D", text: "Leaving device unlocked with confidential data" }
    ],
    correctAnswers: ["Using unsecured public Wi-Fi without precautions", "Sharing device with a family member", "Leaving device unlocked with confidential data"],
    explanation: "Remote work requires secure usage; unsecured Wi‑Fi, sharing device, leaving unlocked all violate policy."
  },
  {
    id: 6,
    text: "A probationary employee gets verbal approval from a manager (not written) to take a laptop home for urgent work. What is the policy implication?",
    options: [
      { letter: "A", text: "Fully compliant" },
      { letter: "B", text: "Partially compliant" },
      { letter: "C", text: "Non-compliant due to lack of written approval" },
      { letter: "D", text: "Allowed under remote work clause" }
    ],
    correctAnswers: ["Non-compliant due to lack of written approval"],
    explanation: "Probationary employees require prior written approval from Management to carry hardware outside office."
  },
  {
    id: 7,
    text: "After 2.5 years, a laptop battery degrades significantly. IT replaces it. The same issue occurs again after 6 months. Who pays?",
    options: [
      { letter: "A", text: "Company" },
      { letter: "B", text: "Employee" },
      { letter: "C", text: "Shared" },
      { letter: "D", text: "Vendor" }
    ],
    correctAnswers: ["Employee"],
    explanation: "After company repairs or maintains a device, any recurrence of the same issue within 1 year is the employee’s responsibility."
  },
  {
    id: 8,
    text: "After company repair, a device issue reoccurs after 14 months. What is the correct interpretation?",
    options: [
      { letter: "A", text: "Employee must pay" },
      { letter: "B", text: "Company will not support" },
      { letter: "C", text: "Company may review and support" },
      { letter: "D", text: "Device must be replaced immediately" }
    ],
    correctAnswers: ["Company may review and support"],
    explanation: "If issue reoccurs after 1 year, company will review and may support repair or replacement."
  },
  {
    id: 9,
    text: "Which actions represent clear violations regardless of intent?",
    options: [
      { letter: "A", text: "Watching non-work videos after office hours" },
      { letter: "B", text: "Installing pirated software for faster work" },
      { letter: "C", text: "Connecting approved peripherals" },
      { letter: "D", text: "Storing personal photos temporarily" }
    ],
    correctAnswers: ["Watching non-work videos after office hours", "Installing pirated software for faster work", "Storing personal photos temporarily"],
    explanation: "Watching non-work media on company devices, installing pirated software, keeping personal files are prohibited."
  },
  {
    id: 10,
    text: "An employee uses a personal laptop for urgent client work without IT approval but ensures full security compliance. What is the policy stance?",
    options: [
      { letter: "A", text: "Acceptable due to urgency" },
      { letter: "B", text: "Acceptable if data is safe" },
      { letter: "C", text: "Violation due to lack of approval" },
      { letter: "D", text: "Allowed if manager approves" }
    ],
    correctAnswers: ["Violation due to lack of approval"],
    explanation: "Use of personal devices for official work requires prior written approval from IT department – no exceptions for urgency."
  },
];

module.exports = hardwarePolicyQuestions;