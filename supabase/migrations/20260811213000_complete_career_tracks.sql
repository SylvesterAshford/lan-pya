-- Complete, original Lan Pya curricula for the three approved digital-STEM paths.
-- roadmap.sh was used only as a coverage reference; this content is independently authored.

update public.career_tracks
set title = 'Frontend Developer',
    description = 'Build accessible, responsive, production-quality web interfaces.',
    version = 2
where key = 'frontend-developer';

update public.roadmap_milestones m
set key = v.key,
    title = v.title,
    description = v.description,
    proof_label = v.proof_label,
    content_version = 2
from (values
  (1,'orientation','Web foundations and tools','Understand how the web works and set up a dependable development environment.','Environment and web concepts check'),
  (2,'semantic-html','Semantic HTML and forms','Structure meaningful pages that remain usable with assistive technology.','Accessible profile page'),
  (3,'responsive-css','CSS and responsive layout','Build clear interfaces that adapt from small phones to large screens.','Responsive profile card'),
  (4,'javascript','JavaScript programming','Use the language fundamentals that power browser interaction and application logic.','Interactive opportunity tracker'),
  (5,'git-collaboration','Git and collaboration','Track changes, collaborate safely, and explain the history of a project.','Reviewed repository workflow'),
  (6,'async-web-apis','Async JavaScript and web APIs','Connect interfaces to real data and handle slow or failed network states.','Resilient data explorer'),
  (7,'typescript-tooling','TypeScript and frontend tooling','Make larger projects safer, consistent, and repeatable to build.','Typed application refactor')
) as v(position,key,title,description,proof_label), public.career_tracks t
where t.id = m.track_id and t.key = 'frontend-developer' and m.position = v.position;

insert into public.roadmap_milestones(id,track_id,key,position,title,description,proof_label,content_version)
select v.id,t.id,v.key,v.position,v.title,v.description,v.proof_label,2
from public.career_tracks t
cross join (values
  ('11000000-0000-0000-0000-000000000008'::uuid,'component-framework',8,'Component architecture','Build reusable interfaces with a modern component framework and design system thinking.','Component-based product interface'),
  ('11000000-0000-0000-0000-000000000009'::uuid,'application-data',9,'Routing, state and application data','Coordinate navigation, shared state, server data, authentication, and real-time updates.','Authenticated multi-page application'),
  ('11000000-0000-0000-0000-000000000010'::uuid,'frontend-quality',10,'Testing, accessibility and performance','Ship interfaces that are testable, inclusive, fast, and observable.','Audited production interface'),
  ('11000000-0000-0000-0000-000000000011'::uuid,'modern-delivery',11,'Rendering and production delivery','Choose suitable rendering, security, discoverability, and offline strategies.','Production-ready progressive web app'),
  ('11000000-0000-0000-0000-000000000012'::uuid,'hiring-capstone',12,'Portfolio and hiring capstone','Combine product judgment, engineering quality, and clear communication in one credible project.','Partner-reviewed frontend capstone')
) as v(id,key,position,title,description,proof_label)
where t.key = 'frontend-developer'
on conflict (track_id,key) do nothing;

insert into public.career_tracks(id,key,title,description,version,data_origin) values
('10000000-0000-0000-0000-000000000002','full-stack-developer','Full-Stack Developer','Build and operate complete products across browser, server, data, and cloud.',1,'seeded_demo'),
('10000000-0000-0000-0000-000000000003','ai-data-analyst','AI & Data Analyst','Turn data into responsible analysis, decisions, dashboards, and evaluated AI workflows.',1,'seeded_demo')
on conflict (key) do update set title=excluded.title,description=excluded.description,version=excluded.version;

insert into public.roadmap_milestones(id,track_id,key,position,title,description,proof_label)
select v.id,t.id,v.key,v.position,v.title,v.description,v.proof_label
from public.career_tracks t
cross join (values
  ('21000000-0000-0000-0000-000000000001'::uuid,'fullstack-foundations',1,'Web and programming foundations','Build a shared mental model for browsers, servers, networks, terminals, and source code.','Client-server concepts check'),
  ('21000000-0000-0000-0000-000000000002'::uuid,'fullstack-frontend',2,'Frontend foundations','Create semantic, responsive, and interactive browser interfaces.','Responsive interactive website'),
  ('21000000-0000-0000-0000-000000000003'::uuid,'fullstack-tooling',3,'TypeScript and development workflow','Use typed code, packages, branches, automation, and repeatable builds.','Typed collaborative repository'),
  ('21000000-0000-0000-0000-000000000004'::uuid,'fullstack-ui',4,'Frontend application architecture','Build component-driven applications with routing, state, and server data.','Frontend product dashboard'),
  ('21000000-0000-0000-0000-000000000005'::uuid,'server-programming',5,'Server-side programming','Create server processes, business logic, configuration, and dependable error handling.','Node.js service'),
  ('21000000-0000-0000-0000-000000000006'::uuid,'api-design',6,'HTTP and API design','Design stable interfaces between clients, services, and external systems.','Documented production API'),
  ('21000000-0000-0000-0000-000000000007'::uuid,'relational-data',7,'Relational data and SQL','Model durable business data and query it correctly and efficiently.','Normalized application database'),
  ('21000000-0000-0000-0000-000000000008'::uuid,'data-systems',8,'Caching, documents and search','Choose non-relational tools only when application requirements justify them.','Measured data-system extension'),
  ('21000000-0000-0000-0000-000000000009'::uuid,'identity-security',9,'Identity and application security','Protect accounts, data, sessions, and privileged operations across the stack.','Security-reviewed authenticated app'),
  ('21000000-0000-0000-0000-000000000010'::uuid,'backend-quality',10,'Backend architecture and quality','Keep business logic maintainable with clear boundaries and automated verification.','Tested service architecture'),
  ('21000000-0000-0000-0000-000000000011'::uuid,'system-integration',11,'End-to-end product integration','Connect UI, API, database, files, email, and external services into one reliable product.','Integrated team application'),
  ('21000000-0000-0000-0000-000000000012'::uuid,'delivery-cloud',12,'Containers, delivery and cloud','Package, deploy, configure, and update an application safely.','Automated staging deployment'),
  ('21000000-0000-0000-0000-000000000013'::uuid,'reliability-scale',13,'Observability, performance and scale','Measure a running system and improve bottlenecks before adding complexity.','Measured reliability improvement'),
  ('21000000-0000-0000-0000-000000000014'::uuid,'fullstack-capstone',14,'Production full-stack capstone','Own a product from user need through architecture, deployment, operations, and explanation.','Partner-reviewed production product')
) as v(id,key,position,title,description,proof_label)
where t.key = 'full-stack-developer'
on conflict (track_id,key) do nothing;

insert into public.roadmap_milestones(id,track_id,key,position,title,description,proof_label)
select v.id,t.id,v.key,v.position,v.title,v.description,v.proof_label
from public.career_tracks t
cross join (values
  ('31000000-0000-0000-0000-000000000001'::uuid,'analytics-foundations',1,'Analytical thinking and data literacy','Turn vague requests into answerable questions, measures, and responsible data decisions.','Business question analysis brief'),
  ('31000000-0000-0000-0000-000000000002'::uuid,'spreadsheets',2,'Spreadsheets for analysis','Clean, calculate, summarize, and communicate small datasets with dependable spreadsheet work.','Auditable spreadsheet report'),
  ('31000000-0000-0000-0000-000000000003'::uuid,'analyst-sql',3,'SQL and relational data','Retrieve, combine, aggregate, and validate structured data for real questions.','SQL analysis notebook'),
  ('31000000-0000-0000-0000-000000000004'::uuid,'statistics',4,'Statistics and probability','Reason about variation, relationships, uncertainty, and claims without overstating results.','Statistical decision memo'),
  ('31000000-0000-0000-0000-000000000005'::uuid,'python-analysis',5,'Python for analysis','Use programming fundamentals to make repeatable data work and automate routine analysis.','Reproducible Python analysis'),
  ('31000000-0000-0000-0000-000000000006'::uuid,'dataframes',6,'DataFrames and data preparation','Reshape, join, clean, validate, and document datasets before analysis.','Cleaned dataset with quality report'),
  ('31000000-0000-0000-0000-000000000007'::uuid,'exploratory-analysis',7,'Exploratory data analysis','Find useful patterns, anomalies, segments, and limitations through disciplined exploration.','Exploratory analysis report'),
  ('31000000-0000-0000-0000-000000000008'::uuid,'visual-story',8,'Visualization and data storytelling','Choose honest visual encodings and explain insights for a specific audience and decision.','Decision-ready visual story'),
  ('31000000-0000-0000-0000-000000000009'::uuid,'bi-dashboards',9,'Dashboards and business intelligence','Design trustworthy metrics, data models, filters, and refreshable reporting experiences.','Interactive KPI dashboard'),
  ('31000000-0000-0000-0000-000000000010'::uuid,'experiments-forecasting',10,'Experiments and forecasting','Evaluate interventions and time-based patterns using methods appropriate to the available data.','Experiment or forecast evaluation'),
  ('31000000-0000-0000-0000-000000000011'::uuid,'data-workflows',11,'Data workflows and reproducibility','Move from one-off files to documented, versioned, scheduled, and testable analysis workflows.','Versioned analytics pipeline'),
  ('31000000-0000-0000-0000-000000000012'::uuid,'applied-ai',12,'Responsible applied AI','Use predictive and generative systems as evaluated tools, not unexplained sources of truth.','Evaluated AI-assisted analysis'),
  ('31000000-0000-0000-0000-000000000013'::uuid,'analyst-capstone',13,'Analytics portfolio capstone','Answer a real stakeholder question from raw data through recommendation and reproducible evidence.','Partner-reviewed analytics case study')
) as v(id,key,position,title,description,proof_label)
where t.key = 'ai-data-analyst'
on conflict (track_id,key) do nothing;

create or replace function public.get_roadmap(p_track_key text)
returns jsonb language sql stable security definer set search_path=public as $$
select coalesce(jsonb_agg(jsonb_build_object(
  'key',m.key,
  'order',m.position,
  'title',m.title,
  'description',m.description,
  'proof',m.proof_label,
  'status',coalesce(p.status,case when m.position=1 then 'next' else 'upcoming' end)
) order by m.position),'[]'::jsonb)
from public.roadmap_milestones m
join public.career_tracks t on t.id=m.track_id
left join public.milestone_progress p on p.milestone_id=m.id and p.user_id=auth.uid()
where t.key=p_track_key and t.active;
$$;

create or replace function public.get_frontend_roadmap()
returns jsonb language sql stable security definer set search_path=public as $$
select public.get_roadmap('frontend-developer');
$$;

create or replace function public.get_today_dashboard()
returns jsonb language sql stable security definer set search_path=public as $$
select jsonb_build_object(
  'progress_percent',coalesce((
    select round(100.0*count(*) filter(where p.status='complete')/nullif(count(m.id),0))
    from public.roadmap_milestones m
    join public.career_tracks t on t.id=m.track_id and t.key='frontend-developer'
    left join public.milestone_progress p on p.milestone_id=m.id and p.user_id=auth.uid()
  ),0),
  'verified_count',(select count(*) from public.proof_items where user_id=auth.uid() and state='active' and data_origin='live'),
  'streak_days',0);
$$;

grant execute on function public.get_roadmap(text) to authenticated;
