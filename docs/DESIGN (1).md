# DESIGN.md

# Altrix Labs --- AI-Powered Personal Health Copilot

> **Purpose:** Define a clear, professional, accessible, and
> implementation-ready UI/UX direction for the Altrix Labs Personal
> Health Copilot.
>
> **Design principle:** A person should understand what a screen means,
> what matters, and what to do next with a quick glance---without
> needing to interpret complex medical terminology.

------------------------------------------------------------------------

## 1. Product Experience

The product helps people organize and understand their healthcare
information, including medical records, prescriptions, diagnostic
reports, and wellness data. It should turn complex information into
understandable summaries and practical next steps while making clear
that AI-generated information is not a medical diagnosis.

### Experience goals

1.  **Understand at a glance:** Use clear headings, short summaries,
    meaningful icons, status labels, and visual hierarchy.
2.  **Reduce anxiety:** Use calm colors, plain language, and neutral,
    non-alarming explanations.
3.  **Make the next step obvious:** Each important insight should
    explain what it means and, where appropriate, what the user can do
    next.
4.  **Keep evidence visible:** Let users open the source report or
    document behind an extracted value or AI summary.
5.  **Respect privacy:** Clearly show upload, processing, and sharing
    states. Never expose one user's health data to another user.
6.  **Support all users:** Use responsive layouts, keyboard-friendly
    controls, readable text, and accessible contrast.

------------------------------------------------------------------------

## 2. Visual Direction

### Overall style

Use a modern healthcare dashboard: clean, spacious, calm, and
trustworthy. Avoid a cluttered hospital-monitor appearance, excessive
gradients, decorative animations, or dense blocks of medical data.

### Suggested design tokens

  -----------------------------------------------------------------------
  Token                   Suggested value         Usage
  ----------------------- ----------------------- -----------------------
  Primary                 `#176B66`               Primary buttons,
                                                  selected navigation,
                                                  key actions

  Primary dark            `#10514E`               Hover and pressed
                                                  states

  Accent                  `#DDF4EE`               Calm highlight
                                                  backgrounds

  App background          `#F6F8FA`               Main page background

  Surface                 `#FFFFFF`               Cards, dialogs, panels

  Main text               `#172B2A`               Headings and body text

  Secondary text          `#5E6F70`               Supporting information

  Border                  `#E2E8EA`               Dividers and card
                                                  borders

  Success                 `#247A4B`               Completed or in-range
                                                  states

  Attention               `#946200`               Review needed; not an
                                                  emergency label

  Critical                `#B42318`               Carefully verified
                                                  critical warnings only

  Information             `#245DA8`               Explanations and
                                                  informational states
  -----------------------------------------------------------------------

These are starting tokens, not a substitute for checking contrast and
accessibility in the implemented UI. Never communicate status using
color alone; pair color with a label and/or icon.

### Typography

-   Use **Inter**, **Roboto**, or the system sans-serif font.
-   Page title: 28--32 px desktop; 24--28 px mobile.
-   Section title: 18--22 px.
-   Body text: 14--16 px; avoid small text for health explanations.
-   Metadata: 12--14 px, with adequate contrast.
-   Use short sentences, sentence case, and familiar words.
-   Explain medical abbreviations on first use. For example, "Blood
    pressure" before "BP."

### Shape, spacing, and icons

-   Use a consistent 8 px spacing scale.
-   Cards: 12--16 px corner radius, subtle border, minimal shadow.
-   Buttons and inputs: comfortable touch targets, ideally at least 44 ×
    44 px.
-   Use one consistent line-icon set (for example, Lucide).
-   Icons must support a text label; do not make an icon carry essential
    meaning alone.
-   Keep layouts aligned and predictable. Use whitespace to separate
    different tasks.

------------------------------------------------------------------------

## 3. Navigation and Information Architecture

### Primary navigation

Use a stable left sidebar on desktop and a compact navigation pattern on
mobile.

1.  **Overview** --- today's summary and next steps.
2.  **My Records** --- uploaded documents and extracted information.
3.  **Prescriptions** --- medication details and reminders, if
    supported.
4.  **Reports & Trends** --- diagnostic results and changes over time.
5.  **Wellness** --- user-entered wellness data and trends.
6.  **Ask Health Copilot** --- question-and-answer experience grounded
    in the user's available records.
7.  **Appointments & Tasks** --- follow-ups and reminders, if supported.
8.  **Settings & Privacy** --- account, consent, data controls, and
    preferences.

Only show a navigation item as functional when its underlying feature is
implemented. For planned features, use a clearly marked disabled or
"Coming soon" state rather than a misleading empty page.

### Global header

Include: - Current page title or breadcrumb. - A clearly labelled upload
action where relevant. - Notifications only if notifications are
implemented. - Profile and settings access. - A visible account/session
state.

Do not display sensitive medical details in notifications or on-screen
previews by default.

------------------------------------------------------------------------

## 4. Screen Designs

### 4.1 Overview Dashboard

**Purpose:** Help a person understand their health information and the
next useful action in seconds.

Recommended hierarchy:

1.  Greeting and concise page title, such as **"Your health, made easier
    to understand."**
2.  A compact "Your health information" summary: documents available,
    most recent upload, and last updated date.
3.  **Needs your attention** section for verified items requiring
    review. Do not create urgency from uncertain AI inferences.
4.  **Recent activity** showing uploads, completed processing, and
    viewed reports.
5.  **Your latest insights** with a plain-language summary and source
    links.
6.  A clear primary action: **Upload a medical document**.
7.  A secondary action: **Ask Health Copilot**.

Each insight card should answer: - **What was found?** - **What does it
mean in plain language?** - **Where did it come from?** - **What can I
do next?**

Avoid a dashboard full of unexplained charts, arbitrary health scores,
or fabricated risk percentages. Show a metric only when its source,
date, units, and interpretation are available.

### 4.2 Upload and Document Processing

Use a simple, guided flow:

1.  **Choose a document** --- click to browse or drag and drop on
    supported desktop browsers.
2.  **Confirm details** --- display filename, document type if detected,
    and an option to correct it.
3.  **Process securely** --- show clear progress states.
4.  **Review extracted information** --- show extracted fields beside
    the original document when practical.
5.  **Save or correct** --- allow corrections and clearly distinguish
    user-confirmed values from machine-extracted values.

Suggested processing states: - Waiting to upload - Uploading - File
received - Reading document - Extracting information - Checking
extracted fields - Ready for review - Completed - Needs attention /
Failed, with a helpful retry option

Never show a successful status before processing has actually completed.
Do not silently discard a failed upload.

### 4.3 My Records

Use a searchable, filterable list or table with: - Document name -
Document type - Date on the document, if detected - Upload date -
Processing/review status - Actions: View, Review extraction, Rename, or
Delete

Provide clear empty, loading, error, and no-results states. On mobile,
use stacked document cards instead of a cramped table.

When a user opens a record, present the original file and extracted
information with an obvious relationship between them. Where feasible,
let a user select an extracted field and see the corresponding source
location. Label OCR-extracted data as **"Extracted---please verify"**
until confirmed.

### 4.4 Prescription Details

Show only information actually present in the source or entered by the
user: - Medication name - Strength and dosage as written - Instructions
and frequency as written - Prescriber, if available - Start/end dates,
if available - Source prescription and date - Review status

Do not infer a dosage or recommend starting, stopping, or changing
medication. If text is unclear, show **"Could not verify---check the
original prescription or ask your pharmacist/clinician."**

Medication reminders should be opt-in and should follow the prescription
details supplied by the user or a verified source.

### 4.5 Reports and Trends

Present diagnostic values with: - Test name - Value and unit - Date
collected or reported - Reference range from the source laboratory, when
available - A text label such as "Within the listed range" or "Outside
the listed range" - A link to the source report

Do not apply a universal reference range when the report provides its
own. Explain that interpretation can depend on age, medical history,
laboratory methods, and clinician assessment.

Use charts only when there are enough comparable dated values to make a
trend meaningful. Label axes and units. Keep a readable text/table
alternative. Never imply that a trend alone establishes a diagnosis.

### 4.6 Ask Health Copilot

The chat should feel approachable and transparent, not like a
replacement for a clinician.

Recommended layout: - A brief introduction explaining what the copilot
can help with. - Suggested prompts such as "Summarize my latest report,"
"Explain this term," and "What information does this prescription
contain?" - A clear message composer and send button. - Answers in short
sections with headings and plain language. - Source references linking
to the user's relevant records. - A visible way to report an incorrect
extraction or answer.

For record-grounded answers, show source document names and dates. If no
supporting information is found, say so plainly rather than inventing an
answer. Distinguish facts extracted from records from general
educational information and AI-generated interpretation.

**Safety message:** "Health Copilot helps explain your records. It does
not diagnose conditions or replace a qualified healthcare professional."

For symptoms that may indicate an emergency, provide a calm, direct
instruction to contact local emergency services or seek urgent medical
care; do not attempt to manage emergencies through chat.

### 4.7 Wellness

Show only wellness information the user has entered or explicitly
connected, such as activity, sleep, or other supported measurements.

-   Show units, dates, and data origin.
-   Explain what a trend represents without overclaiming.
-   Let users edit or remove manually entered data.
-   Make connected-data permissions and sync status visible.
-   Do not invent wellness measurements when no data is available.

### 4.8 Settings and Privacy

Include: - Profile and account settings - Consent and data-use
explanations - Connected data sources and permissions - Download/export
options, if implemented - Delete-document and delete-account controls,
if implemented - Session and sign-out controls - Notification
preferences

Use confirmation steps for destructive actions and clearly state what
will be deleted. Enforce authorization on the backend; hiding a button
is not a security control.

------------------------------------------------------------------------

## 5. Professional Animation and Motion

The animation style should be **subtle, purposeful, and understandable
at a glance**. Motion should explain what changed or guide the user's
attention---not decorate every element.

### Motion principles

1.  **Purpose before polish:** Animate only to communicate state,
    hierarchy, progress, or a relationship.
2.  **Short and calm:** Most transitions should take about 150--250 ms.
3.  **Predictable:** Use consistent easing and timing across similar
    interactions.
4.  **No motion overload:** Avoid bouncing cards, constant pulsing,
    spinning decorative objects, parallax, and autoplaying backgrounds.
5.  **Respect reduced motion:** Honor the operating system's
    reduced-motion preference and provide an equally understandable
    static state.
6.  **Never hide information in animation:** The content must remain
    understandable when motion is disabled or unavailable.

### Recommended motion patterns

  -----------------------------------------------------------------------
  UI element              Motion                  Purpose
  ----------------------- ----------------------- -----------------------
  Page transition         Gentle fade, about      Establish a smooth
                          150--200 ms             change of context

  Sidebar or menu         Short slide/fade, about Show where navigation
                          150--200 ms             opened

  Card hover              Very subtle elevation   Communicate
                          or border change        interactivity

  Upload progress         Determinate progress    Show how much work
                          bar when progress is    remains
                          known                   

  OCR processing          Static step list with   Explain what the system
                          the current step        is doing
                          highlighted; optional   
                          restrained indicator    

  Successful completion   Small checkmark         Confirm completion
                          transition, once        

  Expandable explanation  Height/fade transition, Reveal extra detail
                          about 150--200 ms       without losing context

  Chart appearance        Brief reveal on first   Help users notice data;
                          render only             do not delay reading

  Error state             No shake or flashing;   Communicate the problem
                          show an icon, clear     calmly
                          text, and recovery      
                          action                  
  -----------------------------------------------------------------------

### Example: document-processing experience

The user uploads a report and sees a clear sequence:

**Uploaded → Reading document → Extracting information → Ready for
review**

The active step may use a subtle transition, but all steps remain
labelled. When processing finishes, show a checkmark and the message
**"Your document is ready to review."** If extraction is uncertain,
highlight the affected fields and ask the user to verify them. Do not
use a vague animated spinner as the only explanation.

### Motion implementation notes

-   Prefer CSS transitions for simple interface motion.
-   Use an animation library only if it adds real value.
-   Animate `opacity` and `transform` where practical to keep
    transitions smooth.
-   Avoid animating large layout dimensions unnecessarily.
-   Do not use motion to imply a medical result is more reliable or more
    serious.
-   Keep loading indicators from running after a request has completed
    or failed.
-   Test transitions on lower-powered phones and with keyboard
    navigation.

------------------------------------------------------------------------

## 6. Content and Microcopy

Write for a person who may be unfamiliar with medical terminology.

Prefer: - "Your report is ready to review." - "This value is outside the
range listed by the laboratory." - "We could not read this field
clearly. Please check the original document." - "No matching information
was found in your uploaded records." - "View source report." - "Ask a
healthcare professional if you are unsure what this means."

Avoid: - Unexplained acronyms. - Unsupported claims such as "You are
healthy." - Unverified diagnoses or risk predictions. - Alarmist labels
and unexplained red indicators. - False certainty when OCR or AI
confidence is low.

Use confidence scores internally where appropriate, but do not expose a
raw model score as though it were a clinical certainty. User-facing
labels should be based on validated thresholds and clearly explained.

------------------------------------------------------------------------

## 7. Reusable Components

Build a consistent component library: - App shell and responsive
navigation - Page header and breadcrumbs - Primary, secondary, and
destructive buttons - Search field, filters, and date selectors -
Document upload/drop zone - Processing stepper and progress bar -
Document list/card - Extracted-field review row - Health insight card
with source - Lab-result row and trend chart - Chat message and source
citation - Status badge with icon and text - Empty, loading, error, and
success states - Confirmation dialog - Accessible toast/notification -
Privacy and safety notice

Each component should have default, hover, focus, disabled, loading,
success, and error states where relevant.

------------------------------------------------------------------------

## 8. Accessibility and Responsive Behaviour

-   Meet WCAG 2.2 AA contrast goals where applicable.
-   Use semantic headings, form labels, and accessible names.
-   Ensure full keyboard access and visible focus indicators.
-   Announce important asynchronous status updates to assistive
    technology without repeatedly interrupting users.
-   Never rely only on color, motion, or icon shape to convey meaning.
-   Support browser zoom and text resizing.
-   Respect reduced-motion preferences.
-   Use readable line lengths and generous spacing.
-   On small screens, prioritize the main task and stack cards
    vertically.
-   Keep important actions reachable without horizontal scrolling.
-   Provide text alternatives for charts and other visual summaries.

------------------------------------------------------------------------

## 9. Privacy, Security, and Healthcare Safety

-   Treat uploaded medical documents and extracted fields as sensitive
    personal information.
-   Enforce authentication, ownership checks, and authorization on every
    protected backend operation.
-   Keep secrets in environment variables or a secrets manager; never
    put passwords or API keys in source code, documentation, or client
    bundles.
-   Do not use a shared team password as the application's authorization
    system.
-   Avoid logging raw medical documents, tokens, passwords, or
    unnecessary personal health information.
-   Encrypt data in transit and at rest using appropriate platform
    capabilities.
-   Define retention, deletion, backup, and access-audit policies before
    production.
-   Request only the permissions necessary for each feature.
-   Do not train on or share user health information without a valid,
    clearly communicated basis and required consent.
-   Display the source and date for extracted clinical information.
-   Keep AI outputs clearly labelled and reviewable.
-   Never represent the product as a diagnostic device or a substitute
    for professional care without the required validation, approvals,
    and regulatory review.

The team should confirm applicable privacy, security, and healthcare
requirements for the intended deployment jurisdiction before launch.

------------------------------------------------------------------------

## 10. Team Boundaries and Integration

This design document defines the intended user experience; it does not
authorize a team member to modify another member's implementation.

-   Keep each team member's assigned module and working files clearly
    identified in the project's task tracker.
-   Before editing another member's files, request and receive that
    member's permission, following the team's agreed process.
-   Use version control, small changes, and code review to reduce
    accidental overwrites.
-   Never store personal passwords in this document or commit them to
    the repository.
-   Share integration contracts, API schemas, component interfaces, and
    mock data rather than copying another member's private credentials
    or unrelated work.
-   Maintain a dedicated **Unity Integration** section for the Unity
    work developed outside Antigravity.
-   The Unity section should link to the external repository or project
    location and document the integration owner, interface/contract,
    expected inputs and outputs, and integration status. Do not assume
    the Unity implementation is inside the Antigravity workspace.

### Suggested Unity Integration panel

Display a simple panel containing: - **Unity module status:** Not
connected / In progress / Ready for integration - **Project link:**
Configured external link - **Owner:** Assigned team member -
**Integration contract:** Link to API or interface documentation -
**Last verified:** Date of the latest successful integration check

Only show real values supplied by the team; do not display fabricated
status or links.

------------------------------------------------------------------------

## 11. Implementation Priorities

### Phase 1 --- Foundation

-   App shell, navigation, typography, color tokens, responsive layout
-   Authentication and user-specific authorization
-   Dashboard empty states and document upload entry point

### Phase 2 --- Document workflow

-   Upload, file validation, processing status, OCR results
-   Original-document viewer and extracted-field review
-   Clear errors, retry, and correction workflows

### Phase 3 --- Health understanding

-   Records list and search
-   Source-linked report summaries
-   Prescription display
-   RAG-based copilot answers with source citations and fallback when
    evidence is missing

### Phase 4 --- Insights and integrations

-   Meaningful trends when sufficient data exists
-   Wellness features backed by real data
-   Unity integration panel and verified connection
-   Optional reminders and automation with user consent

### Phase 5 --- Quality and release

-   Accessibility and responsive testing
-   Privacy and security review
-   Medical-content safety review
-   Performance and reduced-motion testing
-   Usability testing with people unfamiliar with the product

------------------------------------------------------------------------

## 12. Definition of Done

A screen or workflow is ready when:

-   [ ] Its purpose is understandable within a few seconds.
-   [ ] The main action is visually clear and uses plain language.
-   [ ] Loading, empty, success, and error states are handled.
-   [ ] Health values show source, date, and units when available.
-   [ ] OCR uncertainty and AI limitations are communicated honestly.
-   [ ] Source documents can be opened where relevant.
-   [ ] The layout works on mobile and desktop.
-   [ ] Keyboard navigation, focus, contrast, and screen-reader basics
    are tested.
-   [ ] Motion is subtle, useful, and reduced-motion friendly.
-   [ ] User data is protected by backend authorization.
-   [ ] No placeholder action falsely appears to work.
-   [ ] The change stays within the assigned module or has explicit
    permission.
-   [ ] Unity integration status and links reflect verified information.

------------------------------------------------------------------------

## Final Design Standard

**Make complex health information feel simple, calm, and actionable.**
Every screen should answer three questions:

1.  **What am I looking at?**
2.  **What does it mean?**
3.  **What can I do next?**

Use professional visual hierarchy, restrained animation, source-linked
information, and honest uncertainty. The interface should help people
understand their health records---not overwhelm them or pretend to
replace their healthcare professional.
