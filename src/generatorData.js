// Hard-coded demo scenarios. The "generator" does not analyse the text:
// each sample requirement maps to a pre-written result (see Generator.jsx).

export const SCENARIOS = [
  {
    id: "videokyc",
    label: "Video KYC for remote customers",
    requirement:
`We want to let customers who cannot visit a branch complete KYC over a live video call.
- An agent should join a scheduled video call, see the customer's ID and confirm their identity.
- Customers must be able to book a time slot, including evenings and weekends.
- Every call has to be recorded and stored for 7 years for audit.
- If the call fails or the ID is unclear, the customer is routed back to the digital flow without losing progress.
- Compliance needs a dashboard showing calls completed, failed and pending review.`,
    epics: [
      {
        key: "e1", subject: "Video KYC Calls", color: "#8b5cf6",
        description: "Let remote customers verify their identity through a live agent-assisted video call.",
        stories: [
          { subject: "Customer books a video KYC slot", points: 3, role: "Front",
            description: "As a customer, I can pick an available time slot, including evenings and weekends, so that I can verify my identity without visiting a branch.",
            criteria: ["Available slots shown for the next 14 days", "Booking confirmation sent by email and SMS", "Customer can reschedule up to 1 hour before the call"] },
          { subject: "Agent conducts live ID verification over video", points: 8, role: "Back",
            description: "As a KYC agent, I can join the call, view the customer's ID and mark the identity as verified or rejected.",
            criteria: ["Agent sees ID image capture alongside live video", "Outcome (verified / rejected / retry) is saved with a reason", "Agent cannot complete the call without a recorded outcome"] },
          { subject: "Fallback to digital flow when a call fails", points: 5, role: "Back",
            description: "As a customer, if the call drops or my ID is unclear, I am returned to the digital flow without losing my progress.",
            criteria: ["Application state is preserved on failure", "Customer is offered a new slot or digital verification", "Failure reason is logged for operations"] },
        ],
      },
      {
        key: "e2", subject: "KYC Audit and Oversight", color: "#f59e0b",
        description: "Retain evidence and give compliance visibility over remote verification.",
        stories: [
          { subject: "Record and archive calls for 7 years", points: 5, role: "Back",
            description: "As compliance, every video KYC call is recorded and stored securely for 7 years so that we can answer audits.",
            criteria: ["Recordings encrypted at rest", "Retrieval by customer or call ID within 24 hours", "Automatic deletion after the retention period"] },
          { subject: "Compliance dashboard for call outcomes", points: 3, role: "Front",
            description: "As a compliance officer, I can see calls completed, failed and pending review so that I can spot problems early.",
            criteria: ["Daily and weekly counts by outcome", "Filter by agent and date range", "Export to CSV"] },
        ],
      },
    ],
  },
  {
    id: "cardcontrols",
    label: "Mobile card controls",
    requirement:
`Customers keep calling the contact centre to freeze lost cards and change limits. We want to move this into the mobile app.
- Customers can freeze and unfreeze any of their cards instantly.
- They can set daily limits for ATM, online and contactless spending.
- They can switch international and online transactions on or off.
- They get a push notification whenever a card is used abroad or a limit change is made.
- Contact centre agents should see the same controls so support is consistent.`,
    epics: [
      {
        key: "e1", subject: "Self-Service Card Controls", color: "#06b6d4",
        description: "Move freeze, limit and channel settings from the contact centre into the mobile app.",
        stories: [
          { subject: "Freeze and unfreeze a card instantly", points: 3, role: "Front",
            description: "As a customer, I can freeze a lost or misplaced card and unfreeze it later, so that I stay in control without calling the bank.",
            criteria: ["Card is blocked for new transactions within 5 seconds", "Clear frozen state shown on the card", "Unfreezing requires re-authentication"] },
          { subject: "Set daily spending limits by channel", points: 5, role: "Back",
            description: "As a customer, I can set daily limits for ATM, online and contactless use so that I limit my risk.",
            criteria: ["Limits cannot exceed the product maximum", "Changes take effect immediately", "Limit history is stored for audit"] },
          { subject: "Toggle international and online transactions", points: 3, role: "Back",
            description: "As a customer, I can switch international and online payments on or off so that I only enable them when needed.",
            criteria: ["Toggles apply per card", "Declined attempts show a helpful reason", "Default is off for new cards"] },
        ],
      },
      {
        key: "e2", subject: "Alerts and Support Consistency", color: "#ef4444",
        description: "Keep customers informed and make agent tools match the app.",
        stories: [
          { subject: "Push alerts for foreign use and limit changes", points: 3, role: "Back",
            description: "As a customer, I receive a push notification when my card is used abroad or a limit is changed, so that I can spot fraud quickly.",
            criteria: ["Alert sent within 30 seconds", "Alert links to the card controls screen", "Customer can choose which alerts to receive"] },
          { subject: "Agent console mirrors customer card controls", points: 5, role: "Front",
            description: "As a contact centre agent, I see and can apply the same controls as the customer so that support is consistent.",
            criteria: ["Agent actions are labelled as agent-initiated", "Customer is notified of agent changes", "Full action history visible to supervisors"] },
        ],
      },
    ],
  },
];
