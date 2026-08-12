-- Lan Pya seed data — three complete career tracks (Frontend, Full-Stack, AI & Data).
-- All curriculum content is independently authored; roadmap.sh was used only as a coverage reference.

-- ─── Career tracks ───────────────────────────────────────────────────────────

insert into public.career_tracks(id,key,title,description,version,data_origin) values
('10000000-0000-0000-0000-000000000001','frontend-developer',   'Frontend Developer',    'Build accessible, responsive, production-quality web interfaces.',                          2,'seeded_demo'),
('10000000-0000-0000-0000-000000000002','full-stack-developer',  'Full-Stack Developer',  'Build and operate complete products across browser, server, data, and cloud.',              1,'seeded_demo'),
('10000000-0000-0000-0000-000000000003','ai-data-analyst',       'AI & Data Analyst',     'Turn data into responsible analysis, decisions, dashboards, and evaluated AI workflows.',   1,'seeded_demo')
on conflict (key) do update set title=excluded.title, description=excluded.description, version=excluded.version;

-- ─── Frontend Developer — 12 milestones ─────────────────────────────────────

insert into public.roadmap_milestones(id,track_id,key,position,title,description,proof_label,content_version) values
('11000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','orientation',          1, 'Web foundations and tools',               'Understand how the web works and set up a dependable development environment.',                                                          'Environment and web concepts check',             2),
('11000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','semantic-html',         2, 'Semantic HTML and forms',                 'Structure meaningful pages that remain usable with assistive technology.',                                                               'Accessible profile page',                        2),
('11000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','responsive-css',        3, 'CSS and responsive layout',               'Build clear interfaces that adapt from small phones to large screens.',                                                                  'Responsive profile card',                        2),
('11000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','javascript',            4, 'JavaScript programming',                  'Use the language fundamentals that power browser interaction and application logic.',                                                     'Interactive opportunity tracker',                2),
('11000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','git-collaboration',     5, 'Git and collaboration',                   'Track changes, collaborate safely, and explain the history of a project.',                                                               'Reviewed repository workflow',                   2),
('11000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','async-web-apis',        6, 'Async JavaScript and web APIs',           'Connect interfaces to real data and handle slow or failed network states.',                                                              'Resilient data explorer',                        2),
('11000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001','typescript-tooling',    7, 'TypeScript and frontend tooling',         'Make larger projects safer, consistent, and repeatable to build.',                                                                      'Typed application refactor',                     2),
('11000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001','component-framework',   8, 'Component architecture',                  'Build reusable interfaces with a modern component framework and design system thinking.',                                                'Component-based product interface',              2),
('11000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000001','application-data',      9, 'Routing, state and application data',     'Coordinate navigation, shared state, server data, authentication, and real-time updates.',                                             'Authenticated multi-page application',           2),
('11000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000001','frontend-quality',     10, 'Testing, accessibility and performance',  'Ship interfaces that are testable, inclusive, fast, and observable.',                                                                   'Audited production interface',                   2),
('11000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001','modern-delivery',      11, 'Rendering and production delivery',       'Choose suitable rendering, security, discoverability, and offline strategies.',                                                         'Production-ready progressive web app',           2),
('11000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000001','hiring-capstone',      12, 'Portfolio and hiring capstone',           'Combine product judgment, engineering quality, and clear communication in one credible project.',                                        'Partner-reviewed frontend capstone',             2)
on conflict (track_id,key) do update set
  position=excluded.position, title=excluded.title,
  description=excluded.description, proof_label=excluded.proof_label,
  content_version=excluded.content_version;

-- ─── Full-Stack Developer — 14 milestones ────────────────────────────────────

insert into public.roadmap_milestones(id,track_id,key,position,title,description,proof_label,content_version) values
('21000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','fullstack-foundations',  1, 'Web and programming foundations',        'Build a shared mental model for browsers, servers, networks, terminals, and source code.',                              'Client-server concepts check',                  1),
('21000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','fullstack-frontend',     2, 'Frontend foundations',                   'Create semantic, responsive, and interactive browser interfaces.',                                                      'Responsive interactive website',                1),
('21000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','fullstack-tooling',      3, 'TypeScript and development workflow',    'Use typed code, packages, branches, automation, and repeatable builds.',                                                'Typed collaborative repository',                1),
('21000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000002','fullstack-ui',           4, 'Frontend application architecture',      'Build component-driven applications with routing, state, and server data.',                                             'Frontend product dashboard',                    1),
('21000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002','server-programming',     5, 'Server-side programming',                'Create server processes, business logic, configuration, and dependable error handling.',                                'Node.js service',                               1),
('21000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000002','api-design',             6, 'HTTP and API design',                    'Design stable interfaces between clients, services, and external systems.',                                             'Documented production API',                     1),
('21000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000002','relational-data',        7, 'Relational data and SQL',                'Model durable business data and query it correctly and efficiently.',                                                   'Normalized application database',               1),
('21000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000002','data-systems',           8, 'Caching, documents and search',          'Choose non-relational tools only when application requirements justify them.',                                           'Measured data-system extension',                1),
('21000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000002','identity-security',      9, 'Identity and application security',      'Protect accounts, data, sessions, and privileged operations across the stack.',                                         'Security-reviewed authenticated app',           1),
('21000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000002','backend-quality',       10, 'Backend architecture and quality',       'Keep business logic maintainable with clear boundaries and automated verification.',                                    'Tested service architecture',                   1),
('21000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000002','system-integration',    11, 'End-to-end product integration',         'Connect UI, API, database, files, email, and external services into one reliable product.',                            'Integrated team application',                   1),
('21000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000002','delivery-cloud',        12, 'Containers, delivery and cloud',         'Package, deploy, configure, and update an application safely.',                                                         'Automated staging deployment',                  1),
('21000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000002','reliability-scale',     13, 'Observability, performance and scale',   'Measure a running system and improve bottlenecks before adding complexity.',                                            'Measured reliability improvement',              1),
('21000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000002','fullstack-capstone',    14, 'Production full-stack capstone',         'Own a product from user need through architecture, deployment, operations, and explanation.',                           'Partner-reviewed production product',           1)
on conflict (track_id,key) do update set
  position=excluded.position, title=excluded.title,
  description=excluded.description, proof_label=excluded.proof_label,
  content_version=excluded.content_version;

-- ─── AI & Data Analyst — 13 milestones ──────────────────────────────────────

insert into public.roadmap_milestones(id,track_id,key,position,title,description,proof_label,content_version) values
('31000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','analytics-foundations',   1, 'Analytical thinking and data literacy',  'Turn vague requests into answerable questions, measures, and responsible data decisions.',                                'Business question analysis brief',              1),
('31000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','spreadsheets',            2, 'Spreadsheets for analysis',              'Clean, calculate, summarize, and communicate small datasets with dependable spreadsheet work.',                           'Auditable spreadsheet report',                  1),
('31000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','analyst-sql',             3, 'SQL and relational data',                'Retrieve, combine, aggregate, and validate structured data for real questions.',                                          'SQL analysis notebook',                         1),
('31000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000003','statistics',             4, 'Statistics and probability',             'Reason about variation, relationships, uncertainty, and claims without overstating results.',                             'Statistical decision memo',                     1),
('31000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000003','python-analysis',        5, 'Python for analysis',                    'Use programming fundamentals to make repeatable data work and automate routine analysis.',                                'Reproducible Python analysis',                  1),
('31000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000003','dataframes',             6, 'DataFrames and data preparation',        'Reshape, join, clean, validate, and document datasets before analysis.',                                                 'Cleaned dataset with quality report',           1),
('31000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000003','exploratory-analysis',   7, 'Exploratory data analysis',              'Find useful patterns, anomalies, segments, and limitations through disciplined exploration.',                             'Exploratory analysis report',                   1),
('31000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000003','visual-story',           8, 'Visualization and data storytelling',    'Choose honest visual encodings and explain insights for a specific audience and decision.',                              'Decision-ready visual story',                   1),
('31000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000003','bi-dashboards',          9, 'Dashboards and business intelligence',   'Design trustworthy metrics, data models, filters, and refreshable reporting experiences.',                                'Interactive KPI dashboard',                     1),
('31000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000003','experiments-forecasting',10, 'Experiments and forecasting',           'Evaluate interventions and time-based patterns using methods appropriate to the available data.',                        'Experiment or forecast evaluation',             1),
('31000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000003','data-workflows',         11, 'Data workflows and reproducibility',     'Move from one-off files to documented, versioned, scheduled, and testable analysis workflows.',                          'Versioned analytics pipeline',                  1),
('31000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000003','applied-ai',             12, 'Responsible applied AI',                 'Use predictive and generative systems as evaluated tools, not unexplained sources of truth.',                            'Evaluated AI-assisted analysis',                1),
('31000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000003','analyst-capstone',       13, 'Analytics portfolio capstone',           'Answer a real stakeholder question from raw data through recommendation and reproducible evidence.',                    'Partner-reviewed analytics case study',         1)
on conflict (track_id,key) do update set
  position=excluded.position, title=excluded.title,
  description=excluded.description, proof_label=excluded.proof_label,
  content_version=excluded.content_version;

-- ─── Missions ────────────────────────────────────────────────────────────────

insert into public.mission_definitions(id,milestone_id,key,version,title,brief,rubric) values
('12000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000003','responsive-profile-card',1,'Responsive Profile Card',
  '{"goal":"Build an accessible responsive learner card"}',
  '{"semantic":30,"responsive":30,"accessibility":25,"explanation":15}')
on conflict do nothing;

-- ─── Competencies ─────────────────────────────────────────────────────────────

insert into public.competencies(id,key,label,description) values
('13000000-0000-0000-0000-000000000001','semantic-html',          'Semantic HTML',          'Uses meaningful document structure.'),
('13000000-0000-0000-0000-000000000002','responsive-css',         'Responsive CSS',         'Maintains usable layout across supported widths.'),
('13000000-0000-0000-0000-000000000003','accessible-structure',   'Accessible structure',   'Provides labels, focus, contrast, and keyboard access.'),
('13000000-0000-0000-0000-000000000004','javascript-foundations', 'JavaScript foundations', 'Uses JavaScript data, functions, events, and DOM APIs.'),
('13000000-0000-0000-0000-000000000005','deployment-history',     'Deployment history',     'Publishes work with inspectable project history.')
on conflict do nothing;

-- ─── Opportunities ───────────────────────────────────────────────────────────

insert into public.opportunities(id,title,organization,type,location,deadline,source_url,status,last_verified_at,data_origin) values
('14000000-0000-0000-0000-000000000001','Junior Frontend Build Challenge', 'Lan Pya Pilot Partner',   'Challenge',   'Remote · Myanmar',  '2026-08-20','https://example.com/frontend-challenge',    'published','2026-08-11T03:00:00Z','seeded_demo'),
('14000000-0000-0000-0000-000000000002','Frontend Engineering Internship', 'Myanmar Product Studio',  'Internship',  'Yangon · Hybrid',   '2026-08-29','https://example.com/frontend-internship',   'published','2026-08-11T03:00:00Z','seeded_demo'),
('14000000-0000-0000-0000-000000000003','Digital Skills Scholarship',      'Future Skills Myanmar',   'Scholarship', 'Online',            '2026-09-12','https://example.com/digital-scholarship',   'published','2026-08-11T03:00:00Z','seeded_demo')
on conflict do nothing;

insert into public.opportunity_requirements(opportunity_id,competency_id,label,requirement_type) values
('14000000-0000-0000-0000-000000000001','13000000-0000-0000-0000-000000000001','Semantic HTML',          'required'),
('14000000-0000-0000-0000-000000000001','13000000-0000-0000-0000-000000000002','Responsive CSS',         'required'),
('14000000-0000-0000-0000-000000000002','13000000-0000-0000-0000-000000000001','Semantic HTML',          'required'),
('14000000-0000-0000-0000-000000000002','13000000-0000-0000-0000-000000000002','Responsive CSS',         'required'),
('14000000-0000-0000-0000-000000000002','13000000-0000-0000-0000-000000000004','JavaScript foundations', 'required'),
('14000000-0000-0000-0000-000000000002','13000000-0000-0000-0000-000000000005','Deployment history',     'required'),
('14000000-0000-0000-0000-000000000003',null,                                 'Current university enrollment','unknown')
on conflict do nothing;
