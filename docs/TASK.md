# TASK.md

## Altrix Labs --- AI-Powered Personal Health Copilot

**Project:** TPU\
**Purpose:** Step-by-step task guide for each workstream, with clear
boundaries, dependencies, and completion checks.

> **Important:** This file describes planned work. It does not claim
> that tasks are already implemented. Confirm the final owner names and
> the actual repository/module names with the team before starting.

------------------------------------------------------------------------

# 1. How Every Team Member Should Work

Follow this same small-task workflow for every assigned item:

1.  **Read the task:** Understand the goal and expected result before
    coding.
2.  **Check your boundary:** Work only in your assigned section, files,
    and modules.
3.  **Check dependencies:** Confirm that required API contracts, sample
    data, environment variables, or upstream modules are ready.
4.  **Plan the smallest change:** Split work into small commits rather
    than building everything at once.
5.  **Implement one step:** Finish and test the current step before
    moving to the next.
6.  **Test locally:** Include normal use, empty input, invalid input,
    and failure cases where relevant.
7.  **Document the result:** Record how to run it, what changed, tests
    performed, and known limitations.
8.  **Request review:** Ask the relevant owner to review the work before
    integration.
9.  **Integrate safely:** Merge or connect only through the agreed
    interface and review process.
10. **Update status:** Mark the task as Done only when its completion
    checklist is satisfied.

## Team boundaries and permission rules

-   Each person owns their assigned branch/section and agreed files.
-   Do not edit another person's files, module, branch, or interface
    without that owner's explicit permission.
-   If your work needs a change outside your boundary, explain why, list
    the exact files or interface affected, and request permission first.
-   Do not overwrite or remove another person's work. Use version
    control, review, and small commits.
-   Use individual accounts and secure authentication where available.
    **Never put passwords, API keys, tokens, or secrets in this file,
    source code, commits, screenshots, or logs.**
-   A branch is a version-control workflow, not a security boundary by
    itself. Use repository permissions as well where possible.
-   Do not assume that a person owns a workstream just because their
    name appears in a conversation. Confirm ownership with the team.

------------------------------------------------------------------------

# 2. Workstream A --- Frontend and UI/UX

**Owner:** To be confirmed by the team\
**Goal:** Make the health copilot easy to understand at a glance,
uncluttered, responsive, and accessible. Use simple animations only when
they explain a state or action.

## Step A1 --- Understand the user journey

-   [ ] Read the PRD, specification, architecture, and design
    requirements.
-   [ ] List the main screens: sign-in, dashboard, upload, document
    details, health insights, and settings.
-   [ ] Draw a simple user flow from sign-in to document upload to
    viewing an insight.
-   [ ] Confirm the API/data contract with the backend owner before
    relying on fields that are not agreed.

**Complete when:** The screen list and user flow are reviewed and
agreed.

## Step A2 --- Create the UI foundation

-   [ ] Set up the frontend structure and routing.
-   [ ] Define shared colors, typography, spacing, buttons, cards, form
    controls, and status labels.
-   [ ] Build a reusable page layout and navigation.
-   [ ] Confirm mobile, tablet, and desktop layout behavior.

**Complete when:** A consistent shell and reusable components work
across screen sizes.

## Step A3 --- Build the dashboard

-   [ ] Add a welcome/header area and clear navigation.
-   [ ] Add document counts or recent-document cards only when backed by
    real data.
-   [ ] Add recent activity and reminders if supported by the agreed
    requirements.
-   [ ] Add clear empty states for a new user with no uploaded records.
-   [ ] Avoid inventing health scores or medical values.

**Complete when:** The dashboard is understandable with both real data
and an empty account.

## Step A4 --- Build upload and processing states

-   [ ] Create a file-selection/drop area with supported file types and
    size limits from backend requirements.
-   [ ] Show validation errors before upload when possible.
-   [ ] Show upload progress, processing, success, and failure states.
-   [ ] Let the user retry a failed upload where supported.
-   [ ] Make the current status readable without relying on color alone.

**Complete when:** Users can tell what happened to a document at every
stage.

## Step A5 --- Build document and insight views

-   [ ] Display document name, type, date, and processing status.
-   [ ] Display extracted information with clear headings and units.
-   [ ] Separate source facts from AI-generated interpretation.
-   [ ] Show source-document/page references when the backend supplies
    them.
-   [ ] Display uncertainty and safety messages near the relevant
    insight.
-   [ ] Provide a way to report or correct inaccurate extraction if
    included in the approved scope.

**Complete when:** A user can trace an important insight back to its
source.

## Step A6 --- Add understandable motion

-   [ ] Animate upload progress and processing transitions subtly.
-   [ ] Use short transitions to guide attention to a newly available
    result.
-   [ ] Do not animate every card or add decorative motion that
    distracts from medical information.
-   [ ] Respect reduced-motion settings.
-   [ ] Ensure all information remains understandable if animation is
    disabled.

**Complete when:** Motion improves clarity and never blocks access to
content.

## Step A7 --- Test and hand off

-   [ ] Test navigation, forms, keyboard access, readable contrast, and
    responsive layouts.
-   [ ] Test loading, empty, success, and error states.
-   [ ] Use mocked API data only where clearly marked as development
    data.
-   [ ] Document environment setup and the screens/components changed.
-   [ ] Request review from the relevant owners before integrating.

**Deliverables:** Frontend pages, reusable components, UI states, tests,
and run instructions.

------------------------------------------------------------------------

# 3. Workstream B --- Backend and APIs

**Owner:** To be confirmed by the team\
**Goal:** Provide secure, documented APIs for users, documents,
processing status, extracted content, and approved insights.

## Step B1 --- Agree on the contract

-   [ ] Read the architecture and PRD.
-   [ ] List required entities: user, document, processing job,
    extracted result, and insight.
-   [ ] Define request/response schemas and error formats.
-   [ ] Agree on endpoints and status values with the frontend, OCR, AI,
    and RAG owners.
-   [ ] Record the contract before parallel development begins.

**Complete when:** Other workstreams know the expected inputs and
outputs.

## Step B2 --- Set up the service

-   [ ] Create the backend project structure.
-   [ ] Configure local development and environment variables.
-   [ ] Add configuration validation and safe error handling.
-   [ ] Add health/readiness checks where appropriate.
-   [ ] Document how to start the service locally.

**Complete when:** A teammate can run the service using the documented
instructions.

## Step B3 --- Implement identity and access checks

-   [ ] Use the team's approved authentication approach.
-   [ ] Enforce authorization on every user-specific route.
-   [ ] Check document ownership before read, update, download, or
    delete operations.
-   [ ] Avoid trusting user IDs supplied by the client without
    authorization checks.
-   [ ] Add tests that attempt to access another user's records.

**Complete when:** Unauthorized access attempts are rejected and covered
by tests.

## Step B4 --- Implement document APIs

-   [ ] Validate file metadata, file type, and size.
-   [ ] Store files using the approved storage approach.
-   [ ] Create a document record and processing status.
-   [ ] Provide endpoints to list and view only the current user's
    documents.
-   [ ] Provide status updates and safe failure messages.
-   [ ] Add deletion behavior according to the agreed data lifecycle.

**Complete when:** A document can be uploaded, tracked, viewed, and
handled securely.

## Step B5 --- Connect OCR and AI services

-   [ ] Define the handoff format for OCR results.
-   [ ] Store extraction status and normalized results.
-   [ ] Pass only the authorized document content required by AI/RAG.
-   [ ] Save generated insights with source references and processing
    metadata.
-   [ ] Handle timeouts, retries, duplicate requests, and failed jobs
    safely.

**Complete when:** Each processing stage has a clear status and
predictable failure behavior.

## Step B6 --- Validate and document

-   [ ] Add unit and API tests.
-   [ ] Test invalid requests and permission failures.
-   [ ] Avoid logging sensitive health content or secrets.
-   [ ] Document endpoints, schemas, configuration, and known
    limitations.
-   [ ] Request API contract review before integration.

**Deliverables:** Backend service, API specification, data models,
tests, and setup documentation.

------------------------------------------------------------------------

# 4. Workstream C --- OCR and Medical Document Intelligence

**Owner:** To be confirmed by the team\
**Goal:** Extract readable, structured information from medical
documents while preserving uncertainty and traceability.

## Step C1 --- Define supported inputs

-   [ ] Collect approved, non-identifying sample documents for
    development.
-   [ ] List supported formats and any file/page limits.
-   [ ] Include examples of prescriptions, diagnostic reports, lab
    reports, and medical records.
-   [ ] Agree on the normalized output schema with backend and AI
    owners.

**Complete when:** Supported inputs, exclusions, and output fields are
documented.

## Step C2 --- Build a basic extraction pipeline

-   [ ] Detect file type and reject unsupported files safely.
-   [ ] Extract text from digitally generated documents where possible.
-   [ ] Apply OCR to scanned pages or images.
-   [ ] Preserve page boundaries and useful layout information.
-   [ ] Return a clear failure state when a file cannot be read.

**Complete when:** Sample documents produce text or an explicit,
understandable failure.

## Step C3 --- Normalize the extracted content

-   [ ] Identify headings, dates, test names, results, units, and
    reference ranges where available.
-   [ ] Identify medication names and instructions only when legible.
-   [ ] Preserve the original text and page/section references.
-   [ ] Avoid guessing missing values or silently correcting uncertain
    text.
-   [ ] Mark uncertain fields for review.

**Complete when:** Structured output can be traced to the source and
uncertainty is represented.

## Step C4 --- Evaluate quality

-   [ ] Build a small test set with expected extracted results.
-   [ ] Test low-resolution scans, rotated pages, multi-page files,
    tables, and faint text.
-   [ ] Measure field-level accuracy for important fields.
-   [ ] Record common failure patterns.
-   [ ] Tune preprocessing or extraction settings and rerun the same
    tests.

**Complete when:** Quality and known limitations are documented against
repeatable tests.

## Step C5 --- Connect and hand off

-   [ ] Return results using the agreed API/schema.
-   [ ] Include document ID, status, page references, and uncertainty
    flags.
-   [ ] Test empty extraction, corrupted files, timeouts, and retries.
-   [ ] Document dependencies and local run instructions.
-   [ ] Ask the backend owner to review the integration.

**Deliverables:** Extraction pipeline, normalized schema, test
samples/results, and operating instructions.

------------------------------------------------------------------------

# 5. Workstream D --- AI Summaries and Health Insights

**Owner:** To be confirmed by the team\
**Goal:** Explain verified health-document information in plain language
without inventing facts or acting as a replacement for professional
care.

## Step D1 --- Define allowed outputs

-   [ ] List the types of summaries and insights allowed by the PRD.
-   [ ] Define required input fields and source metadata.
-   [ ] Agree on a structured output format with the backend and
    frontend owners.
-   [ ] Define which outputs need source references and safety wording.
-   [ ] Identify out-of-scope requests and how to respond to them.

**Complete when:** The output contract and safety boundaries are
documented.

## Step D2 --- Build a basic summary flow

-   [ ] Start with a small set of approved test documents.
-   [ ] Pass only relevant, authorized extracted text to the model.
-   [ ] Request a short plain-language summary.
-   [ ] Separate directly extracted facts from generated explanations.
-   [ ] Return structured output rather than an unvalidated block of
    text.

**Complete when:** Test documents produce readable summaries in the
agreed format.

## Step D3 --- Ground statements in source data

-   [ ] Link important statements to the source document or retrieved
    passage.
-   [ ] Do not invent values, dates, diagnoses, or medication
    instructions.
-   [ ] If information is missing or contradictory, say so explicitly.
-   [ ] Mark low-confidence extraction and ask for verification where
    appropriate.
-   [ ] Ensure generated text does not change the meaning of units or
    reference ranges.

**Complete when:** Reviewers can verify key claims against the original
source.

## Step D4 --- Add safety handling

-   [ ] Make clear that summaries support understanding and do not
    replace a clinician.
-   [ ] Do not independently diagnose a user from incomplete records.
-   [ ] Avoid recommending medication starts, stops, or dosage changes
    without qualified clinical oversight.
-   [ ] Define a reviewed response for potentially urgent symptoms or
    dangerous findings that directs users to appropriate
    professional/emergency care.
-   [ ] Do not bury safety messages in small print.

**Complete when:** Safety tests pass and the response behavior is
documented.

## Step D5 --- Evaluate and improve

-   [ ] Create test cases for clear, incomplete, contradictory, and
    poorly extracted records.
-   [ ] Review factual accuracy, readability, source support, and unsafe
    claims.
-   [ ] Record errors and adjust prompts or validation.
-   [ ] Re-run the full test set after each meaningful change.
-   [ ] Document model/version and known limitations.

**Complete when:** Results meet team-defined quality criteria and
failures are recorded.

**Deliverables:** Summary pipeline, output schema, prompt/configuration
documentation, evaluation set, and safety tests.

------------------------------------------------------------------------

# 6. Workstream E --- RAG (Retrieval-Augmented Generation)

**Owner:** To be confirmed by the team\
**Goal:** Retrieve relevant passages from a user's own documents so AI
responses are grounded in source material.

## Step E1 --- Define the retrieval design

-   [ ] Decide which extracted content can be indexed.
-   [ ] Choose the embedding model and vector store/search index with
    the team.
-   [ ] Define metadata such as user ID, document ID, page/section,
    document date, and content type.
-   [ ] Agree on chunk size/overlap and retrieval limits through tests
    rather than guesswork.
-   [ ] Document the ingestion and query flows.

**Complete when:** The RAG design and metadata contract are approved.

## Step E2 --- Build ingestion

-   [ ] Receive normalized OCR text through the agreed interface.
-   [ ] Split text into meaningful chunks while preserving page/section
    metadata.
-   [ ] Generate embeddings using the selected model.
-   [ ] Store chunks and metadata in the chosen index.
-   [ ] Track ingestion status and errors.

**Complete when:** A test document can be indexed and its chunks traced
to the source.

## Step E3 --- Build secure retrieval

-   [ ] Accept a query only from an authenticated user context.
-   [ ] Apply user/document authorization filters before returning
    passages.
-   [ ] Retrieve relevant chunks and preserve their source metadata.
-   [ ] Return no result or ask for clarification when evidence is
    insufficient.
-   [ ] Test attempts to retrieve another user's data.

**Complete when:** Relevant passages are returned only from authorized
documents.

## Step E4 --- Ground generated answers

-   [ ] Pass retrieved passages to the AI summarization/answering flow.
-   [ ] Require the model to distinguish evidence from uncertainty.
-   [ ] Return citations or document/page references.
-   [ ] Avoid presenting unsupported statements as facts.
-   [ ] Keep the original passage available for verification.

**Complete when:** A reviewer can trace each important answer claim to
retrieved evidence.

## Step E5 --- Test lifecycle and quality

-   [ ] Evaluate retrieval relevance with a small set of expected
    questions/passages.
-   [ ] Test duplicate, empty, outdated, and contradictory documents.
-   [ ] Define re-indexing behavior when content changes.
-   [ ] Define removal behavior when a document is deleted.
-   [ ] Record retrieval quality and known limitations.

**Complete when:** Retrieval tests pass and update/deletion behavior is
documented.

**Deliverables:** RAG ingestion/retrieval pipeline, index schema,
evaluation cases, access-control tests, and setup notes.

------------------------------------------------------------------------

# 7. Workstream F --- Privacy, Security, and Data Management

**Owner:** To be confirmed by the team\
**Goal:** Protect sensitive health information throughout upload,
processing, storage, retrieval, and deletion.

## Step F1 --- Map sensitive data

-   [ ] List personal and health information collected by each feature.
-   [ ] Record where files, extracted text, embeddings, summaries, and
    logs are stored.
-   [ ] Identify every external provider that receives data.
-   [ ] Agree on which data is essential and remove unnecessary
    collection.

## Step F2 --- Protect credentials and data

-   [ ] Keep credentials in environment variables or a secret manager.
-   [ ] Add secret files to the appropriate ignore rules.
-   [ ] Use approved transport and storage protection.
-   [ ] Restrict production access to authorized people.
-   [ ] Prevent sensitive document text from entering logs or analytics
    unintentionally.

## Step F3 --- Validate access control

-   [ ] Test authentication and authorization for each sensitive
    endpoint.
-   [ ] Test cross-user document, search, and RAG access.
-   [ ] Review temporary download links and storage permissions.
-   [ ] Ensure frontend visibility is not treated as the only
    access-control mechanism.

## Step F4 --- Define user data lifecycle

-   [ ] Document consent and retention expectations.
-   [ ] Define how users can request deletion/export if supported by the
    product.
-   [ ] Ensure document deletion also triggers the agreed
    cleanup/re-indexing process.
-   [ ] Review backups, logs, and third-party retention behavior.

## Step F5 --- Review before release

-   [ ] Run dependency and configuration checks.
-   [ ] Review data sharing with external AI/OCR services.
-   [ ] Record risks, mitigations, and unresolved issues.
-   [ ] Block release for unresolved critical privacy/security issues.

**Deliverables:** Data-flow map, security checklist, secret-handling
guide, lifecycle notes, and review evidence.

------------------------------------------------------------------------

# 8. Workstream G --- Integration and Quality Assurance

**Owner:** To be confirmed by the team\
**Goal:** Verify that separate workstreams work together without
breaking ownership boundaries, privacy, or core user journeys.

## Step G1 --- Prepare integration

-   [ ] Collect the approved API/schema contracts from each owner.
-   [ ] List module dependencies and required configuration.
-   [ ] Confirm branch/repository strategy and review requirements.
-   [ ] Use test fixtures or synthetic data where possible.

## Step G2 --- Test each module independently

-   [ ] Confirm each owner has unit tests and local run instructions.
-   [ ] Check success, empty, invalid, timeout, and failure cases.
-   [ ] Record module version and known limitations.
-   [ ] Do not integrate unreviewed changes blindly.

## Step G3 --- Test the end-to-end journey

-   [ ] Sign in as a test user.
-   [ ] Upload an approved sample document.
-   [ ] Confirm the document status changes correctly.
-   [ ] Confirm OCR output is linked to the correct document.
-   [ ] Confirm the AI summary uses supported source content.
-   [ ] Confirm references open the correct source.
-   [ ] Confirm unauthorized users cannot access the document or its
    retrieval results.

## Step G4 --- Test UI and accessibility

-   [ ] Test desktop and mobile layouts.
-   [ ] Test keyboard navigation and readable contrast.
-   [ ] Verify errors are understandable and do not expose internals.
-   [ ] Verify animations respect reduced-motion settings.

## Step G5 --- Release review

-   [ ] Record all known defects and their severity.
-   [ ] Verify setup/deployment instructions.
-   [ ] Confirm security and safety reviews are complete.
-   [ ] Obtain sign-off from the relevant owners.
-   [ ] Mark release readiness only after blockers are resolved or
    explicitly accepted.

**Deliverables:** Test plan, automated/manual results, defect log, and
release checklist.

------------------------------------------------------------------------

# 9. Workstream H --- External Unity IDE --- Sai

**Owner:** Sai (confirm the exact owner and contact with the team)\
**Environment:** External Unity IDE/workspace, separate from
Antigravity\
**Goal:** Keep Unity work independently owned while providing a clear,
safe path for future integration.

## Step H1 --- Set up the Unity work area

-   [ ] Keep the Unity project in its agreed external
    workspace/repository.
-   [ ] Document the Unity version and required packages.
-   [ ] Add safe setup/build instructions.
-   [ ] Do not copy secrets or sensitive user health data into the Unity
    project.

## Step H2 --- Publish the project reference

-   [ ] Add a dedicated Unity section in the project documentation or
    team tracker.
-   [ ] Add the real repository/project link after the team confirms it.
-   [ ] Record the current build status, owner, and last update.
-   [ ] Never invent a link or publish private credentials in the link
    section.

**Unity project link:** `[Add the approved link here]`\
**Current status:** Not confirmed\
**Integration owner/contact:** `[Confirm with team]`

## Step H3 --- Agree on the integration boundary

-   [ ] Describe what Unity is responsible for and what remains in the
    main application.
-   [ ] Agree on the interface/API or data exchange format with the
    relevant owners.
-   [ ] Agree on authentication and authorization requirements before
    connecting to any service.
-   [ ] Use synthetic test data during integration development.
-   [ ] Request permission before changing shared APIs or another
    person's modules.

## Step H4 --- Validate and hand off

-   [ ] Test the Unity feature in its own environment.
-   [ ] Record build/run instructions and dependencies.
-   [ ] Document expected inputs, outputs, and failure states.
-   [ ] Share a short demo or test evidence with the team.
-   [ ] Coordinate integration through the agreed review process.

**Deliverables:** Unity project reference, build instructions,
integration contract, and test evidence.

------------------------------------------------------------------------

# 10. Shared End-to-End Flow

Use this as the main dependency order. Workstreams may proceed in
parallel after their contracts are agreed.

1.  **Agree on requirements and interfaces.** Confirm scope, owners,
    data models, and API schemas.
2.  **Build the secure foundation.** Set up authentication, storage,
    configuration, and authorization.
3.  **Build document upload.** Save the document and create a processing
    status.
4.  **Extract document content.** OCR produces structured text with
    source/page references and uncertainty flags.
5.  **Normalize and validate.** Preserve original content and flag
    unreadable or ambiguous fields.
6.  **Index for retrieval.** RAG chunks and indexes only authorized
    content.
7.  **Generate grounded insights.** AI uses relevant source passages and
    reports uncertainty.
8.  **Display understandable results.** Frontend shows processing state,
    summary, source references, and safety guidance.
9.  **Test end to end.** Verify accuracy, permissions, failure handling,
    and accessibility.
10. **Review and release.** Owners approve their modules and the team
    resolves release blockers.

------------------------------------------------------------------------

# 11. Definition of Done --- Apply to Every Small Task

A task is complete only when all relevant checks are true:

-   [ ] The expected result is clear and implemented.
-   [ ] The change stays within the owner's approved boundary.
-   [ ] Dependencies and interface changes are agreed.
-   [ ] Tests pass, or failures and limitations are explicitly recorded.
-   [ ] Empty, invalid, and failure states are handled where relevant.
-   [ ] No secrets or unnecessary health data are exposed.
-   [ ] Documentation and setup instructions are updated.
-   [ ] The relevant owner has reviewed the work.
-   [ ] Integration status is recorded.

------------------------------------------------------------------------

# 12. Suggested Milestone Order

## Milestone 1 --- Planning and contracts

-   [ ] Confirm people, ownership, and boundaries.
-   [ ] Approve architecture, repository strategy, API contracts, and
    data schema.
-   [ ] Define security and sample-data practices.

## Milestone 2 --- Secure foundation and upload

-   [ ] Set up authentication, backend, storage, and document upload.
-   [ ] Build the frontend shell and upload states.
-   [ ] Test user-level access isolation.

## Milestone 3 --- OCR and structured data

-   [ ] Build extraction and normalization.
-   [ ] Test extraction quality and uncertainty handling.
-   [ ] Connect OCR output to the backend.

## Milestone 4 --- RAG and AI

-   [ ] Implement indexing and secure retrieval.
-   [ ] Implement grounded summaries and source references.
-   [ ] Run factuality, retrieval, and safety evaluations.

## Milestone 5 --- User experience and integration

-   [ ] Complete dashboard and document/insight views.
-   [ ] Add subtle accessible animations.
-   [ ] Connect approved workstreams and run end-to-end tests.

## Milestone 6 --- Security review and release

-   [ ] Complete privacy, security, and data lifecycle review.
-   [ ] Fix release-blocking issues.
-   [ ] Finalize run/deployment documentation and owner sign-offs.

------------------------------------------------------------------------

# 13. Per-Task Update Template

Copy this block when creating a new task or reporting progress:

-   **Task ID:**
-   **Workstream / owner:**
-   **Task title:**
-   **Expected result:**
-   **Steps completed:**
-   **Files/modules owned or changed:**
-   **Dependencies:**
-   **Permission needed from another owner?**
-   **Tests performed and results:**
-   **Status:** Not started / In progress / Blocked / In review / Done
-   **Blockers / next action:**
-   **Documentation or demo link:**
-   **Last updated:**

## Final reminder

Keep each person's work independent, small, testable, and documented.
Confirm the owner and boundary before assigning work. Ask permission
before touching another person's section. Do not store passwords in
project files; use secure, individual access controls instead.
