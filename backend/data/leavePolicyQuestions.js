const leavePolicyQuestions = [
  {
    id: 1,
    text: "Which of the following statements about Annual Leaves (AL) are correct as per the policy?",
    options: [
      { letter: "A", text: "Employees are entitled to 12 days of paid annual leave per year on a pro-rata basis" },
      { letter: "B", text: "Annual leave must be approved at least 14 days in advance" },
      { letter: "C", text: "Unused annual leave can be carried forward to the next year" },
      { letter: "D", text: "Annual leave can be clubbed with medical leave consecutively" },
      { letter: "E", text: "Advance annual leave may be allowed in exceptional circumstances" }
    ],
    correctAnswers: ["Employees are entitled to 12 days of paid annual leave per year on a pro-rata basis", "Annual leave must be approved at least 14 days in advance", "Advance annual leave may be allowed in exceptional circumstances"],
    explanation: "Unused leaves are forfeited, cannot be carried forward or encashed. AL and ML cannot be clubbed."
  },
  {
    id: 2,
    text: "Scenario: Priya joined the company on 10th April. She wants to take Annual Leave in May. How much leave is she eligible for in that month according to the pro-rata rule for new joiners?",
    options: [
      { letter: "A", text: "1 Annual Leave + 1 Medical Leave" },
      { letter: "B", text: "0.5 Annual Leave + 0.5 Medical Leave" },
      { letter: "C", text: "0 Annual Leave" },
      { letter: "D", text: "2 Annual Leaves" }
    ],
    correctAnswers: ["0.5 Annual Leave + 0.5 Medical Leave"],
    explanation: "Joining between 6th–15th of the month → 0.5 AL + 0.5 ML for that month."
  },
  {
    id: 3,
    text: "Which of the following are valid reasons for the company to grant advance annual leave or Leave Without Pay (LWP) in exceptional circumstances?",
    options: [
      { letter: "A", text: "Marriage of the employee" },
      { letter: "B", text: "Employee wants to extend a weekend trip" },
      { letter: "C", text: "Serious illness or hospitalization" },
      { letter: "D", text: "Natural calamities" },
      { letter: "E", text: "Employee wants to attend a music festival" }
    ],
    correctAnswers: ["Marriage of the employee", "Serious illness or hospitalization", "Natural calamities"],
    explanation: "Only exceptional circumstances like marriage, illness, hospitalization, or natural calamities qualify."
  },
  {
    id: 4,
    text: "Scenario: Rahul takes Medical Leave on Monday and Tuesday. Wednesday was a public holiday. Thursday and Friday he takes Annual Leave. According to the LWP sandwich rule, how many days will be counted as Leave Without Pay if he has no leave balance left?",
    options: [
      { letter: "A", text: "2 days" },
      { letter: "B", text: "4 days" },
      { letter: "C", text: "5 days" },
      { letter: "D", text: "7 days" }
    ],
    correctAnswers: ["5 days"],
    explanation: "AL and ML cannot be clubbed; ML after AL is treated as AL. With no AL balance, LWP applies. Monday–Friday + Wednesday holiday = 5 days LWP (Monday–Friday excluding Tuesday? Wait recalc: Actually Monday ML, Tuesday ML, Wednesday PH, Thursday AL, Friday AL → total 5 days (Mon, Tue, Thu, Fri + Wednesday PH sandwich? The policy counts sandwiched holidays/weekends. Correct answer is 5 days)."
  },
  {
    id: 5,
    text: "Which of the following are mandatory requirements for availing Medical Leave (ML)?",
    options: [
      { letter: "A", text: "Informing reporting manager and HR within first 4 hours of the working day" },
      { letter: "B", text: "Submitting medical leave application within the next working day after rejoining" },
      { letter: "C", text: "Medical certificate and prescription for even a single day of ML" },
      { letter: "D", text: "Prior approval from client" },
      { letter: "E", text: "Submission of hospital admission slip for all ML" }
    ],
    correctAnswers: ["Informing reporting manager and HR within first 4 hours of the working day", "Submitting medical leave application within the next working day after rejoining", "Medical certificate and prescription for even a single day of ML"],
    explanation: "Medical certificate and prescription are required even for 1 day; prior client approval not required; hospital slip only for hospitalization leave."
  },
  {
    id: 6,
    text: "Scenario: Neha has completed 1.5 years with the company. She is hospitalized for 10 days on doctor's written order. What is she entitled to?",
    options: [
      { letter: "A", text: "12 days paid medical leave only" },
      { letter: "B", text: "15 additional calendar days of paid hospitalization leave" },
      { letter: "C", text: "No hospitalization leave because she needs 2 years of service" },
      { letter: "D", text: "Only unpaid leave" }
    ],
    correctAnswers: ["15 additional calendar days of paid hospitalization leave"],
    explanation: "After 1 year of service, employees are eligible for up to 15 additional calendar days of paid hospitalization leave."
  },
  {
    id: 7,
    text: "Which of the following are true about Parent-care and Child-care Leaves?",
    options: [
      { letter: "A", text: "Available after 3 months of continuous service" },
      { letter: "B", text: "2 days per year combined for both parent-care and child-care" },
      { letter: "C", text: "Child must be below 7 years of age" },
      { letter: "D", text: "Parents above 60 years living with employee" },
      { letter: "E", text: "Can be availed for any number of children" }
    ],
    correctAnswers: ["Available after 3 months of continuous service", "2 days per year combined for both parent-care and child-care", "Child must be below 7 years of age"],
    explanation: "Parents must be above 65, and only first 2 children are eligible."
  },
  {
    id: 8,
    text: "Scenario: Vikram works on a client site. He applies for Annual Leave via WhatsApp message to his manager. The manager approves verbally. Is this considered a valid leave approval as per policy?",
    options: [
      { letter: "A", text: "Yes, because manager approved verbally" },
      { letter: "B", text: "Yes, if HR is informed later" },
      { letter: "C", text: "No, email/SMS/WhatsApp are not treated as approval" },
      { letter: "D", text: "No, only client approval is needed" }
    ],
    correctAnswers: ["No, email/SMS/WhatsApp are not treated as approval"],
    explanation: "Policy explicitly states that email/SMS/WhatsApp or any other form of leave application will not be treated as approval."
  },
  {
    id: 9,
    text: "In which of the following cases will a weekend be counted as Leave Without Pay (LWP)?",
    options: [
      { letter: "A", text: "LWP taken on Monday and Friday with weekend in between" },
      { letter: "B", text: "LWP taken on Tuesday and Wednesday only" },
      { letter: "C", text: "Paid leave immediately followed by LWP making total absence more than half the working week" },
      { letter: "D", text: "LWP taken on Friday only" },
      { letter: "E", text: "LWP taken for full Monday to Friday week" }
    ],
    correctAnswers: ["LWP taken on Monday and Friday with weekend in between", "Paid leave immediately followed by LWP making total absence more than half the working week", "LWP taken for full Monday to Friday week"],
    explanation: "Sandwiched weekends count as LWP when LWP is taken on both sides or when absence exceeds half the working week. Full week LWP includes weekends."
  },
  {
    id: 10,
    text: "Scenario: A team has 10 members. The manager wants to approve Annual Leave for 6 of them on the same day. Is this allowed under the policy?",
    options: [
      { letter: "A", text: "Yes, if they all have leave balance" },
      { letter: "B", text: "Yes, with client approval" },
      { letter: "C", text: "No, under no circumstance more than 50% of staff in a team shall be granted AL" },
      { letter: "D", text: "No, only 2 members can take AL on the same day" }
    ],
    correctAnswers: ["No, under no circumstance more than 50% of staff in a team shall be granted AL"],
    explanation: "Policy states: Under no circumstance more than 50% of the staff under any department/team shall be granted AL."
  },
];

module.exports = leavePolicyQuestions;