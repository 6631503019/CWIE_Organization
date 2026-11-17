1. Executive Summary
Read-only review completed against main commit 37d1554. No files, dependencies, databases, deployments, or Git state were modified.

Four high-confidence findings were confirmed:

#	Severity	File	Lines	Vulnerability	Confidence
1	🟠 HIGH	organizationController.js	21-22	Unauthenticated access to private organizations using public=false	10/10
2	🟠 HIGH	roadshowController.js	16	Unauthenticated access to private roadshows	10/10
3	🟠 HIGH	mouController.js	15-24	Unauthenticated listing of unpublished MOUs	10/10
4	🟠 HIGH	server.js	70	Public static access to uploaded files	10/10
These are confirmed from source code; runtime exploitability was not tested.

2. Repository Overview
Verified areas:

Vue/Vite frontend under frontend/
Express backend under backend/
MongoDB/Mongoose models and controllers
Firebase authentication and JWT authorization
Organization, MOU, roadshow, review, and import routes
Multer-based uploads
CSV/XLS/XLSX processing
Render deployment configuration
Dependency manifests and lockfiles
No GitHub Actions workflow or formal security CI pipeline was found.

3. Verified Technology Stack
Vue.js/Vite frontend
Node.js/Express backend
MongoDB/Mongoose persistence
Firebase Google authentication
Firebase Admin ID-token verification
JWT access and refresh tokens
Multer multipart uploads
CSV/XLS/XLSX imports
Render deployment
4. Architecture Description
User authenticates with Google through Firebase.
Frontend sends the Firebase ID token to /api/auth/google.
Backend verifies the token with Firebase Admin.
Backend issues JWT access and refresh tokens.
Frontend stores bearer tokens in browser localStorage.
Frontend calls protected Express endpoints with Authorization: Bearer.
Express controllers access MongoDB through Mongoose.
Administrators upload files and import organization data.
Uploaded files are served through /uploads.
Authentication and administrative write routes generally use protect and administrator authorization. The primary weakness is in public collection and static-file access controls.

5. Mermaid Data Flow Diagram

6. Trust Boundaries
Browser/local storage ↔ backend API
Firebase ↔ backend token verification
Backend ↔ MongoDB
Backend upload handling ↔ filesystem
Public internet ↔ unauthenticated collection endpoints
Public internet ↔ static upload directory
7. STRIDE Threat Model
Threat	Component	Scenario	Existing protection	Risk
Spoofing	Authentication	Forged or invalid Firebase/JWT token	Firebase Admin verification and JWT validation	Medium
Tampering	Admin APIs	Unauthorized modification of organizations or uploads	Protected administrative write routes	Medium
Repudiation	API operations	Security-relevant actions lack comprehensive audit trails	Limited logging observed	Medium
Information Disclosure	Collection APIs	public=false exposes private records without authentication	Inadequate collection authorization	High
Information Disclosure	Upload serving	/uploads exposes private or unpublished files	No record-level access check	High
Denial of Service	Search/import/upload	Large or expensive requests may consume resources	Some upload restrictions observed; runtime validation required	Medium
Elevation of Privilege	Authorization	Lower-privileged user attempts administrative actions	Role checks observed on write routes	Low/Medium
8. Vulnerability Findings
TSC-001 — Unauthenticated Private Organization Listing
File: organizationController.js
Route: GET /api/organizations?public=false
CWE: CWE-862 Missing Authorization; CWE-200 Exposure of Sensitive Information
OWASP Top 10:2025: A01 Broken Access Control
Severity: High
Classification: Confirmed from source
Root cause: The public route allows public=false to remove the public-only filter without requiring authentication or an administrator role.
Impact: Private organization contact details, addresses, telephone numbers, and administrative metadata may be disclosed.
Remediation: Require authenticated administrator authorization for private queries. For unauthenticated requests, always enforce is_public: true.
Verification: Test anonymous, authenticated non-admin, and admin requests with public=false; only authorized administrators should receive private records.
TSC-002 — Unauthenticated Private Roadshow Listing
File: roadshowController.js
Route: GET /api/roadshows?public=false
CWE: CWE-862; CWE-200
OWASP Top 10:2025: A01 Broken Access Control
Severity: High
Classification: Confirmed from source
Root cause: public=false produces an unrestricted collection query.
Impact: Private roadshow records may be disclosed.
Remediation: Require administrator authorization for private collection queries and default anonymous requests to public records only.
Verification: Repeat the request with no token, a normal user token, and an admin token.
TSC-003 — Unauthenticated Unpublished MOU Listing
File: mouController.js
Route: GET /api/mou, GET /api/mou?published=false
CWE: CWE-862; CWE-200
OWASP Top 10:2025: A01 Broken Access Control
Severity: High
Classification: Confirmed from source
Root cause: The public route returns all MOUs by default and permits explicit unpublished filtering without authorization.
Impact: Unpublished agreements and associated metadata may be exposed.
Remediation: Default public responses to is_published: true; restrict unpublished/all-MOU queries to administrators.
Verification: Confirm anonymous callers cannot retrieve unpublished MOU records.
TSC-004 — Public Static Access to Uploaded Files
File: server.js
Path: /uploads/*
CWE: CWE-552 Files or Directories Accessible to External Parties; CWE-862; CWE-200
OWASP Top 10:2025: A01 Broken Access Control; A04 Cryptographic Failures/Sensitive Data Exposure
Severity: High
Classification: Confirmed from source
Root cause: The entire upload directory is mounted with unauthenticated express.static.
Impact: Anyone who obtains or guesses a path may download private MOU documents, roadshow assets, or unpublished files.
Remediation: Store private files outside the public web root and serve them through authenticated, authorization-aware handlers that check publication state.
Verification: Attempt anonymous access to a private fixture file and confirm 401/403 or equivalent denial.
Additional Observations
These require runtime verification and were not classified as confirmed exploitable vulnerabilities:

Refresh tokens are stored in localStorage, increasing impact if an XSS issue exists.
Refresh-token rotation and server-side revocation were not visibly implemented.
File validation relies partly on client-provided MIME types/extensions.
Organization search uses an unescaped RegExp; malformed or expensive expressions may require resource-use testing.
No confirmed Vue v-html sink or MongoDB injection was identified.
Public review creation may permit spam or content manipulation; rate limiting and moderation should be evaluated.
9. CWE and OWASP Mapping
Finding	CWE	OWASP Top 10:2025
Private organization access	CWE-862, CWE-200	A01 Broken Access Control
Private roadshow access	CWE-862, CWE-200	A01 Broken Access Control
Unpublished MOU access	CWE-862, CWE-200	A01 Broken Access Control
Public upload directory	CWE-552, CWE-862, CWE-200	A01 Broken Access Control; A04 Cryptographic Failures
Dependency/CI gaps	CWE-1395, CWE-1104 where applicable	A03 Software Supply Chain Failures
Limited audit logging	CWE-778	A09 Security Logging and Alerting Failures
10. Safe Security Test Plan
Use only a disposable local/test deployment with non-sensitive fixtures.

Test	Objective	Expected secure behavior
ST-001	Anonymous organization privacy	public=false returns 401/403 or only public records
ST-002	Anonymous roadshow privacy	Private roadshows are not returned
ST-003	Anonymous MOU privacy	Unpublished MOUs are not returned
ST-004	Upload authorization	Private file paths cannot be downloaded anonymously
ST-005	RBAC	Normal users cannot invoke admin operations
ST-006	IDOR/BOLA	Changing record IDs does not expose unauthorized data
ST-007	Input validation	Invalid IDs, query types, and oversized inputs are rejected
ST-008	NoSQL injection	Operators such as $ne and $where are rejected or treated as data
ST-009	File restrictions	Invalid extensions, MIME types, oversized files, and malformed spreadsheets are rejected
ST-010	Security headers/errors	Responses do not expose stack traces or omit required security headers
Do not run these tests against production or with real private documents.

11. Remediation Recommendations
Centralize visibility authorization for all public, published, and similar query parameters.
Apply authentication and role checks at the route/controller boundary.
Default all anonymous collection endpoints to public records.
Remove public static serving for private uploads.
Implement authenticated download handlers with record-level authorization.
Use server-side MIME detection and content validation.
Add rate limits to login, reviews, search, import, and upload endpoints.
Consider HTTP-only, secure, same-site cookies for refresh tokens.
Add refresh-token rotation and revocation.
Add structured security-event logging without recording secrets.
Escape or constrain user-provided regular expressions used in search.
Add regression tests for every privacy-related query parameter.
12. Supply-Chain Security Assessment
Area	Status
Lockfiles	Present
Reproducible install	Render uses npm ci
Dependency version ranges	Present; should be tightened where practical
SBOM generation	Not found
SCA scanning	Not found
Trivy/dependency gate	Not found
Cosign signing	Not found
Build provenance/attestation	Not found
Secret scanning	Not found
Dependency review policy	Not found
13. Security CI Assessment
No GitHub Actions workflow was found.

Not found:

SAST such as Semgrep
SCA such as Trivy or npm audit gating
Gitleaks or equivalent secret scanning
SARIF upload
High/Critical failure policy
Pinned third-party actions
Least-privilege workflow permissions
Automated authorization regression tests
14. Term Project Rubric Gap Analysis
Criterion	Current status	Main gap
Threat model quality and completeness — 20	Partially complete	Formal DFD, trust boundaries, and STRIDE documentation are absent
Vulnerability findings — 25	Partially complete	Confirmed findings exist, but no automated verification evidence
Remediation quality — 25	Partially complete	Recommendations needed for each finding and regression coverage
Supply-chain hardening — 15	Weak	No SBOM, SCA, signing, provenance, or secret scanning
CI pipeline — 10	Not found	No visible security CI workflow
Presentation/report clarity — 5	Pending	Requires final formatted report and evidence appendix
Instructor approval is still needed for:

Using CWIE Organization as the official target
Confirming the one-person team arrangement
Confirming whether runtime testing against a local deployment is permitted
Confirming the expected OWASP version and course-specific rubric interpretation
15. Priority Recommendations
Fix private collection endpoint authorization.
Remove unauthenticated static access to uploads.
Add regression tests for privacy and RBAC behavior.
Add security headers, rate limiting, and structured audit logging.
Add dependency scanning, secret scanning, SAST, and SARIF reporting.
Generate SBOMs and establish artifact provenance/signing.
Document the DFD, STRIDE model, and authorization matrix.
16. Unverified Assumptions and Limitations
No production or public deployment was tested.
No credentials or database connections were used.
No state-changing requests were executed.
Dependency vulnerabilities were not independently scanned.
Runtime CORS, headers, token expiry, refresh behavior, and rate limits require deployment testing.
Exploitability of the regular-expression search issue was not established.
The assessment is based on source/configuration review only.
