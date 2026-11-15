UPDATE projects
SET organization_en = CASE
  WHEN organization = '國科會' THEN 'National Science and Technology Council'
  WHEN organization = '國科會產學合作' THEN 'NSTC Industry-Academia Cooperation'
  WHEN organization = '水利署水利規劃分署' THEN 'Water Resources Agency, Water Resources Planning Branch'
  WHEN organization = '農村水保署' THEN 'Rural Development and Soil and Water Conservation Agency'
  WHEN organization = '農村水保署南投分署' THEN 'Rural Development and Soil and Water Conservation Agency, Nantou Branch'
  WHEN organization = '農村水保署臺南分署' THEN 'Rural Development and Soil and Water Conservation Agency, Tainan Branch'
  WHEN organization = '教育部' THEN 'Ministry of Education'
  WHEN organization = '清水岩生態文創協會' THEN 'Qingshuiyan Ecological and Cultural Association'
  WHEN organization = '富雨洋傘' THEN 'Fu-Yu Umbrella'
  WHEN organization LIKE '教育部／%' THEN replace(organization, '教育部', 'Ministry of Education')
  ELSE COALESCE(NULLIF(organization_en, ''), organization)
END
WHERE organization IS NOT NULL AND organization <> '';
