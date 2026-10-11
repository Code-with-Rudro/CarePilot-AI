# CarePilot-AI
# CarePilot-AI

### AI-Powered Personal Health Copilot

CarePilot-AI is a healthcare-assistance application designed to help
people organize and better understand medical documents such as
prescriptions, diagnostic reports, and other health records. The project
aims to combine **Optical Character Recognition (OCR)**,
**Retrieval-Augmented Generation (RAG)**, and a **Large Language Model
(LLM)** to turn document content into understandable, context-aware
explanations.

> **Development status:** Work in progress. OCR/RAG/LLM and
> frontend/backend integration are partially implemented. End-to-end
> testing and production deployment have not yet been completed.
> Features described as planned or in progress should not be considered
> production-ready.

------------------------------------------------------------------------

## Project Links and Demo

| Resource | Link | Notes |
|---|---|---|
| AR Scanner APK / project page | [Download AR Scanner](https://datha-sai.itch.io/ar-scanner) | The page lists an Android APK (`ar project.apk`) and other downloads. Review the file and permissions before installing. |
| AR Scanner demo video | [Watch the demo](https://screenapp.io/app/share/XZbRbz4vciSloKLvl1yJv_mr) | Shared ScreenApp video link. |
| CarePilot-AI frontend | [Open the application](https://care-pilot-ai-gold.vercel.app/) | Public frontend URL. |
| CarePilot-AI backend | [Open the backend deployment](https://care-pilot-ai-nwsr.vercel.app/) | Backend deployment URL; this root URL may not display a web page if the service exposes API routes only. |
| GitHub repository | [Search GitHub for CarePilot-AI](https://github.com/search?q=CarePilot-AI&type=repositories) | The exact repository URL was not supplied. Replace this search link with the direct repository URL once confirmed. |

**Link validation note:** The AR Scanner page and CarePilot-AI frontend URL responded when checked. The ScreenApp share URL opened but did not expose page content to the checker, and the backend root URL timed out during the check. These results do not prove the links are broken; verify the video in a browser and test a real backend API endpoint/health route. Do not treat the backend root page alone as a health check.

---

## Table of Contents

-   [Project Links and Demo](#project-links-and-demo)\n-   [Project Overview](#project-overview)
-   [Problem Statement](#problem-statement)
-   [Project Goals](#project-goals)
-   [Key Features](#key-features)
-   [How It Works](#how-it-works)
-   [Architecture](#architecture)
-   [Technology Stack](#technology-stack)
-   [Repository Structure](#repository-structure)
-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
-   [Environment Configuration](#environment-configuration)
-   [Running the Application](#running-the-application)
-   [Core AI Pipeline](#core-ai-pipeline)
-   [API Integration](#api-integration)
-   [Testing and Validation](#testing-and-validation)
-   [Deployment Guide](#deployment-guide)
-   [Security and Privacy](#security-and-privacy)
-   [Known Limitations](#known-limitations)
-   [Development Roadmap](#development-roadmap)
-   [Contributing](#contributing)
-   [Troubleshooting](#troubleshooting)
-   [Disclaimer](#disclaimer)
-   [License](#license)

------------------------------------------------------------------------

## Project Overview

**CarePilot-AI** is an AI-powered personal health copilot being
developed by **Altrix Labs**. Its goal is to help users navigate complex
health information by processing medical documents and presenting useful
summaries in plain language.

The intended workflow is:

1.  A user uploads a prescription, diagnostic report, or supported
    medical document.
2.  The backend validates the file and sends it to the OCR/document
    extraction stage.
3.  Extracted text is cleaned and organized.
4.  The RAG component retrieves relevant context from the available
    document content or knowledge sources.
5.  The LLM uses that context to produce a grounded explanation or
    answer.
6.  The frontend displays the result to the user, with appropriate
    limitations and safety guidance.

The end-to-end flow is still being integrated and must be verified
through testing before it is considered complete.

## Problem Statement

Medical documents can contain technical terminology, abbreviations,
measurements, and instructions that are difficult to interpret without
clinical knowledge. Important information may also be spread across
multiple documents.

CarePilot-AI aims to make this information easier to navigate by
providing document extraction, organization, and AI-assisted
explanations. It is intended to support understanding and preparation
for conversations with qualified healthcare professionals---not to
replace them.

## Project Goals

-   Extract readable text from supported medical document images and
    files.
-   Connect OCR output to a retrieval pipeline.
-   Use retrieved context to ground LLM responses.
-   Provide understandable summaries and answers based on available
    records.
-   Integrate frontend and backend workflows reliably.
-   Protect medical information and application credentials.
-   Establish repeatable testing and a documented deployment process.

## Key Features

The following table distinguishes the intended capabilities from their
current implementation status.

  -------------------------------------------------------------------------
  Capability              Purpose                 Current status
  ----------------------- ----------------------- -------------------------
  Medical document upload Accept supported        Integration in progress;
                          prescriptions and       verify supported formats
                          reports                 

  OCR                     Extract text from       Partially
                          document images         implemented/integration
                                                  in progress

  RAG                     Retrieve relevant       Partially
                          document context        implemented/integration
                                                  in progress

  LLM responses           Explain retrieved       Partially
                          medical information     implemented/integration
                                                  in progress

  Frontend/backend        Send requests to        Partially implemented
  connection              backend APIs and show   
                          results                 

  Medical document        Make extracted          Intended capability;
  summaries               information easier to   validate end-to-end
                          understand              

  User authentication     Restrict access to      Verify implementation and
                          authorized accounts     configuration

  End-to-end validation   Confirm the complete    Not completed
                          document-to-answer      
                          workflow                

  Production deployment   Run a verified          Not completed
                          production build        
  -------------------------------------------------------------------------

Do not advertise a capability as production-ready until it has been
implemented, tested, and reviewed.

## How It Works

### Intended document-to-answer workflow

``` text
User
 |
 v
Frontend: upload medical document
 |
 v
Backend API: validate request and file
 |
 v
OCR / Text Extraction
 |
 v
Text Cleaning and Normalization
 |
 v
RAG: index/search relevant context
 |
 v
LLM: generate a context-grounded response
 |
 v
Backend: validate and return response
 |
 v
Frontend: display explanation and safety guidance
```

### Responsibilities of each component

-   **Frontend:** Provides the user interface, collects document uploads
    and questions, and presents backend responses.
-   **Backend:** Owns API routes, input validation, file handling, AI
    service orchestration, and error handling.
-   **OCR:** Converts text in supported images or scanned documents into
    machine-readable text.
-   **RAG:** Finds relevant text chunks or approved knowledge sources
    for a query.
-   **LLM:** Generates a natural-language response using the question
    and retrieved context.
-   **Configuration:** Supplies service endpoints and credentials
    through environment variables, without exposing secrets to the
    browser.

The actual implementation may differ from this target architecture.
Update this section after confirming the current repository and
pipeline.

## Architecture

CarePilot-AI follows a frontend/backend architecture with an AI
processing pipeline.

### Frontend layer

-   Document upload and user interactions.
-   Loading, success, and error states.
-   Display of extracted text and AI-generated explanations, where
    implemented.
-   Requests to the configured backend API.

### Backend layer

-   API endpoints and request validation.
-   Secure handling of uploaded files.
-   OCR, retrieval, and LLM orchestration.
-   Consistent responses and error handling.
-   Authentication and authorization, if configured.

### AI processing layer

-   OCR and text extraction.
-   Text normalization and chunking.
-   Retrieval of relevant context.
-   LLM generation based on the retrieved context.
-   Response checks and user-facing safety messaging.

### External services

Depending on the configured implementation, the application may use an
LLM provider, OCR library/service, database, or vector store. Confirm
actual dependencies in the repository and environment before documenting
a specific provider as active.

## Technology Stack

The exact versions and complete dependency list should be taken from the
repository's package and dependency files.

  -----------------------------------------------------------------------
  Layer                               Technology / responsibility
  ----------------------------------- -----------------------------------
  Frontend                            Existing web frontend (confirm
                                      framework in `package.json`)

  Frontend tooling                    Vite is used in the current
                                      frontend deployment/configuration
                                      workflow

  Backend                             Existing API service (confirm
                                      framework and runtime from backend
                                      dependency files)

  AI generation                       LLM API configured through a
                                      server-side environment variable

  Document processing                 OCR pipeline for
                                      prescription/report extraction

  Retrieval                           RAG pipeline for finding relevant
                                      context

  Deployment target                   Vercel has been used/planned for
                                      the frontend; backend hosting still
                                      needs to be verified

  Version control                     Git and GitHub
  -----------------------------------------------------------------------

Avoid assuming a database, vector database, OCR vendor, model name, or
backend framework until it is confirmed in the codebase.

## Repository Structure

The exact directory tree has not been verified here. Use the structure
below as a **conceptual guide**, not a claim that every folder already
exists:

``` text
CarePilot-AI/
├── frontend/                 # Web interface (if separated)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/                  # API and AI orchestration (if separated)
│   ├── app/                  # Routes/services (framework-dependent)
│   ├── requirements.txt      # Or backend package manifest
│   └── .env.example
├── docs/                     # Architecture and project documentation (optional)
├── .gitignore
└── README.md
```

Your actual repository may instead place the frontend at the repository
root or use different backend folder names. Before using the commands
below, inspect the real structure and run each command from the
directory containing the corresponding package/dependency file.

## Prerequisites

Install the tools required by the repository:

-   Git.
-   Node.js and npm (for a Vite/Node-based frontend; use the version
    supported by the project).
-   The runtime and package manager required by the backend (for
    example, Python with a virtual environment if the backend is
    Python-based).
-   Access to the configured LLM provider, if the LLM API is used.
-   Any OCR, database, or vector-store dependencies required by the
    implementation.

Check the repository's `package.json`, lockfile, Python dependency
files, and deployment settings for exact versions. Do not commit API
keys or local environment files.

## Getting Started

### 1. Clone the repository

Replace the placeholder URL with the repository's actual clone URL.

``` bash
git clone <YOUR_REPOSITORY_URL>
cd CarePilot-AI
```

### 2. Inspect the project layout

``` bash
git status
git branch
```

Find the frontend `package.json` and the backend's dependency manifest
before installing dependencies.

### 3. Install frontend dependencies

If the frontend's `package.json` is in the repository root:

``` bash
npm install
```

If the frontend is in a subdirectory, change into that directory first:

``` bash
cd frontend
npm install
```

Prefer the repository's lockfile and package-manager workflow. For
example, use `npm ci` when an npm lockfile is committed and a clean
reproducible install is needed.

### 4. Install backend dependencies

Use the instructions matching the actual backend runtime.

**For a Python backend**, if `requirements.txt` exists:

``` bash
python -m venv .venv
```

Activate the environment:

``` bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

Then install dependencies:

``` bash
pip install -r requirements.txt
```

If the project uses `pyproject.toml`, Poetry, Pipenv, or another
dependency manager, follow that project's instructions instead. Do not
run Python commands for a backend that is not Python-based.

### 5. Configure environment variables

Create local environment files from the project's examples if they
exist. Otherwise, create the files expected by the application and
define only variables that the code actually reads.

For a Vite frontend, local variables are commonly placed in `.env.local`
in the frontend project root. Backend secrets belong in the backend's
own environment configuration or the deployment provider's secret
settings.

### 6. Start the services

Run the frontend and backend using the scripts or entry points defined
by the project. Example Vite command:

``` bash
npm run dev
```

The backend start command depends on the framework and actual entry
point; confirm it from the backend files before running it.

## Environment Configuration

### Important secret-handling rule

**Never place a private LLM API key in a Vite variable prefixed with
`VITE_`.** Vite exposes `VITE_*` variables to client-side browser code.
A private key in such a variable can be extracted by users.

Use this general separation:

-   **Frontend:** public backend base URL and other genuinely public
    configuration only.
-   **Backend:** LLM API key and other private credentials.
-   **Deployment:** store variables in the correct project's environment
    settings and redeploy after changing them.

### Frontend environment example

For a Vite frontend, the backend URL may look like this:

``` dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Replace the example URL and port with the actual backend address and
port. In production, use the deployed backend's HTTPS URL.

`VITE_API_BASE_URL` is public configuration, not a secret. It is normal
for a Vite deployment dashboard to warn that variables with a `VITE_`
prefix are exposed to the browser. Keep this variable only if it is
intended to be public.

### Backend environment example

The following is illustrative. Use the variable names actually
referenced by your backend code:

``` dotenv
LLM_API_KEY=replace_with_your_private_key
```

If the implementation uses a provider-specific name such as
`OPENAI_API_KEY`, use the exact name expected by the application
instead. Do not define multiple alternative names unless the code
supports them.

Other configuration may include an OCR endpoint, database URL,
vector-store settings, or allowed frontend origins, but add these only
when required by the implementation.

### Environment file safety

Add local secret files to `.gitignore`, for example:

``` gitignore
.env
.env.*
!.env.example
!.env.local.example
.venv/
node_modules/
dist/
__pycache__/
```

Review these patterns against your repository before applying them;
never ignore required example templates. Do not commit real credentials,
patient documents, extracted health data, or production logs.

If a private key was ever committed or exposed in a browser bundle,
revoke/rotate it with the provider and remove it from the repository
history where appropriate. Removing a key from the latest commit alone
does not make an exposed key safe.

## Running the Application

### Frontend

Run from the directory containing the frontend `package.json`:

``` bash
npm run dev
```

Use the local URL printed by Vite in the terminal. To inspect available
scripts:

``` bash
npm run
```

### Backend

Use the backend's documented entry point and start command. Do not
assume a port or framework; check the route definitions and dependency
files first.

### Verify the connection

1.  Start the backend and confirm it is listening on the expected
    address.
2.  Set the frontend's API base URL to that backend address.
3.  Start the frontend.
4.  Open the browser developer tools and inspect the Network tab.
5.  Perform a request that should reach the backend.
6.  Confirm that the request URL, HTTP method, response status, and
    response body are correct.
7.  Check backend logs for validation, authentication, OCR, retrieval,
    or LLM errors.

A successful frontend build does not prove that backend routes or AI
services work.

## Core AI Pipeline

### 1. OCR and document extraction

The OCR stage should convert supported prescription or report images
into text.

Recommended validation: - Accept only explicitly supported file
formats. - Limit upload size and reject malformed files. - Handle
blurry, rotated, low-resolution, or incomplete images. - Preserve
uncertainty instead of silently guessing unreadable medication names or
values. - Allow the user to review extracted text before relying on
it. - Avoid logging full medical documents or sensitive extracted text.

### 2. Text cleaning and chunking

Before retrieval, normalize extracted text while preserving medically
meaningful details such as units, decimal points, dates, reference
ranges, and medicine names.

If the RAG implementation splits text into chunks: - Keep enough
surrounding context to avoid losing meaning. - Preserve page or document
references when practical. - Avoid mixing unrelated patients'
documents. - Track the source of each chunk so responses can be checked
against it.

### 3. Retrieval-Augmented Generation (RAG)

The RAG stage should retrieve context relevant to the user's question.
The retrieval source may be uploaded documents, an approved knowledge
base, or both, depending on what is implemented.

A robust RAG workflow should: 1. Prepare and index text. 2. Retrieve
relevant chunks for a query. 3. Return source metadata with the
retrieved context. 4. Detect when relevant context is missing or weak.
5. Pass retrieved context to the LLM. 6. Avoid claiming that a source
supports information it does not contain.

RAG improves grounding but does not guarantee factual correctness.

### 4. LLM response generation

The backend should send the user's question and relevant retrieved
context to the configured model. Prompts should instruct the model to: -
Answer from available evidence when possible. - Say when the documents
do not contain enough information. - Distinguish extracted facts from
general explanations. - Avoid inventing medications, diagnoses, values,
or medical history. - Encourage professional review for clinical
decisions. - Treat uploaded document content as untrusted data, not as
instructions to override system behavior.

### 5. End-to-end integration

The intended pipeline is not complete until a real test document can
pass through upload, OCR, retrieval, LLM generation, backend response
handling, and frontend display without manual intervention or hidden
mock data.

## API Integration

The exact API routes have not been verified in this document. Inspect
the backend route definitions and document the actual endpoints here.

A useful API reference should include:

  -----------------------------------------------------------------------
  Field                               What to document
  ----------------------------------- -----------------------------------
  Method and path                     Exact HTTP method and route

  Authentication                      Whether a valid session/token is
                                      required

  Request                             Content type, fields, and upload
                                      constraints

  Success response                    Actual response schema

  Error responses                     Validation, authentication,
                                      provider, and server errors

  Dependencies                        OCR, RAG, LLM, database, or storage
                                      services
  -----------------------------------------------------------------------

For file upload endpoints, the request may use `multipart/form-data`;
for JSON questions, it may use `application/json`. Confirm each
endpoint's actual contract before relying on these examples.

### API base URL and 404 errors

If the browser sends a request to a URL such as:

``` text
https://<frontend-domain>/api/v1/auth/login
```

and returns `404 Not Found`, check:

1.  Is the request going to the intended backend host, or accidentally
    to the frontend host?
2.  Does the backend actually define `/api/v1/auth/login` with the
    requested HTTP method?
3.  Is the API prefix correct?
4.  Is `VITE_API_BASE_URL` set to the intended public backend URL?
5.  Does the frontend concatenate the base URL and route correctly,
    without missing or duplicated path segments?
6.  Has the frontend been rebuilt/redeployed after changing its
    build-time environment variables?
7.  If the frontend and backend are separate deployments, are they
    deployed and configured independently?

A `404` generally means the requested route was not found at that URL.
It does not, by itself, prove that the API key or OCR/RAG/LLM
integration is incorrect.

## Testing and Validation

**End-to-end testing is currently pending.** Use the following manual cases to validate the application. Run them in a development/test environment using synthetic or de-identified documents, never real patient records unless explicitly authorized.

### Test setup

1. Pull the latest branch and install dependencies using the repository instructions.
2. Configure the frontend API base URL to point to the backend being tested.
3. Set private LLM/OCR credentials only in the backend environment or hosting secrets.
4. Start the backend and frontend using the commands defined by the actual project.
5. Open browser Developer Tools and keep the Network and Console tabs visible.
6. Prepare a clear synthetic prescription/report image, a blurry image, an unsupported file, and an oversized test file if the upload limit is known.
7. Record the date, environment, commit/build, result, and any bug for each test.

> These are proposed test cases, not evidence that the application has passed them. If a feature is not implemented, mark it **Blocked / Not implemented**, not Passed.

### Manual test cases

| ID | Steps | Expected result | Status |
|---|---|---|---|
| TC-01 | Open the frontend URL and refresh the page. | The page loads without a blank screen or fatal console error. | Not run |
| TC-02 | Open DevTools → Network and trigger a backend-backed action. Inspect URL, method, status, and response. | Request targets the configured backend route and returns its documented response. | Not run |
| TC-03 | If authentication exists, sign in using an authorized test account. | Valid credentials follow the expected sign-in flow; no credentials appear in URLs/logs. | Not run / verify auth |
| TC-04 | If authentication exists, submit invalid login details. | Access is denied with a safe error message; sensitive account details are not disclosed. | Not run / verify auth |
| TC-05 | Upload a clear, supported synthetic prescription image. | Upload succeeds and OCR returns readable text or a clear processing status. | Not run |
| TC-06 | Upload a blurry, rotated, or low-resolution synthetic document. | Uncertainty is reported; the system does not silently invent unreadable text. | Not run |
| TC-07 | Upload an unsupported file type. | The backend rejects it safely with a useful validation message. | Not run |
| TC-08 | Upload a file larger than the configured size limit. | The request is rejected cleanly and the service remains available. | Not run |
| TC-09 | Compare OCR output with the source test image. | Medicine names, dates, units, decimals, and measurements are accurate or flagged as uncertain. | Not run |
| TC-10 | Ask a question whose answer is explicitly present in the test document. | RAG retrieves relevant context and the answer matches the source; citations appear if implemented. | Not run |
| TC-11 | Ask a question not answered by the document or approved knowledge source. | The system acknowledges insufficient evidence rather than fabricating document facts. | Not run |
| TC-12 | In a safe test environment, temporarily use an invalid LLM credential, test a request, then restore it. | A controlled error is shown; secrets and raw sensitive provider details are not exposed. | Not run |
| TC-13 | Simulate an OCR or retrieval failure using a test stub or unavailable dependency in a non-production environment. | The UI shows a recoverable error and the backend does not crash. | Not run |
| TC-14 | Temporarily set an invalid frontend API URL, trigger a request, then restore the correct URL. | Failure is diagnosable in Network/Console; connectivity returns after restoration. | Not run |
| TC-15 | Inspect built frontend files and browser requests for private LLM API credentials. | No private key appears in bundles, requests, or client-visible environment variables. | Not run |
| TC-16 | Review logs while processing a synthetic document. | Logs do not unnecessarily contain full medical text, personal data, tokens, or secrets. | Not run |
| TC-17 | If multiple accounts exist, upload a document as account A and attempt to access it as account B. | Account B cannot read or retrieve account A's documents or results. | Not run / verify auth |
| TC-18 | Open the deployed frontend and trigger a real API operation against the deployed backend. | Production URL, CORS, route, and server-side configuration work together. | Not run |
| TC-19 | Simulate a slow or unavailable AI provider in a controlled test. | Timeouts and loading states are handled, and repeated clicks do not create uncontrolled duplicate work. | Not run |
| TC-20 | Run the project's documented build and automated test commands. | Commands exit successfully; failures are recorded and fixed before release. | Not run |

### Step-by-step OCR → RAG → LLM acceptance test

1. Start the backend with valid server-side configuration and start the frontend.
2. Upload a synthetic test prescription with a clearly readable sample item, date, and instruction.
3. Confirm the upload request reaches the backend and returns an appropriate status.
4. Inspect OCR output in a safe development environment and compare it with the test image.
5. Confirm the extracted text reaches the RAG indexing/retrieval stage.
6. Ask a question whose answer is explicitly present in the test document.
7. Inspect retrieved chunks and confirm they are relevant and belong to the correct test document.
8. Confirm the backend sends the question and retrieved context to the configured LLM.
9. Compare the answer with the source. It must not invent medication details or change numeric values.
10. Ask a question not answered by the document. The system should acknowledge the evidence gap.
11. Confirm the frontend renders the response and handles loading/errors.
12. Repeat with an unreadable image and a controlled provider failure.
13. Mark every step **Passed**, **Failed**, or **Blocked** and record sanitized diagnostic details.

### Troubleshooting test failures

- **404 Not Found:** Check request host, route path, API prefix, and HTTP method. The frontend may be calling its own domain rather than the backend.
- **CORS error:** Allow the exact frontend origin in backend configuration.
- **401/403:** Check authentication, session/token handling, and backend authorization.
- **400/413:** Check request fields, content type, file validation, and upload-size limits.
- **5xx/provider error:** Inspect sanitized backend logs, server-side configuration, provider status, quota, and timeout.
- **Empty OCR output:** Verify file support, image quality, OCR initialization, and extraction response before investigating RAG.
- **Irrelevant RAG context:** Test retrieval separately and verify OCR text was indexed with correct document metadata.
- **Poor LLM answer:** Inspect retrieved context and prompt construction; generation may not be the only cause.

### Suggested test layers

1. **Unit tests:** OCR parsing, text normalization, chunking, retrieval logic, and response validation.
2. **API tests:** Request validation, authentication, status codes, and error responses.
3. **Integration tests:** OCR-to-RAG and RAG-to-LLM connections.
4. **End-to-end tests:** Upload a synthetic document in the UI and verify the answer.
5. **Security tests:** File validation, authorization boundaries, secret exposure, and sensitive logging.
6. **Deployment smoke tests:** Verify deployed frontend, backend, configuration, and required services.

Use synthetic or appropriately de-identified test documents wherever possible. Do not use real patient records without the necessary authorization and safeguards.

## Deployment Guide

Deployment is **not yet verified as complete**. Treat the following as a
preparation checklist, not confirmation that the application is live.

### 1. Prepare the repository

-   Confirm the correct branch and a clean working tree.
-   Ensure dependency manifests and lockfiles are committed.
-   Ensure `.env` files, private keys, uploaded documents, and generated
    sensitive data are not committed.
-   Run the frontend build and backend tests locally.
-   Verify the frontend's production API base URL.

### 2. Deploy the frontend

Vercel can host a Vite frontend.

1.  Import the repository into Vercel.
2.  Select the correct project/root directory.
3.  Configure the build command and output directory to match the actual
    frontend project. Typical Vite defaults are `npm run build` and
    `dist`, but verify the project settings.
4.  Add the public `VITE_API_BASE_URL` pointing to the deployed backend.
5.  Do not add a private LLM key to a `VITE_*` variable.
6.  Deploy and inspect build logs.
7.  Test the deployed page and its Network requests.

If Vercel says a project name is invalid, use a name containing only
lowercase letters, digits, periods, underscores, or hyphens, within the
platform's length limit.

### 3. Deploy the backend

Choose a hosting provider compatible with the backend runtime and any
required system dependencies. Configure: - The backend start command. -
Private LLM/OCR credentials as server-side secrets. - Allowed frontend
origins/CORS settings. - Database or vector-store connectivity, if
used. - File upload limits and temporary-file handling. - Health checks,
logging, and timeouts.

Do not assume that deploying the frontend to Vercel also deploys a
separate backend service. If the backend is hosted separately, deploy
and configure it independently.

### 4. Configure production connectivity

-   Set the frontend API URL to the real backend HTTPS address.
-   Ensure the backend accepts requests from the deployed frontend
    origin.
-   Confirm the required routes exist on the deployed backend.
-   Verify environment variables in the correct hosting project and
    environment.
-   Rebuild/redeploy when a build-time frontend variable changes.
-   Test authentication, document upload, OCR, RAG, and LLM behavior
    against the deployed environment.
-   Check logs for errors without exposing medical data or secrets.

### 5. Release checklist

-   [ ] Frontend build passes.
-   [ ] Backend starts and passes health checks.
-   [ ] Correct production API URL is configured.
-   [ ] All required backend secrets are set server-side.
-   [ ] CORS and authentication are configured correctly.
-   [ ] OCR, RAG, and LLM integration tests pass.
-   [ ] End-to-end tests pass with synthetic test documents.
-   [ ] Error handling and rate limits are reviewed.
-   [ ] Privacy and security review is complete.
-   [ ] Deployment URL and rollback procedure are documented.

Do not describe the app as production-ready until the release checklist
is completed.

## Security and Privacy

Health records and prescriptions may contain highly sensitive personal
information. Security and privacy must be treated as core requirements.

-   **Keep secrets server-side:** Never expose private provider keys in
    frontend code or client-visible environment variables.
-   **Use access controls:** Only authorized users should access their
    own documents and results. If hospital-managed account creation is
    part of the deployment, do not enable public self-registration
    unless explicitly required and reviewed.
-   **Enforce authorization on the backend:** Do not rely on frontend
    route guards alone.
-   **Validate uploads:** Check file type, size, content, and storage
    handling. Never trust a filename or client-provided MIME type by
    itself.
-   **Protect transport and storage:** Use HTTPS in production and
    appropriate encryption and access controls for stored files and
    databases.
-   **Minimize retention:** Store only what is needed and define
    deletion and retention behavior.
-   **Limit logging:** Do not log credentials, full prescriptions,
    patient identifiers, or full LLM prompts containing health data
    unless strictly necessary and properly protected.
-   **Handle third-party processing carefully:** Review the privacy,
    retention, and data-processing terms of any OCR, LLM, analytics, or
    hosting provider before sending health information.
-   **Treat documents as untrusted input:** Extracted text may contain
    malicious instructions or misleading content. It must not override
    application instructions or security checks.
-   **Review outputs:** Make uncertainty clear and provide a way to
    report errors.
-   **Meet applicable requirements:** Identify and comply with
    applicable privacy, healthcare, and data-protection laws and
    institutional policies before real-world use.

This README is not a security audit or legal compliance certification.

## Known Limitations

-   OCR, RAG, LLM, and frontend/backend integration are still in
    progress.
-   End-to-end behavior has not yet been fully verified.
-   Production deployment has not yet been completed and validated.
-   Exact framework versions, folder structure, API routes,
    database/vector store, OCR provider, and LLM model must be confirmed
    from the repository.
-   OCR can misread handwriting, medicine names, units, decimal points,
    and dates.
-   Retrieved context and LLM responses may be incomplete or incorrect.
-   Medical document quality, language, layout, and file format can
    affect extraction.
-   A successful build or API response alone does not establish clinical
    safety or production readiness.

## Development Roadmap

### Phase 1 --- Stabilize the application

-   [ ] Confirm the repository layout and runtime versions.
-   [ ] Document actual frontend and backend start commands.
-   [ ] Standardize environment variable names.
-   [ ] Confirm API base URL construction and route prefixes.
-   [ ] Fix frontend/backend connectivity and route errors.

### Phase 2 --- Complete OCR integration

-   [ ] Connect document upload to the real OCR implementation.
-   [ ] Add upload validation and useful error messages.
-   [ ] Verify extracted text against sample documents.
-   [ ] Preserve uncertainty for unreadable content.

### Phase 3 --- Complete RAG and LLM integration

-   [ ] Pass OCR text into the retrieval/indexing workflow.
-   [ ] Verify retrieval quality and source metadata.
-   [ ] Pass retrieved context to the LLM through the backend.
-   [ ] Handle empty retrieval, provider failures, and timeouts.
-   [ ] Add safeguards against unsupported medical claims.

### Phase 4 --- End-to-end quality

-   [ ] Add unit, API, integration, and end-to-end tests.
-   [ ] Test loading, empty, success, and failure states.
-   [ ] Test authorization and cross-user document isolation.
-   [ ] Review privacy, secrets, and sensitive logs.

### Phase 5 --- Deployment and release

-   [ ] Deploy the backend and configure secrets.
-   [ ] Deploy the frontend and configure the production API URL.
-   [ ] Validate production OCR/RAG/LLM requests.
-   [ ] Complete a release/security checklist.
-   [ ] Document deployment URLs, monitoring, and rollback steps.

## Contributing

Contributions should follow the repository's branch and review workflow.

1.  Create a feature branch from the appropriate base branch.
2.  Keep changes scoped to a clear task.
3.  Do not commit secrets, real medical records, or sensitive logs.
4.  Run the available tests and build checks.
5.  Describe what changed, how it was tested, and any remaining
    limitations in the pull request.
6.  Update this README when setup steps, APIs, dependencies, or
    deployment configuration change.

Example:

``` bash
git checkout main
git pull origin main
git checkout -b feature/short-description
```

Use the branch policy adopted by your team; if your task must be based
on a shared feature branch, follow that policy instead of using `main`.

## Troubleshooting

### Frontend API request returns `404 Not Found`

-   Verify the request host in the browser Network tab.
-   Check whether the route exists on that host.
-   Confirm the API prefix and HTTP method.
-   Confirm `VITE_API_BASE_URL` points to the intended backend.
-   Rebuild/redeploy after changing Vite environment variables.

### Frontend cannot reach the backend

-   Confirm the backend is running and reachable.
-   Check the configured URL, port, HTTPS requirements, and CORS policy.
-   Inspect browser Network and backend logs.
-   Confirm the frontend does not accidentally use a relative URL that
    targets the frontend host.

### LLM requests fail

-   Confirm the backend reads the expected environment variable.
-   Confirm the key is valid, active, and authorized for the configured
    model.
-   Check provider quota, rate limits, request format, and timeout
    errors.
-   Never paste a private key into client code or commit it to Git.

### OCR returns empty or inaccurate text

-   Test with a clear, high-resolution image.
-   Verify the file type is supported.
-   Check image orientation and preprocessing.
-   Inspect OCR output before the RAG stage.
-   Avoid interpreting uncertain medicine names or numeric results as
    confirmed facts.

### RAG returns irrelevant context

-   Confirm OCR text is actually passed into indexing.
-   Verify chunking and metadata handling.
-   Test retrieval independently of LLM generation.
-   Check whether the query and document content use different
    terminology or languages.
-   Ensure retrieved chunks belong to the correct user's document set.

### Environment variable changes do not appear

-   Confirm the variable is configured in the correct project and
    deployment environment.
-   For Vite, `VITE_*` variables are generally embedded at build time;
    rebuild and redeploy.
-   Restart local development servers after relevant environment
    changes.
-   Never solve this by exposing a private API key to the frontend.

### Deployment build fails

-   Check the root directory, build command, output directory, runtime
    version, and dependency lockfile.
-   Read the full build logs for the first meaningful error.
-   Confirm all required build-time variables are present.
-   Do not assume a successful frontend build means the backend has been
    deployed.

## Disclaimer

CarePilot-AI is an AI-assisted health information project. It is not a
substitute for a licensed clinician, professional diagnosis, emergency
services, or individualized treatment advice. AI-generated content may
be incomplete or incorrect. Users should verify important information
with a qualified healthcare professional, especially medication names,
doses, interactions, test results, diagnoses, and treatment decisions.

Do not use the application to make urgent or emergency medical
decisions. Seek appropriate professional or emergency care when needed.

## License

No license has been specified in this README. Add a `LICENSE` file and
update this section only after the project owners choose a license.
Without an explicit license, others should not assume they have
permission to reuse, distribute, or modify this code.

------------------------------------------------------------------------

## Maintainer checklist

Before publishing this README, replace or verify these items against the
actual repository:

-   [ ] Repository clone URL.
-   [ ] Actual folder tree and frontend/backend directories.
-   [ ] Exact frontend and backend frameworks and versions.
-   [ ] Real backend start command and health-check route.
-   [ ] Actual API routes and request/response schemas.
-   [ ] Actual OCR library/provider and supported file formats.
-   [ ] Actual RAG implementation, retrieval store, and indexing
    strategy.
-   [ ] Actual LLM provider/model and required environment variable
    names.
-   [ ] Authentication and authorization status.
-   [ ] Production hosting providers and deployment URLs.
-   [ ] Test commands and results.
-   [ ] Project license.
