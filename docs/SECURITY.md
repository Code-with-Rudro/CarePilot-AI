# SECURITY.md — TPU / Altrix Labs

## 1. Purpose and enforcement

This document defines the minimum security baseline for the TPU AI-Powered Personal Health Copilot. It applies to the web client, backend APIs, authentication, administration, database and object storage, OCR processing, RAG/retrieval, AI integrations, deployment infrastructure, CI/CD, and all team members.

**Release rule:** Do not deploy to production while a critical/high-severity issue is unresolved, unless the security owner documents a time-limited exception, compensating controls, and approval. Never claim an audit passed until the checks have actually run and evidence is recorded.

## 2. Team boundaries and change permissions

- Each contributor must use an individual account; do not share accounts or passwords.
- Grant least-privilege access to repositories, environments, databases, cloud resources, and deployment tools.
- Each person must work within their assigned branch/section and task boundary.
- Before changing another contributor's owned files, interfaces, database schema, model pipeline, or deployment configuration, obtain that owner's approval and record it in the issue or pull request.
- Security fixes that cross boundaries must be coordinated with the owner and reviewed by a second contributor.
- Do not put personal passwords in `README.md`, `TASK.md`, `MEMORY.md`, source code, prompts, screenshots, chat messages, or this file. Use a password manager and individual access controls.
- Keep an ownership map in the project tracker: component, owner, reviewers, dependencies, and approved interfaces.

## 3. Secrets and environment variables

- Never commit real API keys, access tokens, database passwords, signing keys, private certificates, or production credentials.
- Keep secrets in the deployment platform's secret manager or a dedicated secrets manager. For local development, use an ignored `.env` file and a committed `.env.example` containing placeholders only.
- Ensure `.env`, `.env.*` (except approved examples), private keys, credentials, backups, database dumps, and local configuration are excluded by `.gitignore` and deployment packaging rules.
- Never expose server secrets through client bundles, browser storage, public runtime configuration, source maps, logs, error responses, or frontend variables such as `VITE_*`, `NEXT_PUBLIC_*`, or equivalent public prefixes.
- Browser-visible keys are not secret. Restrict any unavoidable public key by domain, API, quota, and environment; move privileged operations to the backend.
- Validate required environment variables at startup. Fail closed when a required secret is missing; do not silently use insecure defaults.
- Use separate credentials for development, test, staging, and production. Restrict scope and rotate credentials regularly.
- If a secret may have leaked, revoke/rotate it immediately, investigate usage, and remove it from current files and history where appropriate. Deleting a secret from a commit alone does not invalidate it.

## 4. Git and repository exposure checks

Before release and after any suspected leak:

- Inspect tracked files and staged changes for secrets; use a maintained secret scanner such as Gitleaks or TruffleHog.
- Scan the full Git history, branches, tags, pull requests, build artifacts, logs, and published packages where applicable.
- Review `.gitignore`, `.dockerignore`, deployment allowlists, and repository visibility.
- Check for `.env` files, private keys, database dumps, backups, debug logs, test fixtures containing real patient data, and generated files with embedded credentials.
- If a secret was committed, revoke it first. Then coordinate history rewriting and force-pushes carefully; inform collaborators and rescan all refs.
- Enable secret scanning and push protection where the hosting provider supports them.

Suggested local checks (run from the repository root; review output before sharing it):
```bash
git status --short
git ls-files
git log --all --oneline --decorate
gitleaks detect --source . --redact
```
Do not paste secret values into tickets or audit reports. Record file/commit references and a redacted finding instead.

## 5. Authentication and session security

- Use a maintained authentication framework or identity provider; do not invent cryptography or roll your own password/session protocol.
- Hash passwords using Argon2id where supported, or a currently recommended bcrypt configuration. Use a unique salt per password; use a pepper only if it can be stored separately and managed safely. Never store plaintext or reversibly encrypted passwords.
- Enforce sensible password length, breached-password checks where available, login throttling, and secure account recovery. Avoid arbitrary complexity rules that encourage predictable passwords.
- Use MFA for administrators and privileged accounts; prefer phishing-resistant MFA where practical.
- Use `HttpOnly`, `Secure`, and appropriate `SameSite` cookies for browser sessions. Rotate session IDs after login/privilege changes; expire sessions; invalidate them on logout and credential reset.
- Protect cookie-authenticated state-changing requests against CSRF. Validate allowed origins where appropriate.
- Avoid storing long-lived access tokens or refresh tokens in `localStorage`. Keep tokens short-lived and protect refresh flows.
- Return generic authentication errors that do not reveal whether an account exists. Log security events without logging credentials or tokens.

## 6. Authorization, admin routes, and tenant isolation

- Authentication answers “who are you?”; authorization must separately verify “may you do this?”
- Enforce authorization on the server for **every** protected route, API operation, file download, database query, and background job. Hiding a button or route in the UI is not security.
- Deny access by default. Check role and resource ownership on every request, including object IDs supplied by the client.
- Define explicit roles and permissions, for example: user, clinician/reviewer (only if the product requirements authorize this role), support, and administrator. Do not grant admin access by default.
- Protect admin routes with server-side role checks, MFA, re-authentication for sensitive actions, and audit logging. Keep admin interfaces and credentials separate from ordinary user flows where feasible.
- Prevent IDOR/BOLA by ensuring users can only read, update, export, or delete their own records unless a specific, approved sharing rule applies.
- Test horizontal access (user A attempting to access user B's records) and vertical access (ordinary user attempting admin functions).
- Use database row-level security or equivalent tenant isolation as defense in depth, not as a substitute for application authorization.
- Require explicit approval for cross-user sharing and show the user what is shared, with whom, and how to revoke it.

## 7. Input validation, forms, and output handling

- Validate every input on the server with schema-based validation, explicit types, length limits, allowed values, and business-rule checks. Treat client-side validation as usability only.
- Use parameterized queries or a safe ORM; never concatenate untrusted input into SQL, shell commands, or query languages.
- Encode output for its context and sanitize HTML with a maintained allowlist sanitizer if rich text is necessary. Avoid unsafe DOM APIs and `eval`.
- Validate redirects, URLs, MIME types, file names, identifiers, and enum values. Use allowlists where possible.
- Apply request-body, field, array, pagination, and upload size limits. Reject malformed content with safe error messages.
- Protect against XSS, SQL/NoSQL injection, command injection, path traversal, SSRF, mass assignment, and unsafe deserialization.
- Do not trust MIME types or file extensions alone. Inspect actual content and reject unexpected formats.

## 8. API and abuse protection

- Require authentication and authorization for every non-public endpoint.
- Apply rate limits and quotas by account, IP, route, and costly operation; use shared/distributed storage for limits in multi-instance deployments.
- Use stricter limits for login, OTP/recovery, OCR uploads, report generation, RAG queries, LLM calls, exports, and admin operations.
- Set timeouts, concurrency limits, pagination caps, maximum upload sizes, and per-user compute/token budgets. Return `429` with a safe retry policy when limits are exceeded.
- Configure CORS with explicit trusted origins, methods, and headers. Never use wildcard origins with credentials.
- Verify webhook signatures and timestamps; make handlers idempotent and reject replayed events where applicable.
- Do not expose stack traces, internal service URLs, SQL errors, model prompts, or secrets in API responses.
- Keep API documentation and debug/test endpoints private or disabled in production.
- Enforce TLS in transit and use service-to-service authentication for internal APIs.

## 9. Security headers and production configuration

Configure headers at the application or trusted reverse proxy/CDN, then verify them on the deployed site:

- Content-Security-Policy (CSP), starting with a restrictive policy and avoiding `unsafe-eval`; use nonces/hashes for scripts where feasible.
- `Strict-Transport-Security` only after HTTPS is correctly enabled across the intended host scope.
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin` (or stricter if compatible)
- `frame-ancestors` in CSP or `X-Frame-Options` for clickjacking defense.
- A restrictive `Permissions-Policy` for unused browser capabilities.
- Secure cookie flags as described above.

Production requirements:
- Set production mode explicitly and disable debug mode, verbose errors, interactive debuggers, directory listing, sample routes, test accounts, and development consoles.
- Remove default credentials and insecure fallback configuration.
- Restrict allowed hosts, trusted proxies, and forwarded headers.
- Keep TLS certificates valid and redirect HTTP to HTTPS.
- Ensure backups, storage buckets, databases, dashboards, and admin consoles are not publicly accessible unless explicitly intended.

## 10. File uploads, OCR, and document processing

- Allow only required file formats and enforce file size, page count, image dimensions, decompression limits, and processing timeouts.
- Store uploads outside the web root in private storage with random server-generated object names. Never use a user-supplied path as a storage path.
- Scan files for malware where feasible; isolate parsers and OCR workers with least privilege and resource limits.
- Do not execute uploaded files. Serve downloads with safe content-disposition and content-type headers.
- Apply access checks to upload, preview, OCR result, export, and deletion operations.
- Delete temporary files and define retention/deletion rules for originals and derived text.
- Treat extracted OCR text as untrusted input; it may contain malicious instructions or misleading content.

## 11. AI, RAG, embeddings, and health-data protection

- Enforce authorization **before retrieval** and filter every vector/database search by the authenticated user's permitted tenant, document, and sharing scope. Never rely on the LLM to enforce access control.
- Keep each user's documents, embeddings, chunks, caches, conversation history, and generated summaries isolated. Test that one user cannot retrieve another user's content through direct queries, semantic search, citations, or cached responses.
- Treat retrieved documents, OCR text, web content, and tool output as untrusted data, not instructions. Defend against prompt injection and indirect prompt injection.
- Do not place secrets, system prompts, or unrestricted tools in user-visible model context. Restrict tools by allowlist and enforce permissions in application code.
- Validate model/tool arguments and outputs. Use least privilege for agents; require human confirmation for high-impact actions.
- Avoid sending identifiable health information to external AI providers unless the provider, configuration, contracts, consent, and applicable law/policy permit it.
- Minimize data sent to models, redact identifiers where appropriate, and review provider retention/training settings.
- Keep source citations and provenance for health insights. Clearly distinguish extracted facts, model-generated interpretation, and uncertain information.
- Do not present model output as a definitive diagnosis or substitute for a qualified clinician. Provide appropriate escalation guidance for urgent symptoms.
- Encrypt health data in transit and at rest; restrict decryption keys and database privileges; audit access and exports.
- Define retention, user export, deletion, backup expiry, and incident-notification processes consistent with applicable requirements.

## 12. Database, storage, and encryption

- Use TLS for network connections and managed encryption at rest for databases, disks, backups, and object storage.
- Use a dedicated least-privilege database identity for the application; separate migration/admin credentials from runtime credentials.
- Restrict database network access to required services. Do not expose database ports publicly.
- Use parameterized queries, safe transactions, integrity constraints, and tested migrations.
- Keep backups encrypted, access-controlled, and periodically test restoration.
- Do not log full medical records, access tokens, passwords, session cookies, or unnecessary personally identifiable information.
- Define deletion behavior for primary records, object storage, vector indexes, caches, exports, and backups.

## 13. Logging, monitoring, and incident response

- Record sign-in failures, MFA and password changes, privilege changes, admin actions, denied access, sensitive exports/deletions, secret rotation, and security configuration changes.
- Keep logs access-controlled, tamper-resistant where practical, time-synchronized, and retained only as long as needed.
- Redact credentials, authorization headers, session IDs, and sensitive health content.
- Alert on repeated failures, unusual export/download volume, rate-limit abuse, cross-tenant access attempts, and unexpected privileged activity.
- Maintain an incident runbook: contain access, revoke exposed credentials, preserve relevant logs, assess affected systems/data, notify the security owner, remediate, and complete required notifications under applicable law and contracts.
- Test the incident process and backup restoration before a real incident.

## 14. Dependencies, build, and supply chain

- Identify the actual package manager and lockfile; use reproducible installs from the lockfile.
- Review outdated and vulnerable direct/transitive dependencies. Update in a branch, run tests, review breaking changes, and deploy progressively.
- Use maintained, supported versions; remove unused packages only after confirming they are not required by runtime, build, tests, or deployment.
- Run dependency vulnerability scanning, static analysis, secret scanning, and relevant container/IaC scans in CI.
- Pin or constrain build inputs appropriately, protect CI secrets, use minimal build permissions, and prevent untrusted pull requests from accessing deployment secrets.
- Generate a software bill of materials (SBOM) where feasible and review licenses and provenance.
- Never apply bulk upgrades or delete dependencies directly in production without tests and rollback plans.

## 15. Security audit checklist

Record each item as `PASS`, `FAIL`, `BLOCKED`, or `NOT APPLICABLE`, with evidence, date, reviewer, and remediation issue.

### Repository and secrets
- [ ] Full Git history and all relevant refs scanned for secrets.
- [ ] Current files, staged changes, build output, source maps, and container layers checked.
- [ ] Environment files, private keys, dumps, backups, and real patient data excluded.
- [ ] Any exposed secret revoked/rotated; leak response documented.
- [ ] Repository permissions and branch protection reviewed.

### Identity and access
- [ ] Passwords use Argon2id or an approved bcrypt configuration.
- [ ] MFA enabled for administrators and privileged accounts.
- [ ] Session cookie/token lifecycle, logout, reset, and CSRF protection tested.
- [ ] Every API and admin route has server-side authorization.
- [ ] Cross-user and cross-role access tests pass.
- [ ] Default accounts and credentials removed.

### Inputs and APIs
- [ ] Server-side schema validation and safe output encoding in place.
- [ ] Injection, XSS, CSRF, SSRF, path traversal, and mass-assignment tests reviewed.
- [ ] Rate limits, quotas, payload limits, timeouts, and concurrency limits tested.
- [ ] CORS, webhook signature verification, and safe error responses checked.

### Deployment and infrastructure
- [ ] Debug mode and development endpoints disabled.
- [ ] HTTPS/TLS, security headers, cookies, CORS, and trusted-proxy settings verified on deployment.
- [ ] Database, storage, backups, dashboards, and admin interfaces are private by default.
- [ ] Environment configuration has no insecure defaults; production secrets are managed securely.
- [ ] Logs and error reporting do not leak credentials or sensitive health data.

### Health data, OCR, and RAG
- [ ] Upload type/size/resource limits and private storage checked.
- [ ] OCR parsers and workers are isolated and resource-limited.
- [ ] Retrieval enforces user/tenant authorization before vector search.
- [ ] Cross-user RAG retrieval, citation, cache, and conversation isolation tests pass.
- [ ] Prompt-injection and untrusted-document tests run.
- [ ] Encryption, retention, deletion, backup restore, and external AI data handling reviewed.

### Dependencies and release
- [ ] Lockfile-based install succeeds and dependency vulnerability scan reviewed.
- [ ] Static analysis, tests, and relevant container/IaC scans pass.
- [ ] Unused dependencies/files removed only after impact review.
- [ ] No unresolved critical/high findings, or an approved exception is documented.
- [ ] Rollback plan, incident contact, and evidence of the audit are recorded.

## 16. Suggested commands (adapt to the actual stack)

Run commands in a development/CI environment first and inspect results; these commands are examples, not proof that the project is secure.

```bash
# Repository state and tracked files
git status --short
git ls-files

# Full-history secret scan (install Gitleaks separately)
gitleaks detect --source . --redact

# Node.js projects, if applicable
npm ci
npm audit
npm outdated

# Python projects, if applicable
python -m pip check
pip-audit

# Container projects, if applicable
docker image ls
```

Use only the commands relevant to the project's actual stack. Review proposed dependency changes, run tests, and keep a rollback path. A clean automated scan does not replace manual authorization, architecture, deployment, and data-flow review.

## 17. Findings and sign-off

For every finding, record:
- ID and date
- Affected component and environment
- Severity and impact
- Evidence with secrets and personal data redacted
- Reproduction steps safe for an authorized test environment
- Owner and remediation task
- Fix commit/deployment and retest evidence
- Residual risk and approved exception, if any

**Final sign-off:** Security reviewer: `TBD` · Audit date: `TBD` · Commit/release: `TBD` · Result: `NOT AUDITED`

Do not change `NOT AUDITED` to `PASS` until the checks have been run against the actual repository and deployed environment.
