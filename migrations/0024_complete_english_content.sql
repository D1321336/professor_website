UPDATE journal_papers SET title_en = CASE id WHEN 2 THEN 'Reservoir Sediment Bypass Tunnel Operation Strategy and Benefit Assessment' ELSE COALESCE(NULLIF(title_en, ''), title) END WHERE title_en IS NULL OR title_en = '';
UPDATE conference_papers SET title_en = CASE id
  WHEN 4 THEN 'Innovative Teaching of Fluid Mechanics Experiments Integrated with Small Hydropower Generation'
  WHEN 5 THEN 'A Study of Applying a Two-Stage Numerical Model to Sediment Release Operations'
  WHEN 13 THEN 'Practical Application of Project-Based Learning with HEC-RAS'
  WHEN 14 THEN 'Post-Pandemic Classroom Transformation: Fun Fluid Mechanics 2.0 for Learning Fluid Mechanics'
  WHEN 19 THEN 'Analysis of Flow Fields and Scour Potential around Different Bridge-Pier Types Using Particle Image Velocimetry'
  WHEN 20 THEN 'Integrating CDIO into Fluid Mechanics Teaching through Everyday Applications'
  WHEN 23 THEN 'Simulation Study of Optimizing Reservoir Sediment Release Efficiency Using a Diversion Channel'
  WHEN 24 THEN 'Assessment of Urban River Water Quality before and after Water Environment Improvement'
  WHEN 25 THEN 'Efficiency Assessment of Small Hydropower Generation Applied to Urban Rivers'
  WHEN 26 THEN 'A CDIO Teaching Model for Fluid Mechanics Using Problem-Based Learning'
  WHEN 28 THEN 'Analysis of Groundwater Levels in Plain Regions Integrating Numerical Models, Wavelet Analysis, and Machine Learning'
  ELSE COALESCE(NULLIF(title_en, ''), title) END WHERE title_en IS NULL OR title_en = '';
UPDATE projects SET organization_en = CASE id WHEN 15 THEN 'Ministry of Education / National Research Council of Italy (CNR)' WHEN 16 THEN 'Ministry of Education / Chiang Mai University, Thailand' WHEN 17 THEN 'Ministry of Education / University of Tsukuba, Japan' WHEN 18 THEN 'Ministry of Education / Chiang Mai University, Thailand' ELSE COALESCE(NULLIF(organization_en, ''), organization) END WHERE organization_en IS NULL OR organization_en = '';
UPDATE experience_items SET text_en = CASE id WHEN 4 THEN 'Chairing conference sessions, including the 2024 Agricultural Engineering Conference and the Engineering Forum of the 42nd National Conference of the Chinese Society of Mechanical Engineers, and giving invited talks at University of Tsukuba, National Chung Hsing University, National Taipei University of Technology, Chung Yuan Christian University, National Sun Yat-sen University, the Water Resources Agency, and other institutions.' ELSE COALESCE(NULLIF(text_en, ''), text) END WHERE text_en IS NULL OR text_en = '';
UPDATE international_items SET description_en = 'Technical exchange with the U.S. Bureau of Reclamation on reservoir and river numerical modeling and SRH.' WHERE institution = '美國墾務局' AND (description_en IS NULL OR description_en = '');
UPDATE international_items SET description_en = 'Participated in research on the introduction and application of Taiwan–U.S. water resources technology.' WHERE is_note = 1 AND (description_en IS NULL OR description_en = '');
UPDATE international_conferences SET name_en = 'International conferences on reservoir sediment bypass tunnels' WHERE name = '水庫沉砂繞道相關國際會議' AND (name_en IS NULL OR name_en = '');
UPDATE lab_activities SET title_en = CASE id WHEN 1 THEN 'Hydraulic Model Experiments' WHEN 2 THEN 'Field Investigation and Measurement' WHEN 3 THEN 'Conferences and Research Presentations' WHEN 4 THEN 'International Exchange' WHEN 5 THEN 'Water Disaster Prevention Outreach' WHEN 6 THEN 'Student Research Outcomes' ELSE title END WHERE title_en IS NULL OR title_en = '';
