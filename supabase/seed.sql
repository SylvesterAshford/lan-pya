insert into public.career_tracks(id,key,title,description,version,data_origin) values
('10000000-0000-0000-0000-000000000001','frontend-developer','Frontend Developer','A proof-based path from web foundations to a hiring capstone.',1,'seeded_demo') on conflict do nothing;

insert into public.roadmap_milestones(id,track_id,key,position,title,description,proof_label) values
('11000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','orientation',1,'Orientation and tools','Browser tools, editor, files, and web basics','Environment and terminology check'),
('11000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','semantic-html',2,'Semantic HTML','Structure, forms, and accessible content','Student profile page'),
('11000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','responsive-css',3,'CSS and responsive layout','Cascade, spacing, flex/grid, and mobile-first design','Responsive profile card'),
('11000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','javascript',4,'JavaScript foundations','Data, functions, events, and the DOM','Opportunity tracker'),
('11000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','git-deploy',5,'Git, GitHub and deployment','Commits, repositories, README, and deployment','Published project with history'),
('11000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','api-quality',6,'APIs, accessibility and quality','Fetch, errors, keyboard access, and performance','Resilient opportunity explorer'),
('11000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001','hiring-capstone',7,'Hiring capstone','Integration, decisions, explanation, and iteration','Partner-approved frontend brief') on conflict do nothing;

insert into public.mission_definitions(id,milestone_id,key,version,title,brief,rubric) values
('12000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000003','responsive-profile-card',1,'Responsive Profile Card','{"goal":"Build an accessible responsive learner card"}','{"semantic":30,"responsive":30,"accessibility":25,"explanation":15}') on conflict do nothing;

insert into public.competencies(id,key,label,description) values
('13000000-0000-0000-0000-000000000001','semantic-html','Semantic HTML','Uses meaningful document structure.'),
('13000000-0000-0000-0000-000000000002','responsive-css','Responsive CSS','Maintains usable layout across supported widths.'),
('13000000-0000-0000-0000-000000000003','accessible-structure','Accessible structure','Provides labels, focus, contrast, and keyboard access.'),
('13000000-0000-0000-0000-000000000004','javascript-foundations','JavaScript foundations','Uses JavaScript data, functions, events, and DOM APIs.'),
('13000000-0000-0000-0000-000000000005','deployment-history','Deployment history','Publishes work with inspectable project history.') on conflict do nothing;

insert into public.opportunities(id,title,organization,type,location,deadline,source_url,status,last_verified_at,data_origin) values
('14000000-0000-0000-0000-000000000001','Junior Frontend Build Challenge','Lan Pya Pilot Partner','Challenge','Remote · Myanmar','2026-08-20','https://example.com/frontend-challenge','published','2026-08-11T03:00:00Z','seeded_demo'),
('14000000-0000-0000-0000-000000000002','Frontend Engineering Internship','Myanmar Product Studio','Internship','Yangon · Hybrid','2026-08-29','https://example.com/frontend-internship','published','2026-08-11T03:00:00Z','seeded_demo'),
('14000000-0000-0000-0000-000000000003','Digital Skills Scholarship','Future Skills Myanmar','Scholarship','Online','2026-09-12','https://example.com/digital-scholarship','published','2026-08-11T03:00:00Z','seeded_demo') on conflict do nothing;

insert into public.opportunity_requirements(opportunity_id,competency_id,label,requirement_type) values
('14000000-0000-0000-0000-000000000001','13000000-0000-0000-0000-000000000001','Semantic HTML','required'),
('14000000-0000-0000-0000-000000000001','13000000-0000-0000-0000-000000000002','Responsive CSS','required'),
('14000000-0000-0000-0000-000000000002','13000000-0000-0000-0000-000000000001','Semantic HTML','required'),
('14000000-0000-0000-0000-000000000002','13000000-0000-0000-0000-000000000002','Responsive CSS','required'),
('14000000-0000-0000-0000-000000000002','13000000-0000-0000-0000-000000000004','JavaScript foundations','required'),
('14000000-0000-0000-0000-000000000002','13000000-0000-0000-0000-000000000005','Deployment history','required'),
('14000000-0000-0000-0000-000000000003',null,'Current university enrollment','unknown');
