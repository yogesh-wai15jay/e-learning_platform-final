const mongoose = require('mongoose');
const Course = require('../models/Course');
const Question = require('../models/Question');
const secureAiQuestions = require('../data/questions');
const leavePolicyQuestions = require('../data/leavePolicyQuestions');
const hardwarePolicyQuestions = require('../data/hardwarePolicyQuestions');
const serverPolicyQuestions = require('../data/serverPolicyQuestions');

// Define courses as an array of objects, each with the required fields
const coursesData = [
  {
    title: "Secure & Responsible AI Usage",
    id: "secure-ai",
    estimatedTime: 60,
    contentAvailable: true,
    showOnDashboard: true,
    subtopics: [
      {
        title: "Module 1: The New AI Risk Landscape",
        estimatedTime: 5,
        content: `
          <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 1: The New AI Risk Landscape</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Understand modern AI risks and why traditional security thinking is insufficient.</p>
        <p class="mb-3">AI tools such as chatbots, code generators, and data analyzers rely heavily on user input. While this interaction may seem harmless, the data entered into these systems can be stored, processed externally, or even used to improve the model. This creates a serious risk when employees unknowingly share confidential or proprietary information.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Risks</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Inputting sensitive data into public AI tools</li>
          <li>•   Data being logged or reused by providers</li>
          <li>•   Shadow AI (use of unapproved tools)</li>
          <li>•   Prompt injection or indirect exposure</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Impact</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Regulatory penalties (GDPR, DPDP Act, etc.)</li>
          <li>•   Reputational damage</li>
          <li>•   Loss of competitive advantage</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Insight</h3>
        <p class="italic bg-yellow-50 p-2 rounded">AI tools are <strong>not private by default</strong>—treat them as <strong>external systems</strong> unless explicitly secured.</p>
      </div>
        `
      },
      {
        title: "Module 2: Core Principles of Secure AI Usage",
        estimatedTime: 5,
        content: `
          <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 2: Core Principles of Secure AI Usage</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Adopt a Zero-Trust mindset.</p>
        <p class="mb-3">A secure approach to AI starts with the assumption that no system is inherently safe. Every interaction with an AI tool should be treated cautiously, especially when it involves organizational data. The goal is to minimize exposure while still benefiting from AI capabilities.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Principles</h3>
        <ul class="list-disc pl-6 mb-3">
          <li><strong>Never Input Sensitive Data</strong> → Assume prompts are public</li>
          <li><strong>Least Privilege</strong> → Share only minimum required data</li>
          <li><strong>Verify Outputs</strong> → AI responses must be validated</li>
          <li><strong>Document Usage</strong> → Maintain logs for compliance</li>
          <li><strong>Use Privacy-First Tools</strong> → Prefer enterprise AI</li>
        </ul>
      </div>
        `
      },
      {
        title: "Module 3: Identifying Sensitive Data",
        estimatedTime: 5,
        content: `<div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 3: Identifying Sensitive Data</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Recognize and classify sensitive organizational data.</p>
        <p class="mb-3">Sensitive data refers to any information that is not meant for public access and could harm the organization if exposed. Employees often underestimate what qualifies as sensitive, which increases the risk of accidental leaks.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Types of Sensitive Data</h3>
        <ol class="list-decimal pl-6 mb-3">
          <li>•   <strong>Personally Identifiable Information (PII)</strong><br>Names, phone numbers, addresses, Aadhaar, PAN</li>
          <li>•   <strong>Financial Information</strong><br>Revenue data, transaction records, banking details</li>
          <li>•   <strong>Business & Strategic Data</strong><br>Product roadmaps, marketing strategies, internal reports</li>
          <li>•   <strong>Intellectual Property</strong><br>Source code, designs, proprietary algorithms</li>
          <li>•   <strong>Confidential Communications</strong><br>Emails, internal discussions</li>
        </ol>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Insight</h3>
        <p class="italic bg-yellow-50 p-2 rounded">If the data is restricted within your organization, it should not be shared with external AI tools without safeguards.</p>
      </div>`
      },
      {
        title: "Module 4: Understanding Data Leakage in AI",
        estimatedTime: 5,
        content: `<div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 4: Understanding Data Leakage in AI</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Understand how and where data leakage happens.</p>
        <p class="mb-3">Data leakage in AI systems can occur at multiple stages, often without the user realizing it. From the moment a prompt is entered to how it is stored or transmitted, each step presents a potential risk if not properly secured.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Leakage Points</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Input stage (prompt entry)</li>
          <li>•   Transmission (network risks)</li>
          <li>•   Storage (logs, caching, training datasets)</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Common Scenarios</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Copy-pasting source code into AI tools</li>
          <li>•   Uploading confidential documents</li>
          <li>•   Using unapproved AI tools</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Takeaway</h3>
        <p class="italic bg-yellow-50 p-2 rounded">Every prompt is a potential data leak.</p>
      </div>`
      },
      {
        title: "Module 5: Safe Prompt Engineering Techniques",
        estimatedTime: 6,
        content: `<div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 5: Safe Prompt Engineering Techniques</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Use AI effectively while minimizing risk.</p>
        <p class="mb-3">Safe prompt engineering focuses on extracting value from AI without exposing real data. Instead of directly sharing sensitive information, users should restructure inputs in a way that preserves confidentiality.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Techniques</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Replace real data with placeholders → "Client X", "Revenue = ₹X crore"</li>
          <li>•   Use hypothetical scenarios</li>
          <li>•   Separate context from sensitive inputs</li>
          <li>•   Avoid sharing actual records</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Anonymization Methods</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Masking → XXXX-1234</li>
          <li>•   Pseudonymization → "Customer A"</li>
          <li>•   Aggregation → "Sales increased by 20%"</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Example</h3>
        <p><strong>Original:</strong> "Rohit Sharma from Delhi spent ₹50,000"</p>
        <p><strong>Anonymized:</strong> "Customer A from City X made a high-value purchase"</p>
      </div>`
      },
      {
        title: "Module 6: Choosing the Right AI Access Model",
        estimatedTime: 5,
        content: `<div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 6: Choosing the Right AI Access Model</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Select AI platforms based on data sensitivity.</p>
        <p class="mb-3">Not all AI tools offer the same level of privacy. Choosing the right platform is critical because it directly determines how your data is handled, stored, and potentially reused.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Three-Tier Model</h3>
        <table class="min-w-full border mb-3">
          <thead><tr class="bg-gray-100"><th class="border p-2">Model</th><th class="border p-2">Risk</th><th class="border p-2">Use Case</th><th class="border p-2">Data Privacy</th></tr></thead>
          <tbody>
            <tr><td class="border p-2">Public AI</td><td class="border p-2">High</td><td class="border p-2">Brainstorming</td><td class="border p-2">Data may be used</td></tr>
            <tr><td class="border p-2">Enterprise AI</td><td class="border p-2">Low</td><td class="border p-2">Business tasks</td><td class="border p-2">No training on your data</td></tr>
            <tr><td class="border p-2">Private AI</td><td class="border p-2">Negligible</td><td class="border p-2">Sensitive data</td><td class="border p-2">Fully internal</td></tr>
          </tbody>
        </table>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Guidance</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Avoid public tools for internal data</li>
          <li>•   Use enterprise AI for routine work</li>
          <li>•   Use private AI for critical assets</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Takeaway</h3>
        <p class="italic bg-yellow-50 p-2 rounded">Where you use AI determines where your data goes.</p>
      </div>`
      },
      {
        title: "Module 7: Data Classification & Organizational Policy",
        estimatedTime: 5,
        content: `<div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 7: Data Classification & Organizational Policy</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Define structured data handling rules.</p>
        <p class="mb-3">A well-defined policy ensures that employees clearly understand what data can be used with AI tools and under what conditions. Without this clarity, even well-intentioned users may make risky decisions.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Three-Tier Data Policy</h3>
        <ul class="list-disc pl-6 mb-3">
          <li><strong>Tier 1: Public Data</strong> – Marketing content, public documentation ✅ Safe for most AI tools</li>
          <li><strong>Tier 2: Internal Data</strong> – Project plans, internal notes ⚠ Use only enterprise AI</li>
          <li><strong>Tier 3: Highly Sensitive Data</strong> – Source code, PII, financial records ❌ Never use with public AI</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Policy Elements</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Approved AI tools list</li>
          <li>•   Data classification framework</li>
          <li>•   Usage approval workflows</li>
          <li>•   Defined roles and responsibilities</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Insight</h3>
        <p class="italic bg-yellow-50 p-2 rounded">Clear policies reduce ambiguity and prevent misuse.</p>
      </div>`
      },
      {
        title: "Module 8: Technical Safeguards",
        estimatedTime: 6,
        content: `<div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 8: Technical Safeguards</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Implement system-level protections.</p>
        <p class="mb-3">Technology plays a crucial role in preventing data leakage, especially when human error is unavoidable. A defense-in-depth strategy ensures that even if one layer fails, others continue to protect the system.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Controls</h3>
        <ol class="list-decimal pl-6 mb-3">
          <li><strong>DLP (Data Loss Prevention)</strong> – Detects and blocks sensitive data, and can automatically redact critical information.</li>
          <li><strong>Zero Retention Settings</strong> – Disables data storage and model training on user inputs.</li>
          <li><strong>Secure Deployment</strong> – Use VPC environments and private endpoints to keep AI within controlled infrastructure.</li>
          <li><strong>Encryption</strong> – TLS protects data in transit, while encryption at rest secures stored data.</li>
          <li><strong>Access Control</strong> – SSO, role-based access, and audit logs ensure accountability.</li>
        </ol>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Emerging Solutions</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   AI firewalls</li>
          <li>•   Confidential computing</li>
          <li>•   Encrypted prompts</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Takeaway</h3>
        <p class="italic bg-yellow-50 p-2 rounded">Even if users make mistakes, systems should prevent leakage.</p>
      </div>`
      },
      {
        title: "Module 9: Secure AI Solutions & Architecture",
        estimatedTime: 5,
        content: `<div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 9: Secure AI Solutions & Architecture</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Explore safer AI alternatives.</p>
        <p class="mb-3">Organizations handling sensitive data often move beyond public AI tools and adopt controlled environments. These solutions provide greater control over how data is processed and ensure compliance with regulatory standards.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Options</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Private AI models (on-premise)</li>
          <li>•   Local LLM tools</li>
          <li>•   Secure cloud AI with strict controls</li>
          <li>•   RAG systems with controlled access</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Advantages</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Greater data control</li>
          <li>•   Reduced external exposure</li>
          <li>•   Improved compliance</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Best Practice</h3>
        <p class="italic bg-yellow-50 p-2 rounded">Use private or controlled AI environments for sensitive workflows.</p>
      </div>`
      },
      {
        title: "Module 10: Employee Awareness & Culture",
        estimatedTime: 5,
        content: `<div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 10: Employee Awareness & Culture</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Build secure habits across the organization.</p>
        <p class="mb-3">Most AI-related data leaks are not caused by technical failures but by human mistakes. Building awareness and promoting responsible behavior is therefore one of the most effective defenses.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Common Mistakes</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Copy-pasting confidential data</li>
          <li>•   Uploading internal files without review</li>
          <li>•   Assuming AI tools are private</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Best Practices</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>•   Always review before sharing</li>
          <li>•   Use placeholders instead of real data</li>
          <li>•   Follow organizational policies</li>
        </ul>
        <div class="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500">
          <h3 class="text-xl font-semibold">Final Key Takeaways</h3>
          <p>AI security is no longer just a technical concern—it is a shared responsibility across the organization. The combination of proper data classification, careful tool selection, and strong user awareness forms the foundation of secure AI adoption. By integrating policy, technology, and human judgment, organizations can safely leverage AI while minimizing the risk of data leakage.</p>
        </div>
      </div>`
      }
    ],
    placeholderContent: ""
  },
  {
    title: "Company Policies",
    id: "company-policies",
    estimatedTime: 45,
    contentAvailable: false,
    showOnDashboard: true,
    subtopics: [],
    placeholderContent: "<h3>Company Policies</h3><p>Content coming soon. This topic will cover server configuration, security policies, and best practices for server management.</p>"
  },
  {
    title: "Logical based questions",
    id: "logical-questions",
    estimatedTime: 50,
    contentAvailable: false,
    showOnDashboard: true,
    subtopics: [],
    placeholderContent: "<h3>Logical Based Questions</h3><p>Content coming soon. This topic will include practical scenarios and case studies for better understanding.</p>"
  },
  {
    title: "Leave Policy",
    id: "leave-policy",
    estimatedTime: 30,
    contentAvailable: true,
    showOnDashboard: true,
    subtopics: [
      {
        title: "Module 1: General Leave Policies",
        estimatedTime: 15,
        content: `
          <div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">General Leave Policies</h2>
          <p><strong>Effective from:</strong> 1st April 2026</p>
          <p><strong>Applicability:</strong> As per law of Republic of India and employment contract.</p>
          <h3 class="text-xl font-semibold mt-4 mb-2">Leave Year</h3>
          <p>1st April to 31st March.</p>
          <h3 class="text-xl font-semibold mt-4 mb-2">Annual Leaves (AL)</h3>
          <ul class="list-disc pl-6">
            <li>•   12 days paid annual leave on pro-rata basis.</li>
            <li>•   Approval required at least 14 days in advance.</li>
            <li>•   Advance AL / LWP may be allowed in exceptional circumstances (marriage, death, serious illness, etc.) at management discretion.</li>
            <li>•   Unused AL cannot be carried forward or encashed – forfeited at year end.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Medical Leaves (ML)</h3>
          <ul class="list-disc pl-6">
            <li>•   12 days paid medical leave per year on pro-rata basis.</li>
            <li>•   Medical certificate required even for 1 day.</li>
            <li>•   Inform manager and HR within first 4 hours of the working day.</li>
            <li>•   Leave application must be submitted within next working day after rejoining.</li>
            <li>•   Unused ML forfeited at year end – no carry forward or encashment.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Hospitalization Leave</h3>
          <ul class="list-disc pl-6">
            <li>•   After 1 year of service, up to 15 additional calendar days paid hospitalization leave.</li>
            <li>•   Requires doctor's written order, admission/discharge slips, treatment details.</li>
            <li>•   Approval at management discretion.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Leave Allotment for New Joiners</h3>
          <ul class="list-disc pl-6">
            <li>•   Joining 1st–5th of month: 1 AL + 1 ML for that month.</li>
            <li>•   Joining 6th–15th: 0.5 AL + 0.5 ML.</li>
            <li>•   Joining after 15th: no leave for that month.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Important Restrictions</h3>
          <ul class="list-disc pl-6">
            <li>•   AL and ML cannot be taken consecutively (clubbed). ML taken immediately after AL will be treated as AL.</li>
            <li>•   If no AL balance, such leave becomes LWP.</li>
            <li>•   Leave can be availed only after being earned (pro-rata).</li>
          </ul>
        </div>
        `
      },
      {
        title: "Module 2: Special Leaves",
        estimatedTime: 15,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Special Leaves</h2>
          <h3 class="text-xl font-semibold mt-4 mb-2">Maternity Leave</h3>
          <ul class="list-disc pl-6">
            <li>•   For legally married female employees.</li>
            <li>•   26 weeks paid leave (includes weekends & public holidays).</li>
            <li>•   Requires 2 years of service before expected delivery date.</li>
            <li>•   Maximum for first 2 children only.</li>
            <li>•   Miscarriage/abortion – normal medical leave, not maternity.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Paternity Leave</h3>
          <ul class="list-disc pl-6">
            <li>•   1 week paid paternity leave within 6 months of child birth.</li>
            <li>•   Requires 2 years of service.</li>
            <li>•   Remote work may be permitted after leave at management discretion.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Parent-care and Child-care Leaves</h3>
          <ul class="list-disc pl-6">
            <li>•   After 3 months continuous service.</li>
            <li>•   2 days per year combined (parent-care + child-care).</li>
            <li>•   Child below 7 years, parents above 65 living with employee and dependent.</li>
            <li>•   Only for first 2 children.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Urgent Leave</h3>
          <ul class="list-disc pl-6">
            <li>•   Up to 2 AL and 2 ML per calendar year can be taken on short notice.</li>
            <li>•   No need for 2-week advance notice.</li>
            <li>•   For urgent ML, medical prescription may be waived subject to approval.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Pro-rata Leave for Part of Year</h3>
          <p>Leaves are earned monthly on pro-rata basis. For example, after 6 months service, employee is entitled to 6 AL and 6 ML.</p>
        </div>`
      },
      {
        title: "Module 3: Leave Without Pay (LWP) Rules",
        estimatedTime: 15,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Leave Without Pay (LWP) Rules & Calculation</h2>
          <h3 class="text-xl font-semibold mt-4 mb-2">LWP Calculation Formula</h3>
          <p>Monthly Gross Salary / Number of days in month × (Number of days worked)</p>
          <h3 class="text-xl font-semibold mt-4 mb-2">LWP Counting Rules</h3>
          <ul class="list-disc pl-6">
            <li>•   LWP for full week (Monday–Friday) = 7 days (including weekends).</li>
            <li>•   LWP on Friday and Monday with weekend in between = 4 days.</li>
            <li>•   If a public holiday is sandwiched between LWP days, it is counted as LWP.</li>
            <li>•   Paid leave immediately followed by LWP making total absence > half working week → weekend counted as LWP.</li>
            <li>•   Half-day leaves are considered in LWP calculation (e.g., 2.5 days).</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Examples</h3>
          <ul class="list-disc pl-6">
            <li>•   LWP on Thursday & Friday + Monday public holiday → 5 days LWP (Thu, Fri, Sat, Sun, Mon).</li>
            <li>•   LWP on Tuesday & Wednesday only → 2 days LWP (no sandwich).</li>
            <li>•   LWP on Friday only → 1 day LWP (unless adjacent to weekend and policy triggers).</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Advance Leave Policy</h3>
          <p>Advance leave can be availed within the half‑year (Apr–Sep or Oct–Mar), subject to remaining months in that period.</p>
          <p>Any leave beyond the allowed limit becomes LWP.</p>
        </div>`
      },
      {
        title: "Module 4: Holiday Calendar, Comp Off & Compliance",
        estimatedTime: 15,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Holiday Calendar & Compensatory Off</h2>
          <h3 class="text-xl font-semibold mt-4 mb-2">Who Follows Which Holiday Calendar?</h3>
          <ul class="list-disc pl-6">
            <li><strong>Client-site employees</strong> – follow client holiday calendar.</li>
            <li><strong>Project-aligned employees (office/remote)</strong> – follow client holiday calendar.</li>
            <li><strong>Non-project employees</strong> – follow DBP holiday calendar.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Working on DBP Holiday (Client Operational)</h3>
          <ul class="list-disc pl-6">
            <li>•   Eligible for Compensatory Off (comp‑off), maximum 3 comp‑offs.</li>
            <li>•   Comp‑off must be applied within 2 weeks via email to manager with HR in CC.</li>
            <li>•   Can be availed only during low work volume or when off project.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Leave Approval Rules</h3>
          <ul class="list-disc pl-6">
            <li>•   Email/SMS/WhatsApp are <strong>not</strong> valid approval methods.</li>
            <li>•   Leave application form must be properly filled and emailed.</li>
            <li>•   For client-site employees, client approval is required first.</li>
            <li>•   During probation, all leaves are at management discretion.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Late Arrival / Early Departure</h3>
          <p>Any arrival after 9:00 AM requires half-day leave application and notification to manager & HR. Same for early departure before 6:00 PM.</p>
          <h3 class="text-xl font-semibold mt-4 mb-2">Team Leave Limits</h3>
          <p>No more than 50% of staff in any department/team shall be granted Annual Leave on the same day.</p>
          <h3 class="text-xl font-semibold mt-4 mb-2">Consequences of Non-compliance</h3>
          <p>Non-compliance with leave application, notification, or documentation will result in the absence being treated as NO SHOW and LWP.</p>
        </div>`
      }
    ],
    placeholderContent: ""
  },
  {
    title: "Hardware Policy",
    id: "hardware-policy",
    estimatedTime: 35,
    contentAvailable: true,
    showOnDashboard: true,
    subtopics: [
      {
        title: "Module 1: Device Usage & Responsibility (First 2 Years)",
        estimatedTime: 15,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Device Usage & Responsibility (First 2 Years)</h2>
          <p><strong>Purpose:</strong> Outlines terms, responsibilities, and restrictions for company-provided equipment.</p>
          <h3 class="text-xl font-semibold mt-4 mb-2">Care and Handling</h3>
          <ul class="list-disc pl-6">
            <li>•   Handle with care to ensure proper functioning.</li>
            <li>•   Average laptop life: 4 years.</li>
            <li>•   If damage occurs within first 2 years due to mishandling, negligence, or improper usage, employee may bear repair/replacement cost.</li>
            <li>•   For external factors/accidents, employee must provide supporting documents (FIR, CCTV, insurance report, witness statement).</li>
            <li>•   Management decides liability after fair review.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Maintenance</h3>
          <ul class="list-disc pl-6">
            <li>•   Clean equipment gently at least once every 15 days.</li>
            <li>•   If laptop is under service warranty, repairs through authorized provider arranged by Admin.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Remote Work / WFH Guidelines</h3>
          <ul class="list-disc pl-6">
            <li>Secure usage, maintain confidentiality, comply with IT policies.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Probationary Employees</h3>
          <ul class="list-disc pl-6">
            <li>•   Not permitted to carry laptops/hardware outside office without prior written Management approval.</li>
            <li>•   If approved, employee is fully responsible for safety and security; misuse may lead to disciplinary action.</li>
          </ul>
        </div>`
      },
      {
        title: "Module 2: Device Responsibility After 2 Years & Usage Restrictions",
        estimatedTime: 15,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Device Responsibility After 2 Years</h2>
          <ul class="list-disc pl-6">
            <li>•   If performance issues arise after 2 years, IT department reviews.</li>
            <li>•   Company may undertake repair, maintenance, or replacement.</li>
            <li>•   After company repairs, any recurrence of the same issue within 1 year is employee's responsibility (cost borne by employee).</li>
            <li>•   If recurrence after 1 year, company may review and support.</li>
          </ul>
          <h2 class="text-2xl font-bold text-blue-700 mt-6 mb-4">Usage Restrictions</h2>
          <ul class="list-disc pl-6">
            <li>•   Company equipment strictly for official purposes only.</li>
            <li>•   Personal devices require prior written IT approval.</li>
            <li>•   No unauthorized hardware/peripherals (USB drives, external storage, etc.).</li>
            <li>•   Violations may lead to disciplinary action including suspension or termination.</li>
            <li>•   Only company-approved, licensed software may be installed.</li>
          </ul>
          <ul class="list-disc pl-6">
            <li><strong>Prohibited activities:</strong> torrents/pirated software, adult/prohibited material, violating IT security policies, watching non-work media on company devices, keeping personal files/pictures.</li>
          </ul>
        </div>`
      },
      {
        title: "Module 3: Data Security, Connectivity & Liability",
        estimatedTime: 15,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Data Security & Connectivity</h2>
          <ul class="list-disc pl-6">
            <li>•   Report data loss due to negligence immediately to IT.</li>
            <li>•   Personal devices prohibited from office Wi-Fi without written IT approval.</li>
            <li>•   Before repair, backup must be taken – otherwise employee solely responsible for data loss.</li>
          </ul>
          <h2 class="text-2xl font-bold text-blue-700 mt-6 mb-4">Liability for Damage or Misuse</h2>
          <ul class="list-disc pl-6">
            <li>•   Employee fully responsible for repair/replacement costs for negligence, misuse, or intentional damage within first 2 years.</li>
            <li>•   Employee may be required to accompany IT/service personnel during repairs.</li>
            <li>•   IT department may conduct periodic audits; employees must cooperate fully.</li>
          </ul>
        </div>`
      },
      {
        title: "Module 4: Offboarding – Device Return Process",
        estimatedTime: 15,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Employee Offboarding – Device Return Process</h2>
          <ul class="list-disc pl-6">
            <li>•   Upon resignation/termination, HR informs IT/Admin to start device return process.</li>
            <li>•   IT/Admin provides list of all issued devices and accessories.</li>
            <li>•   Employee must back up work data and remove personal files before return. Do not delete confidential company data without approval.</li>
            <li>•   All devices must be returned on or before last working day, in working condition unless issues were previously reported.</li>
            <li>•   IT/Admin inspects physical condition, functional status, missing accessories, unauthorized software.</li>
            <li>•   After device receipt, company data is securely erased.</li>
            <li>•   Asset clearance signed off only after all items returned and verified. HR processes final settlement only after clearance.</li>
            <li>•   If devices/accessories not returned: replacement cost deducted from settlement or legal action may be taken.</li>
          </ul>
        </div>`
      }
    ],
    placeholderContent: ""
  },
  {
    title: "Server Policy",
    id: "server-policy",
    estimatedTime: 40,
    contentAvailable: true,
    showOnDashboard: true,
    subtopics: [
      {
        title: "Module 1: Access Control & RDP Session Management",
        estimatedTime: 10,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Access Control & RDP Session Management</h2>
          <p><strong>Purpose:</strong> Ensure secure, controlled access to Iron Server via RDP.</p>
          <h3 class="text-xl font-semibold mt-4 mb-2">Access Control</h3>
          <ul class="list-disc pl-6">
            <li>•   Access only through officially assigned RDP credentials (unique per user).</li>
            <li>•   <strong>Never share, reuse, or disclose credentials to anyone.</strong></li>
            <li>•   Access granted strictly based on job roles and responsibilities.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">RDP Session Management</h3>
          <ul class="list-disc pl-6">
            <li>•   Use RDP sessions only when actively working.</li>
            <li>•   Avoid keeping sessions open or idle – impacts server performance.</li>
            <li>•   <strong>Must properly log off or sign out immediately after work.</strong> Do not leave session disconnected.</li>
            <li>•   Do not keep RDP session open in background when not performing tasks.</li>
          </ul>
        </div>`
      },
      {
        title: "Module 2: Data Storage & File Management",
        estimatedTime: 10,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Data Storage & File Management</h2>
          <ul class="list-disc pl-6">
            <li>•   Do not store unnecessary, temporary, or unused files on server for long durations.</li>
            <li>•   <strong>Storing files directly on Desktop or Downloads folder is strictly prohibited.</strong></li>
            <li>•   Periodic cleanup of recycle bin is required.</li>
            <li>•   All files must be stored in designated directory: <code>E:\\DBP_USER\\&lt;Employee_Name&gt;</code></li>
            <li>•   Users are responsible for regularly reviewing and cleaning up their folders.</li>
          </ul>
        </div>`
      },
      {
        title: "Module 3: Data Confidentiality & Acceptable Use",
        estimatedTime: 10,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Data Confidentiality & Acceptable Use</h2>
          <h3 class="text-xl font-semibold mt-4 mb-2">Data Access & Confidentiality</h3>
          <ul class="list-disc pl-6">
            <li>•   Do not attempt to access, open, modify, or copy files/folders belonging to others or outside authorized permissions.</li>
            <li>•   Maintain strict data confidentiality to prevent leaks.</li>
            <li>•   If you notice your personal folder is accessible to others, <strong>report immediately to management or IT.</strong></li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Acceptable Use Policy</h3>
          <ul class="list-disc pl-6">
            <li>•   Server strictly for official business – no personal/non-work usage.</li>
            <li>•   No accessing, downloading, storing, or sharing adult/inappropriate/offensive content.</li>
            <li>•   Installation or execution of unauthorized software/scripts is not allowed.</li>
          </ul>
        </div>`
      },
      {
        title: "Module 4: Security Best Practices, Monitoring & Incident Reporting",
        estimatedTime: 15,
        content: `<div class="module-content">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Security Best Practices & Compliance</h2>
          <h3 class="text-xl font-semibold mt-4 mb-2">Security Best Practices</h3>
          <ul class="list-disc pl-6">
            <li>•   Maintain strong, secure passwords – do not share or store insecurely.</li>
            <li>•   Systems used to access RDP must have updated antivirus and be malware‑free.</li>
            <li>•   Do not disable, bypass, or alter any server security configurations, antivirus, or monitoring systems.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Monitoring & Compliance</h3>
          <ul class="list-disc pl-6">
            <li>•   All RDP activities are continuously monitored and logged for security and audit purposes.</li>
            <li>•   Suspicious or non‑compliant activity may lead to investigation and action.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Incident Reporting</h3>
          <ul class="list-disc pl-6">
            <li>•   Immediately report any suspicious activity, unauthorized access, data breaches, or system issues to IT/management.</li>
            <li>•   Timely reporting is essential to minimize risks and ensure quick resolution.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Prohibited Activities (Summary)</h3>
          <ul class="list-disc pl-6">
            <li>•   Sharing RDP credentials or using another user's credentials.</li>
            <li>•   Accessing unauthorized data, storing irrelevant files, misusing server resources.</li>
            <li>•   Keeping idle RDP sessions active or failing to log out after work.</li>
          </ul>
          <h3 class="text-xl font-semibold mt-4 mb-2">Responsibility</h3>
          <ul class="list-disc pl-6">
            <li><strong>Employees:</strong> follow all guidelines.</li>
            <li><strong>IT team:</strong> maintain server security, manage access, monitor activity.</li>
            <li><strong>Management:</strong> enforce compliance and take action on violations.</li>
          </ul>
        </div>`
      }
    ],
    placeholderContent: ""
  }
];

const seed = async () => {
  try {
    for (const courseData of coursesData) {
      const existing = await Course.findOne({ id: courseData.id });
      if (!existing) {
        const course = new Course({
          ...courseData,
          createdBy: null // system user (admin)
        });
        await course.save();
        console.log(`Seeded course: ${courseData.title}`);
      } else {
        console.log(`Course ${courseData.title} already exists, skipping.`);
      }
    }

    // Seed questions for each course (if not already present)
    const questionSets = {
      'secure-ai': secureAiQuestions,
      'leave-policy': leavePolicyQuestions,
      'hardware-policy': hardwarePolicyQuestions,
      'server-policy': serverPolicyQuestions
    };
    for (const [courseId, qs] of Object.entries(questionSets)) {
      const existing = await Question.findOne({ courseId });
      if (!existing) {
        const questionsToInsert = qs.map((q, idx) => ({
          courseId,
          text: q.text,
          options: q.options,
          correctAnswers: q.correctAnswers,
          explanation: q.explanation || ''
        }));
        await Question.insertMany(questionsToInsert);
        console.log(`Seeded questions for ${courseId}`);
      } else {
        console.log(`Questions for ${courseId} already exist, skipping.`);
      }
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = seed;