UPDATE journal_papers SET journal_en = 'Journal of Agricultural Engineering, 72(2), 46?61'
WHERE journal = '農業工程學報, 72(2), 46-61' AND NULLIF(TRIM(journal_en), '') IS NULL;

UPDATE conference_papers SET conference_en = '2026 Forum on Innovative Education and Teaching Practice Research'
WHERE conference = '2026 創新教育與教學實踐研究論壇' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '2026 Ming Chuan University International Academic Conference'
WHERE conference = '銘傳大學 2026 國際學術研討會' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '2025 Agricultural Engineering Conference'
WHERE conference = '114 年農業工程研討會' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '27th Hydraulic Engineering Conference'
WHERE conference = '第二十七屆水利工程研討會' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '42nd National Academic Conference of the Chinese Society of Mechanical Engineers'
WHERE conference = '中國機械工程學會第 42 屆全國學術研討會' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '2025 Forum on Innovative Education and Teaching Practice Research'
WHERE conference = '2025 創新教育與教學實踐研究論壇' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '2024 Agricultural Engineering Conference'
WHERE conference = '113 年農業工程研討會' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '2024 Forum on Innovative Education and Teaching Practice Research'
WHERE conference = '2024 創新教育與教學實踐研究論壇' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '47th National Congress on Theoretical and Applied Mechanics'
WHERE conference = '中華民國力學學會第四十七屆全國力學會議' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '26th Hydraulic Engineering Conference'
WHERE conference = '第二十六屆水利工程研討會' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '2023 Forum on Innovative Education and Teaching Practice Research'
WHERE conference = '2023 創新教育與教學實踐研究論壇' AND NULLIF(TRIM(conference_en), '') IS NULL;
UPDATE conference_papers SET conference_en = '2021 Annual Meeting of the Taiwan Association for Groundwater Resources and Hydrogeology'
WHERE conference = '2021 臺灣地下水資源暨水文地質學會年會' AND NULLIF(TRIM(conference_en), '') IS NULL;

UPDATE patents SET inventor_or_owner_en = 'Cheng-Chia Huang et al. / Feng Chia University'
WHERE inventor_or_owner = '黃振家等／逢甲大學' AND NULLIF(TRIM(inventor_or_owner_en), '') IS NULL;
UPDATE patents SET inventor_or_owner_en = 'Cheng-Chia Huang / Feng Chia University'
WHERE inventor_or_owner = '黃振家／逢甲大學' AND NULLIF(TRIM(inventor_or_owner_en), '') IS NULL;
UPDATE patents SET inventor_or_owner_en = 'Joint invention'
WHERE inventor_or_owner = '共同發明' AND NULLIF(TRIM(inventor_or_owner_en), '') IS NULL;

UPDATE projects SET period_en = '2025, second round'
WHERE period = '114 年第 2 梯次' AND NULLIF(TRIM(period_en), '') IS NULL;
UPDATE projects SET period_en = '2026'
WHERE period = '115 年度' AND NULLIF(TRIM(period_en), '') IS NULL;

UPDATE projects SET organization_en = 'Ministry of Education / National Research Council (CNR), Italy'
WHERE organization = '教育部／義大利 CNR' AND (NULLIF(TRIM(organization_en), '') IS NULL OR organization_en = 'Ministry of Education／義大利 CNR');
UPDATE projects SET organization_en = 'Ministry of Education / Chiang Mai University, Thailand'
WHERE organization = '教育部／泰國清邁大學' AND (NULLIF(TRIM(organization_en), '') IS NULL OR organization_en = 'Ministry of Education／泰國清邁大學');
UPDATE projects SET organization_en = 'Ministry of Education / University of Tsukuba, Japan'
WHERE organization = '教育部／日本筑波大學' AND (NULLIF(TRIM(organization_en), '') IS NULL OR organization_en = 'Ministry of Education／日本筑波大學');

UPDATE international_items SET description_en = 'Technical exchange with the U.S. Bureau of Reclamation on numerical modeling of reservoirs and rivers and SRH-related methods.'
WHERE description = '與美國墾務局進行水庫與河川數值模式及SRH相關技術交流。' AND (NULLIF(TRIM(description_en), '') IS NULL OR description_en = '與美國墾務局進行水庫與河川數值模式及SRH相關技術交流。');
