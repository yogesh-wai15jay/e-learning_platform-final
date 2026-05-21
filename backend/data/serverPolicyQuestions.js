const serverPolicyQuestions = [
  {
    id: 1,
    text: "An employee shares their RDP credentials with a teammate to complete urgent work faster. No misuse occurs. What is the correct interpretation?",
    options: [
      { letter: "A", text: "Acceptable due to urgency" },
      { letter: "B", text: "Acceptable if no misuse happens" },
      { letter: "C", text: "Policy violation regardless of intent" },
      { letter: "D", text: "Allowed with manager approval" }
    ],
    correctAnswers: ["Policy violation regardless of intent"],
    explanation: "Credentials must never be shared – policy violation regardless of intent or outcome."
  },
  {
    id: 2,
    text: "Which of the following actions can negatively impact server performance?",
    options: [
      { letter: "A", text: "Keeping RDP sessions idle in the background" },
      { letter: "B", text: "Storing unnecessary temporary files" },
      { letter: "C", text: "Logging out immediately after work" },
      { letter: "D", text: "Saving files in designated folders" }
    ],
    correctAnswers: ["Keeping RDP sessions idle in the background", "Storing unnecessary temporary files"],
    explanation: "Idle sessions consume resources; unnecessary files degrade performance."
  },
  {
    id: 3,
    text: "An employee leaves an RDP session disconnected instead of logging out after work. What does the policy classify this as?",
    options: [
      { letter: "A", text: "Acceptable practice" },
      { letter: "B", text: "Minor issue" },
      { letter: "C", text: "Policy violation" },
      { letter: "D", text: "IT responsibility" }
    ],
    correctAnswers: ["Policy violation"],
    explanation: "Users must properly log off or sign out – leaving disconnected sessions is a violation."
  },
  {
    id: 4,
    text: "A user stores project files in the Desktop folder for quick access over several weeks. What is the issue here?",
    options: [
      { letter: "A", text: "No issue if files are important" },
      { letter: "B", text: "Violation of file storage guidelines" },
      { letter: "C", text: "Only a performance issue" },
      { letter: "D", text: "Allowed temporarily" }
    ],
    correctAnswers: ["Violation of file storage guidelines"],
    explanation: "Storing files on Desktop or Downloads is strictly prohibited."
  },
  {
    id: 5,
    text: "Which actions violate data confidentiality rules?",
    options: [
      { letter: "A", text: "Accessing another employee’s folder without permission" },
      { letter: "B", text: "Reporting incorrect folder access permissions" },
      { letter: "C", text: "Copying restricted files outside authorized access" },
      { letter: "D", text: "Viewing only allowed files" }
    ],
    correctAnswers: ["Accessing another employee’s folder without permission", "Copying restricted files outside authorized access"],
    explanation: "Accessing others' folders or copying restricted files violates confidentiality."
  },
  {
    id: 6,
    text: "An employee notices that their personal server folder is accessible to others but ignores it. What is the correct action per policy?",
    options: [
      { letter: "A", text: "Ignore unless data is misused" },
      { letter: "B", text: "Fix it personally" },
      { letter: "C", text: "Report immediately to IT/management" },
      { letter: "D", text: "Delete the folder" }
    ],
    correctAnswers: ["Report immediately to IT/management"],
    explanation: "Must immediately report the issue to management or IT."
  },
  {
    id: 7,
    text: "An employee installs a small third-party tool to improve productivity without IT approval. What is the policy stance?",
    options: [
      { letter: "A", text: "Allowed if useful" },
      { letter: "B", text: "Allowed if no harm occurs" },
      { letter: "C", text: "Strict violation" },
      { letter: "D", text: "Allowed temporarily" }
    ],
    correctAnswers: ["Strict violation"],
    explanation: "Installation of unauthorized software is not allowed under any circumstances."
  },
  {
    id: 8,
    text: "Which of the following are security best practice violations?",
    options: [
      { letter: "A", text: "Using weak or shared passwords" },
      { letter: "B", text: "Disabling antivirus for faster performance" },
      { letter: "C", text: "Keeping system updated and secure" },
      { letter: "D", text: "Attempting to bypass monitoring systems" }
    ],
    correctAnswers: ["Using weak or shared passwords", "Disabling antivirus for faster performance", "Attempting to bypass monitoring systems"],
    explanation: "Weak passwords, disabling antivirus, bypassing monitoring are all violations."
  },
  {
    id: 9,
    text: "An employee uses the server briefly for personal browsing during a break. What applies?",
    options: [
      { letter: "A", text: "Acceptable during breaks" },
      { letter: "B", text: "Allowed if minimal" },
      { letter: "C", text: "Violation of acceptable use policy" },
      { letter: "D", text: "Manager discretion" }
    ],
    correctAnswers: ["Violation of acceptable use policy"],
    explanation: "Server must be used strictly for official business; personal use is prohibited."
  },
  {
    id: 10,
    text: "Suspicious activity is noticed on the server, but the employee delays reporting it thinking it’s minor. What is the risk here?",
    options: [
      { letter: "A", text: "No issue if resolved later" },
      { letter: "B", text: "Delay is acceptable" },
      { letter: "C", text: "Increased security risk due to delayed reporting" },
      { letter: "D", text: "IT responsibility only" }
    ],
    correctAnswers: ["Increased security risk due to delayed reporting"],
    explanation: "Timely reporting is essential to minimize risks; delay increases security risk."
  }
];

module.exports = serverPolicyQuestions;