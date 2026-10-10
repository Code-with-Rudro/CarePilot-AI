# Altrix Labs --- AI-Powered Personal Health Copilot

## Product Requirements Document (PRD)

**Document version:** 1.0\
**Prepared:** 10 October 2026\
**Project duration:** 24-hour hackathon\
**Development environment:** Antigravity\
**Source control:** GitHub\
**Product owner / team lead:** Rudro\
**Status:** MVP requirements for implementation

------------------------------------------------------------------------

## 1. Executive Summary

The **AI-Powered Personal Health Copilot** helps patients organize and
understand healthcare information that is spread across prescriptions,
diagnostic reports, lab results, discharge summaries, and other medical
documents.

The product will provide a unified patient dashboard and combine four
capabilities:

1.  **Medical Record Intelligence:** Upload documents/images, extract
    structured information with OCR, and generate plain-language
    summaries.
2.  **Document-Grounded RAG Chatbot:** Ask questions about a patient's
    uploaded medical documents and receive answers grounded in retrieved
    passages, with source references where possible.
3.  **AI-Powered AR Medicine Assistant:** Open a dedicated AR experience
    from a dashboard button. Scan medicine packaging using a camera; use
    OCR/AI to identify the medicine and strength, retrieve verified
    medicine information, and display an AR information panel.
4.  **Prescription Assistant and Reminders:** Extract prescription
    instructions, explain them in English and Telugu, flag uncertain
    text for confirmation, and optionally schedule medication reminders
    through n8n.

The 24-hour target is a **working demonstration of the core user
journey**, not a clinically validated or production-ready healthcare
system. Build a coherent integrated experience first, and clearly label
mocked, simulated, or incomplete integrations.

## 2. Company and Challenge Context

Altrix Labs describes itself as an AI-native innovation company
combining AI, data intelligence, automation, and digital technologies to
create scalable platforms. Its website also highlights healthcare
innovation, connected health, knowledge systems, RAG, responsible AI,
and human-in-the-loop workflows.

Company website: https://www.altrixlabs.ai/

The challenge emphasizes: - Medical record ingestion and OCR. -
Extraction of medicines, dosages, lab values, diagnoses, and dates. -
Simple-language health summaries. - A unified health profile/timeline. -
Regional-language support. - ABDM/ABHA readiness and FHIR-style data
structures. - Technical architecture, safe medical wording, and a clear
working demo.

**Product alignment:** Prioritize trustworthy extraction,
document-grounded answers, understandable UX, privacy, and a
demonstrable integrated workflow. Do not claim official ABDM integration
or clinical validation unless these have actually been implemented and
verified.

## 3. Problem Statement

Patients often receive health information in different formats and may
struggle to understand medical terminology, compare reports over time,
follow prescription instructions, or find a specific detail in a large
document. Medicine packaging also does not always make the most relevant
information easy to understand quickly.

The product should reduce this friction by organizing user-provided
records and making their contents easier to retrieve and understand. It
must not replace a doctor, pharmacist, emergency service, or official
medicine label.

## 4. Product Vision and Goals

### Vision

Turn fragmented healthcare documents into an organized, understandable,
source-traceable personal health experience.

### MVP goals

-   Let a user upload a medical image or supported document.
-   Extract text and structured medical fields, while surfacing
    uncertainty.
-   Generate a concise, plain-language report summary.
-   Answer questions using only relevant uploaded documents and clearly
    communicate when evidence is insufficient.
-   Provide a dedicated AR medicine-assistant page accessible through a
    visible dashboard button.
-   Parse prescription details and present English/Telugu explanations.
-   Demonstrate a medication-reminder workflow, with safe handling of
    uncertain instructions.
-   Provide a unified timeline or document history.
-   Deliver a clear demo within 24 hours using four parallel
    workstreams.

### Non-goals for the 24-hour MVP

-   Diagnosis, treatment recommendations, or autonomous medication
    changes.
-   Replacing professional advice or emergency triage.
-   Guaranteed recognition of every medicine package, handwriting style,
    or language.
-   Production-grade clinical decision support.
-   Live integration with every pharmacy/medicine database.
-   Real ABHA authentication, ABDM exchange, or FHIR conformance
    certification unless separately implemented and tested.
-   App-store-ready mobile deployment.
-   Production WhatsApp/SMS messaging unless credentials, provider
    approval, consent, and sufficient test time are available.

## 5. Target Users

1.  **Patient:** Uploads reports and prescriptions, asks questions,
    views summaries, and manages reminders.
2.  **Caregiver:** Helps a patient organize records only when authorized
    by that patient.
3.  **Demo evaluator:** Tests the complete workflow with synthetic or
    de-identified sample records.

## 6. Core User Journeys

### Journey A --- Understand a medical report

1.  User signs in or opens the demo session.
2.  User uploads a PDF or image.
3.  System validates file type/size and shows processing status.
4.  OCR extracts text and the extraction layer identifies candidate
    fields.
5.  User can review uncertain fields.
6.  AI generates a plain-language summary.
7.  The document and summary appear in the health timeline.
8.  User can ask follow-up questions in the RAG chat and inspect source
    references.

### Journey B --- Ask a document-based health question

1.  User selects or uploads relevant medical documents.
2.  System extracts, chunks, and indexes document content.
3.  User asks a question, such as "What does this report say about my
    haemoglobin?"
4.  Retriever fetches relevant chunks from the current user's permitted
    documents.
5.  LLM answers using the retrieved context.
6.  The UI displays source document/page or section where available.
7.  If no reliable supporting evidence is retrieved, the assistant says
    it cannot determine the answer from the uploaded documents.

### Journey C --- Scan medicine using AR

1.  User clicks **AR Medicine Assistant** on the dashboard.
2.  The dedicated AR page opens.
3.  User grants camera permission and points the camera at medicine
    packaging.
4.  OCR/image recognition extracts candidate medicine name and strength.
5.  UI shows the detected name/strength and asks the user to confirm or
    correct it.
6.  App retrieves medicine information from a configured trusted source
    or clearly labelled demo dataset.
7.  A floating AR panel shows the confirmed medicine name, strength,
    general uses, precautions, and possible side effects with source and
    timestamp where available.
8.  If identification is ambiguous, the system asks for another scan or
    manual confirmation and does not confidently display a guessed
    match.

**Important implementation note:** A browser-based AR-like overlay is an
acceptable hackathon fallback if full AR tracking is not feasible.
Clearly describe it as a camera overlay rather than claiming full
spatial AR. The Unity workstream is responsible for the dedicated Unity
AR experience and will deliver it through GitHub, not by saving its
primary work inside Antigravity.

### Journey D --- Understand a prescription and set reminders

1.  User uploads a prescription photo or scan.
2.  OCR/AI extracts medicine name, strength, dosage, route, frequency,
    timing, and duration only when specified.
3.  The UI highlights unreadable, missing, or conflicting instructions.
4.  User reviews and confirms the extracted schedule before reminders
    are created.
5.  The app provides an English explanation and a Telugu explanation
    where available.
6.  User enables reminders and chooses an available channel.
7.  n8n schedules the workflow and sends a reminder only when the
    relevant integration is configured and consent has been obtained.
8.  User can record "Taken", "Skipped", or "Snoozed" for personal
    tracking.

Never infer a dose, frequency, or duration that is absent or unclear in
the prescription. A clinician/pharmacist must resolve ambiguity.

## 7. Functional Requirements

Priority definitions: **P0 = must work in demo; P1 = implement if time
allows; P2 = future enhancement.**

  -----------------------------------------------------------------------------------
  ID               Requirement                      Priority Acceptance condition
  ---------------- ------------------- --------------------- ------------------------
  FR-01            Main dashboard and                     P0 User can access Uploads,
                   navigation                                Health Timeline, RAG
                                                             Chat, Prescription
                                                             Assistant, and AR
                                                             Medicine Assistant.

  FR-02            Medical document                       P0 Supported PDF/JPG/PNG
                   upload                                    files can be selected
                                                             and validation errors
                                                             are understandable.

  FR-03            OCR/text extraction                    P0 Extracted text is
                                                             visible or saved;
                                                             failure/low-confidence
                                                             cases are shown.

  FR-04            Structured medical                     P0 Candidate medicine
                   extraction                                names, strengths, dates,
                                                             and lab values are
                                                             represented as
                                                             structured fields when
                                                             present.

  FR-05            Plain-language                         P0 Summary is generated
                   summary                                   from the uploaded
                                                             document and avoids
                                                             unsupported conclusions.

  FR-06            RAG indexing                           P0 Document text is chunked
                                                             and made retrievable for
                                                             questions.

  FR-07            Document-grounded                      P0 Answers use retrieved
                   chat                                      context; insufficient
                                                             evidence results in an
                                                             explicit limitation.

  FR-08            Source references                      P0 Answer cites document
                                                             name and
                                                             page/section/chunk where
                                                             available.

  FR-09            User/document                          P0 Retrieval and API access
                   isolation                                 are scoped to the active
                                                             user/session.

  FR-10            Health timeline                        P0 Uploaded documents
                                                             appear with type and
                                                             date when known.

  FR-11            Prescription                           P0 Extracted instruction
                   extraction                                fields are shown for
                                                             user review; uncertain
                                                             values are flagged.

  FR-12            English and Telugu                     P1 User can switch
                   explanations                              language; unsupported or
                                                             uncertain translation is
                                                             disclosed.

  FR-13            Reminder                               P0 No reminder is scheduled
                   confirmation                              until the user confirms
                                                             the extracted schedule.

  FR-14            n8n reminder                           P1 A test workflow can
                   workflow                                  accept a confirmed
                                                             schedule and demonstrate
                                                             a notification or test
                                                             event.

  FR-15            Taken/skipped                          P1 User can record
                   tracking                                  medication status for a
                                                             scheduled reminder.

  FR-16            AR assistant                           P0 Clicking the dashboard
                   navigation button                         button opens the AR
                                                             page/Unity experience.

  FR-17            Medicine package                       P0 Candidate name and
                   OCR                                       strength are extracted
                                                             from a sample package or
                                                             demo image.

  FR-18            Medicine                               P0 Panel shows information
                   information panel                         only after confirmation
                                                             or an unambiguous match
                                                             to a configured source.

  FR-19            AR fallback                            P1 If Unity integration
                                                             cannot be embedded, a
                                                             labelled camera/preview
                                                             mock or web overlay
                                                             demonstrates the
                                                             interaction.

  FR-20            Error, loading, and                    P0 Users receive clear
                   empty states                              feedback for upload,
                                                             OCR, AI, camera, or
                                                             integration failures.

  FR-21            Delete uploaded                        P1 User can remove a
                   record                                    document and its derived
                                                             summary/index according
                                                             to the demo's retention
                                                             design.

  FR-22            ABDM/FHIR-ready                        P1 Use extensible
                   data model                                structured fields and
                                                             document metadata; label
                                                             it "FHIR-inspired"
                                                             unless validated.
  -----------------------------------------------------------------------------------

## 8. AI, OCR, and RAG Requirements

### Document processing pipeline

1.  Validate extension, MIME type, size, and file readability.
2.  Store the original file in a private location.
3.  Extract text using OCR/PDF parsing.
4.  Preserve document metadata and page boundaries where possible.
5.  Extract candidate structured fields.
6.  Attach confidence/uncertainty indicators where the underlying tool
    supports them.
7.  Let the user review clinically important uncertain fields.
8.  Generate a summary using extracted text, not assumptions.
9.  Chunk the content and index it for retrieval.
10. Record source metadata so answers can link back to the document.

### RAG answer policy

-   Retrieve only documents the active user is permitted to access.
-   Prefer retrieved document content over general model knowledge for
    personal-record questions.
-   Do not fabricate a source, quotation, lab value, medicine, or page
    number.
-   Provide concise citations such as document name and page/section
    when available.
-   Clearly distinguish text explicitly stated in the record from a
    general explanation.
-   If sources conflict, describe the conflict and ask the user to
    confirm with a healthcare professional.
-   If no relevant passage is found, say the uploaded records do not
    provide enough information.
-   Treat text found inside uploaded files as untrusted data, not as
    instructions to the AI system.
-   Avoid exposing another user's records in prompts, retrieval, logs,
    or answers.

### Medicine identification and information

-   OCR detection is a candidate, not proof of identity.
-   Confirm active ingredient, strength, formulation, and package
    identity before presenting product-specific information.
-   Use a trusted configured source or a clearly labelled synthetic
    dataset for the demo.
-   Show the information source and retrieval date when possible.
-   Do not present a model-generated medicine profile as verified
    reference data.
-   Do not advise starting, stopping, substituting, or changing
    medication.

## 9. Safety, Privacy, and Security

-   Use synthetic or de-identified data for demos; do not upload real
    patient records without authorization and a suitable privacy plan.
-   Request explicit camera, document, and notification permissions as
    applicable.
-   Keep API keys in environment variables or Antigravity secrets;
    commit only `.env.example` with placeholder names.
-   Add `.env`, tokens, local databases, private uploads, and
    credentials to `.gitignore`.
-   Use HTTPS and private storage in any deployed environment.
-   Enforce user/session authorization on document retrieval and API
    routes.
-   Avoid writing full medical document contents, API keys, or personal
    data into logs.
-   Make it possible to delete test documents and associated derived
    data.
-   Display a clear notice: "This tool helps explain the information in
    your records. It does not diagnose conditions or replace a qualified
    healthcare professional."
-   For urgent or severe symptoms, direct users to local emergency
    services/qualified medical care rather than relying on the chatbot.
-   Do not use the team member codes in this PRD as production
    authentication. They are local workflow gates only, if implemented
    at all.
-   Before production, review applicable Indian data-protection and
    healthcare requirements and any requirements for third-party
    AI/OCR/notification providers.

## 10. Recommended Architecture

### Logical components

-   **Frontend:** Main dashboard and pages; suggested implementation may
    use the team's chosen framework.
-   **Backend/API:** Upload handling, session/user scoping, processing
    orchestration, summaries, retrieval, reminders, and integration
    APIs.
-   **Document parser/OCR:** PDF text extraction plus OCR for images.
-   **LLM layer:** Structured extraction, summaries, and RAG answers.
-   **Vector index:** Stores embeddings and metadata filtered by
    user/document.
-   **Database:** Users/sessions, document metadata, extracted fields,
    summaries, medication schedule, reminder status, and audit metadata.
-   **File storage:** Private originals and derived artifacts.
-   **n8n:** Optional workflow for confirmed reminders and notification
    delivery.
-   **Unity AR module:** Medicine-camera scanning and AR overlay,
    developed separately by Data Sai and integrated through an agreed
    interface or demo handoff.

### Suggested data entities

-   `User` / `DemoSession`
-   `MedicalDocument` --- id, owner/session id, filename, MIME type,
    upload time, document type, status, storage key
-   `ExtractedField` --- document id, field name, value, unit,
    page/region, confidence, review status
-   `HealthSummary` --- document id, summary text, language,
    model/version metadata
-   `DocumentChunk` --- document id, chunk id, text, page/section
    metadata, embedding reference
-   `ChatMessage` --- session id, question, answer, source references,
    timestamp
-   `MedicationCandidate` --- name, strength, dose, route, frequency,
    timing, duration, source document, confidence, confirmation status
-   `MedicationSchedule` --- confirmed instructions, reminder
    preferences, timezone, active status
-   `MedicationEvent` --- scheduled time, taken/skipped/snoozed status
-   `MedicineLookup` --- candidate identity, confirmed identity, source,
    retrieved facts, lookup time

### FHIR/ABDM readiness

Use extensible fields that can later map to relevant FHIR R4 resources,
such as Patient, DocumentReference, DiagnosticReport, Observation,
Medication, MedicationRequest, and MedicationStatement where
appropriate. For this prototype, use mock identifiers only. Do not imply
that the application is connected to ABDM or conforms to FHIR until the
implementation has been validated.

## 11. API / Integration Contracts

The exact endpoints may be adapted to the team's framework. Keep the
request/response contract stable so branches can work independently.

  -------------------------------------------------------------------------------------
  Endpoint / interface                 Purpose                  Owner
  ------------------------------------ ------------------------ -----------------------
  `POST /api/documents`                Upload document and      Rudro + Mani Sankar
                                       return document          
                                       ID/status                

  `GET /api/documents`                 List current             Rudro
                                       user's/session's         
                                       documents                

  `GET /api/documents/{id}`            Return metadata and      Rudro
                                       processing status        

  `POST /api/documents/{id}/process`   Trigger                  Mani Sankar + Rudro
                                       OCR/extraction/summary   
                                       pipeline                 

  `GET /api/documents/{id}/summary`    Return summary and       Mani Sankar + Rudro
                                       extracted fields         

  `POST /api/chat`                     Ask question scoped to   Mani Sankar + Rudro
                                       selected user's          
                                       documents; return answer 
                                       and sources              

  `POST /api/prescriptions/extract`    Extract candidate        Mani Sankar
                                       prescription             
                                       instructions             

  `POST /api/reminders/confirm`        Accept only              Mani Kanta + Rudro
                                       user-confirmed schedule  
                                       and pass to automation   

  n8n webhook (configured via env)     Receive confirmed        Mani Kanta
                                       reminder event           

  `POST /api/medicine/identify`        Receive image/OCR        Mani Sankar + Data
                                       candidate and return     Sai + Rudro
                                       confirmed/candidate      
                                       lookup data              

  Unity/web bridge interface           Pass scan result and     Data Sai + Rudro
                                       receive                  
                                       medicine-information     
                                       payload                  
  -------------------------------------------------------------------------------------

For the hackathon, if not all backend routes are ready, agree on shared
sample JSON contracts and use a clearly labelled mock adapter rather
than each branch inventing a different shape.

### Example RAG response contract

``` json
{
  "answer": "The uploaded report lists a haemoglobin result of ...",
  "sources": [
    {
      "document_id": "demo-report-001",
      "document_name": "sample-lab-report.pdf",
      "page": 1,
      "snippet": "..."
    }
  ],
  "insufficient_evidence": false,
  "disclaimer": "This explanation is not a diagnosis."
}
```

### Example medicine identification contract

``` json
{
  "candidate_name": "Example medicine",
  "candidate_strength": "Example strength",
  "identity_status": "needs_user_confirmation",
  "source": null,
  "information": null
}
```

The examples are interface illustrations only; do not use invented
medicine information as verified clinical content.

## 12. Team Ownership and GitHub Branch Strategy

Each member owns a separate working branch. Merge through pull requests
into `main`; do not push unfinished or unreviewed work directly to
`main`.

  --------------------------------------------------------------------------------------
  Member            Primary ownership Suggested branch                 Main deliverables
  ----------------- ----------------- -------------------------------- -----------------
  Rudro --- Team    Frontend,         `feature/platform-integration`   App shell,
  Lead              backend,                                           navigation,
                    database,                                          shared schemas,
                    integration,                                       upload API,
                    deployment/demo                                    database,
                                                                       integration,
                                                                       merge
                                                                       coordination

  Mani Sankar       Machine learning, `feature/ai-rag-ocr`             OCR pipeline,
                    RAG, OCR,                                          structured
                    extraction,                                        extraction, RAG
                    summaries                                          retrieval,
                                                                       grounded chat,
                                                                       source references

  Mani Kanta        Automation,       `feature/automation-voice`       n8n reminder
                    messaging,                                         flow,
                    TTS/STT                                            notification
                                                                       adapter/mock,
                                                                       voice
                                                                       input/output if
                                                                       time permits,
                                                                       English/Telugu
                                                                       delivery support

  Data Sai          AR and Unity      `feature/unity-ar`               Unity scene,
                                                                       camera scanning,
                                                                       medicine
                                                                       candidate
                                                                       overlay, medicine
                                                                       info panel,
                                                                       build/demo
                                                                       handoff
  --------------------------------------------------------------------------------------

**Data Sai workflow exception:** Data Sai develops the Unity project
locally in Unity and uploads/commits the overall Unity work to the
GitHub `feature/unity-ar` branch. Do not require the Unity project to be
authored or saved inside Antigravity. Antigravity is used by the other
members for their assigned work and by the team for
integration/documentation as appropriate.

### Repository rules

1.  `main` must remain demo-ready.
2.  Each member works on their own branch and commits only their
    assigned work.
3.  Pull requests must include a short summary, test/demo steps, and
    known limitations.
4.  Merge small, working changes early; avoid one large last-minute
    merge.
5.  Do not commit `.env`, secrets, API keys, private patient data, local
    caches, or generated build folders.
6.  Use `.env.example` to document required environment variable names.
7.  Agree on API contracts, file names, and component interfaces before
    parallel implementation.
8.  The team lead resolves merge conflicts and confirms end-to-end
    integration.
9.  Use synthetic sample records and package images for the demo.
10. Protect the default branch where possible and use GitHub's own
    account permissions for repository access.

### Local member access codes --- optional convenience only

If the team wants a simple local start screen to choose a workstream,
the requested codes are:

  Member        Local code
  ------------- ------------
  Rudro         `Rudro`
  Mani Sankar   `sankar`
  Mani Kanta    `mani`
  Data Sai      `sai`

Implementation requirements: - Keep codes in a local, untracked `.env`
file or configure them in the local environment; do not put actual
values in committed source files. - If this feature is built, compare
against environment variables and avoid logging entered values. - Treat
the screen only as a local workstream selector, not real authentication
or authorization. - Do not use these codes as GitHub passwords,
Antigravity credentials, deployment credentials, or production access
controls. - For shared GitHub access, each member should use their own
GitHub account and repository permissions.

## 13. 24-Hour Execution Plan

The schedule is intentionally aggressive. Prioritize an integrated
vertical slice over polishing every bonus feature.

  ------------------------------------------------------------------------
  Time                    Team focus               Exit condition
  ----------------------- ------------------------ -----------------------
  Hour 0--1               All: agree scope,        App runs; branch owners
                          repository, branches, UI and interfaces are
                          skeleton, API/data       agreed
                          contracts                

  Hour 1--4               Rudro: app               Each stream has a
                          shell/upload/database;   runnable skeleton and
                          Sankar: OCR/RAG          shared sample payload
                          prototype; Kanta:        
                          reminder workflow        
                          prototype; Data Sai:     
                          Unity scene/camera setup 

  Hour 4--8               Implement document       First working feature
                          upload, OCR, extraction, demonstrations
                          RAG indexing/chat, AR    
                          scanning, reminder       
                          adapter                  

  Hour 8--12              Connect AI backend to    At least one end-to-end
                          UI; confirm medicine     path works
                          identity workflow;       
                          connect Unity handoff;   
                          test reminder event      

  Hour 12--16             Add summary and          Main demo journeys are
                          timeline;                connected
                          sources/uncertainty;     
                          Telugu explanation; AR   
                          panel                    

  Hour 16--19             Integration freeze for   Main branch has a
                          major interfaces; fix    runnable integrated
                          import/API/build errors  version

  Hour 19--21             Test failure paths,      Critical bugs and
                          permissions, OCR         unsafe guesses are
                          uncertainty, missing RAG addressed
                          evidence                 

  Hour 21--23             Prepare synthetic demo   Presentation is
                          data, screenshots,       repeatable
                          architecture diagram,    
                          demo script              

  Hour 23--24             Final smoke test, backup Demo-ready tagged
                          demo/video, merge only   commit
                          safe changes             
  ------------------------------------------------------------------------

### Cut-line rules

If time is running out, prioritize in this order: 1. Upload a document →
OCR/extraction → summary. 2. Ask a question about that document →
grounded answer with source. 3. Main dashboard and timeline. 4. AR
button → working Unity scene or clearly labelled fallback overlay. 5.
Prescription parsing with uncertainty review. 6. n8n reminder
demonstration using a test event. 7. Telugu/TTS/STT polish and
additional visual refinements.

Never fake clinical correctness to complete a demo. A mocked external
integration must be labelled as a mock.

## 14. Definition of Done

The MVP is ready for presentation when: - The application starts using
documented setup instructions. - A synthetic medical report can be
uploaded and processed. - Extracted text and important fields are
inspectable. - A plain-language summary is shown. - RAG answers a
question from the uploaded record and shows supporting source
metadata. - Unsupported questions produce an uncertainty response. - The
AR entry button opens the AR experience or an explicitly labelled
fallback. - A sample medicine scan produces a candidate identity that
can be confirmed before displaying information. - A sample prescription
displays only detected/confirmed instructions and flags uncertain
values. - Reminder automation demonstrates a confirmed schedule without
silently guessing medication timing. - English and Telugu output is
demonstrated for a sample where translation is available. - No real
patient data or secrets are committed. - All team members' work is
integrated from their assigned branches or the remaining gaps are
clearly documented.

## 15. Demo Script (3--5 minutes)

1.  **Introduction (20 seconds):** Explain fragmented health records and
    the goal of one understandable health profile.
2.  **Upload (40 seconds):** Upload a synthetic lab report or
    prescription and show OCR/extracted fields.
3.  **Summary (30 seconds):** Show the simple-language summary and one
    result that needs professional interpretation.
4.  **RAG chat (45 seconds):** Ask a question answered from the report;
    open the cited source. Ask a question not answered by the report and
    show the uncertainty response.
5.  **Prescription assistant (40 seconds):** Show candidate medication
    instructions, uncertainty flags, and English/Telugu explanation.
6.  **Reminders (25 seconds):** Confirm a sample schedule and
    demonstrate a test notification/workflow.
7.  **AR assistant (45 seconds):** Click the AR button, scan a sample
    package, confirm candidate medicine identity, and show the overlay.
8.  **Architecture/safety (30 seconds):** Explain OCR → structured
    extraction → RAG → source-grounded answers, privacy controls, and
    current demo limitations.

## 16. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  OCR reads a medicine name or dosage Display extracted candidates,
  incorrectly                         uncertainty, and a user
                                      confirmation step

  RAG gives an unsupported answer     Require retrieved evidence, source
                                      metadata, and an
                                      insufficient-evidence response

  Medicine identification matches a   Confirm name/strength/ingredient
  similar package                     and use a trusted source; do not
                                      guess

  External API keys or services fail  Add a mock adapter and a synthetic
                                      demo dataset; label it clearly

  Unity cannot be embedded in the web Provide a standalone Unity
  app in time                         build/video or labelled fallback
                                      and agree on the integration
                                      contract

  WhatsApp/SMS provider setup takes   Demonstrate an n8n test webhook or
  too long                            in-app notification without
                                      claiming a live message was sent

  Branch integration fails late       Merge small PRs early, keep `main`
                                      runnable, and freeze major
                                      interfaces by Hour 16

  Real patient information is exposed Use synthetic/de-identified
                                      records, private storage, scoped
                                      access, and secret-free commits
  -----------------------------------------------------------------------

## 17. Future Enhancements

-   Validated FHIR R4 mappings and formal ABDM integration subject to
    authorization and compliance.
-   Secure patient consent and authorized caregiver sharing.
-   More Indian languages and improved handwriting OCR.
-   Clinician-reviewed medicine information source integration.
-   Medication interaction checks only through appropriate, validated
    clinical data sources and safety design.
-   Longitudinal lab trends and configurable health reminders.
-   Accessibility improvements and offline/low-connectivity support.
-   Monitoring, evaluation datasets, model/version tracking, and
    security testing.
-   Formal clinical safety, privacy, and regulatory review before
    real-world deployment.

## 18. Suggested Repository Structure

Adapt to the actual frameworks chosen by the team; keep interfaces
stable.

``` text
health-copilot/
├── README.md
├── PRD.md
├── .gitignore
├── .env.example
├── docs/
│   ├── architecture.md
│   ├── api-contracts.md
│   ├── demo-script.md
│   └── decisions.md
├── frontend/
│   ├── src/
│   └── README.md
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   └── README.md
├── ai-services/
│   ├── ocr/
│   ├── extraction/
│   ├── rag/
│   └── README.md
├── automation/
│   ├── n8n/
│   └── README.md
├── unity-ar/
│   └── README.md
└── tests/
    ├── sample-contracts/
    └── smoke-tests/
```

Do not commit Unity `Library/`, temporary build output, virtual
environments, private uploads, or other generated folders. Use Unity's
recommended `.gitignore`.

## 19. Environment Configuration

Commit only placeholder variable names in `.env.example`. Actual values
belong in local `.env` files or a secret manager and must be ignored by
Git.

Example placeholders:

``` dotenv
LLM_API_KEY=
DATABASE_URL=
VECTOR_STORE_URL=
VECTOR_STORE_API_KEY=
OCR_PROVIDER_KEY=
N8N_WEBHOOK_URL=
NOTIFICATION_PROVIDER_KEY=
APP_ENV=development
```

Only include variables for services actually selected by the team. Never
put working API keys or team access codes in this file.

## 20. Final Product Principle

**Make health information easier to understand without pretending
uncertainty does not exist.** The winning demo should show a coherent,
useful workflow; traceable answers; visible uncertainty; safe medicine
handling; and a team that can explain what is implemented, mocked, and
planned.
