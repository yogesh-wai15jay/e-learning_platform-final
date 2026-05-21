// Questions for Secure & Responsible AI Usage topic
const questions = [
  {
    id: 1,
    text: "A product manager pastes an internal roadmap into a public AI tool to 'summarize it better.' The tool has no explicit privacy guarantees. Which risks are MOST relevant in this scenario?",
    options: [
      { letter: "A", text: "Data may be used for model training" },
      { letter: "B", text: "Internal strategy exposure" },
      { letter: "C", text: "Network-level encryption failure" },
      { letter: "D", text: "Loss of competitive advantage" },
      { letter: "E", text: "Prompt injection attack" }
    ],
    correctAnswers: ["Data may be used for model training", "Internal strategy exposure", "Loss of competitive advantage"],
    explanation: "Public AI tools often use data for training, exposing internal strategies and causing competitive disadvantage."
  },
  {
    id: 2,
    text: "An employee replaces all customer names with 'Client X' but includes exact transaction IDs and timestamps in the prompt. What is the BEST classification of this practice?",
    options: [
      { letter: "A", text: "Fully secure anonymization" },
      { letter: "B", text: "Partial anonymization with residual risk" },
      { letter: "C", text: "Safe due to removal of names" },
      { letter: "D", text: "Equivalent to aggregation" }
    ],
    correctAnswers: ["Partial anonymization with residual risk"],
    explanation: "Transaction IDs and timestamps can still identify individuals, creating residual risk."
  },
  {
    id: 3,
    text: "A company allows employees to use enterprise AI tools with zero-retention settings but does NOT implement DLP or access control. Which risks still remain?",
    options: [
      { letter: "A", text: "Unauthorized access to prompts internally" },
      { letter: "B", text: "External model training on data" },
      { letter: "C", text: "Accidental sharing of sensitive data" },
      { letter: "D", text: "Lack of auditability" },
      { letter: "E", text: "Network interception of encrypted data" }
    ],
    correctAnswers: ["Unauthorized access to prompts internally", "Accidental sharing of sensitive data", "Lack of auditability"],
    explanation: "Without DLP and access controls, internal unauthorized access, accidental sharing, and lack of audit trails remain risks."
  },
  {
    id: 4,
    text: "A developer uses a private, on-premise AI model but uploads logs containing raw PII without masking. What is the PRIMARY failure here?",
    options: [
      { letter: "A", text: "Wrong AI model selection" },
      { letter: "B", text: "Lack of anonymization before input" },
      { letter: "C", text: "Incorrect deployment architecture" },
      { letter: "D", text: "Absence of encryption" }
    ],
    correctAnswers: ["Lack of anonymization before input"],
    explanation: "Even with private models, PII must be anonymized before input to prevent exposure."
  },
  {
    id: 5,
    text: "Which of the following scenarios violate the Zero-Trust principle?",
    options: [
      { letter: "A", text: "Assuming enterprise AI tools are completely safe without validation" },
      { letter: "B", text: "Sharing only required data fields in prompts" },
      { letter: "C", text: "Trusting AI-generated outputs without verification" },
      { letter: "D", text: "Logging AI usage for compliance" },
      { letter: "E", text: "Using placeholders instead of real data" }
    ],
    correctAnswers: ["Assuming enterprise AI tools are completely safe without validation", "Trusting AI-generated outputs without verification"],
    explanation: "Zero-trust requires never assuming safety and always verifying outputs."
  },
  {
    id: 6,
    text: "An employee uses a public AI tool to analyze 'average quarterly sales growth' without including any raw data. What is the MOST appropriate classification?",
    options: [
      { letter: "A", text: "Tier 3 (Highly Sensitive)" },
      { letter: "B", text: "Tier 2 (Internal Data)" },
      { letter: "C", text: "Tier 1 (Public Data)" },
      { letter: "D", text: "Depends on tool used" }
    ],
    correctAnswers: ["Tier 1 (Public Data)"],
    explanation: "Aggregated metrics without raw data are considered public data when no specifics are included."
  },
  {
    id: 7,
    text: "Which controls directly reduce data leakage at the system level?",
    options: [
      { letter: "A", text: "Data Loss Prevention (DLP)" },
      { letter: "B", text: "Employee awareness training" },
      { letter: "C", text: "TLS encryption" },
      { letter: "D", text: "Role-based access control" },
      { letter: "E", text: "Hypothetical prompt structuring" }
    ],
    correctAnswers: ["Data Loss Prevention (DLP)", "TLS encryption", "Role-based access control"],
    explanation: "DLP, TLS encryption, and RBAC are system-level controls that directly prevent data leakage."
  },
  {
    id: 8,
    text: "A finance team uploads a confidential report to an enterprise AI tool with zero-retention, but the tool is accessed through a shared login. What is the MOST critical risk?",
    options: [
      { letter: "A", text: "External data leakage" },
      { letter: "B", text: "Internal accountability failure" },
      { letter: "C", text: "Model training on data" },
      { letter: "D", text: "Prompt injection" }
    ],
    correctAnswers: ["Internal accountability failure"],
    explanation: "Shared logins eliminate audit trails and accountability for actions taken with sensitive data."
  },
  {
    id: 9,
    text: "Which practices BEST align with defense-in-depth strategy?",
    options: [
      { letter: "A", text: "Using private AI for sensitive data" },
      { letter: "B", text: "Relying only on employee awareness" },
      { letter: "C", text: "Combining DLP with encryption and access controls" },
      { letter: "D", text: "Allowing unrestricted tool usage for flexibility" },
      { letter: "E", text: "Implementing audit logs and monitoring" }
    ],
    correctAnswers: ["Using private AI for sensitive data", "Combining DLP with encryption and access controls", "Implementing audit logs and monitoring"],
    explanation: "Defense-in-depth uses multiple layers: private AI, combined controls, and audit/monitoring."
  },
  {
    id: 10,
    text: "An employee uploads a confidential PDF to an AI tool for summarization. The company policy allows only enterprise AI, but the employee uses a personal account of the same tool. What principle is MOST directly violated?",
    options: [
      { letter: "A", text: "Data classification" },
      { letter: "B", text: "Tool governance and policy compliance" },
      { letter: "C", text: "Encryption standards" },
      { letter: "D", text: "Prompt engineering technique" }
    ],
    correctAnswers: ["Tool governance and policy compliance"],
    explanation: "Using personal accounts violates established tool governance policies."
  }
];

module.exports = questions;