import db from './db.js'

db.serialize(() => {
  const navigationItems = [
    ['Home', 'home', 1, 1],
    ['Research', 'research', 2, 1],
    ['Publications', 'publications', 3, 1],
    ['Projects', 'projects', 4, 1],
    ['Experience', 'experience', 5, 1],
    ['International', 'international', 6, 1],
    ['Lab', 'lab', 7, 1],
    ['Contact', 'contact', 8, 1],
  ]
  const navigationStmt = db.prepare(`
    INSERT INTO navigation_items (name, path, sort_order, is_visible)
    VALUES (?, ?, ?, ?)
  `)
  navigationItems.forEach((item) => navigationStmt.run(item))
  navigationStmt.finalize()

  const siteSettings = [
    ['department_name', 'Department of Water Resources Engineering and Conservation'],
    ['footer_name', 'CHENG-CHIA HUANG'],
    ['brand_name', 'STARLAB'],
  ]
  const settingStmt = db.prepare(`
    INSERT INTO site_settings (key, value) VALUES (?, ?)
  `)
  siteSettings.forEach((item) => settingStmt.run(item))
  settingStmt.finalize()

  const contentGroups = [
    ['publications', 'journal', '期刊論文', '期刊論文', null, 1],
    ['publications', 'conference', '研討會論文', '研討會論文', null, 2],
    ['publications', 'other', '專利與其他著作', '專利與其他著作', null, 3],
    ['experience', 'professional_service', '專業服務', '專業服務', null, 1],
    ['experience', 'teaching', '教學與人才培育', '教學與人才培育', null, 2],
    ['experience', 'training', '專業訓練', '專業訓練', null, 3],
    ['international', 'visit_exchange', '國際訪問與技術交流', '訪問交流', null, 1],
    ['international', 'approved_cooperation', '已核定國際合作', '核定合作', null, 2],
    ['international', 'developing_cooperation', '洽談或發展中的合作', '發展合作', null, 3],
    ['lab', 'topics', '主要研究主題', '研究主題', 'RESEARCH TOPICS', 1],
    ['lab', 'members', '實驗室成員', '實驗室成員', 'LAB MEMBERS', 2],
    ['lab', 'activities', '實驗室活動', '實驗室活動', 'FIELD & LAB LOG', 3],
  ]
  const groupStmt = db.prepare(`
    INSERT INTO content_groups (section, key, title, short_title, label, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  contentGroups.forEach((item) => groupStmt.run(item))
  groupStmt.finalize()

  // 教授基本資料
  db.run(
    `
    INSERT INTO profile (
      name_zh,
      name_en,
      email,
      address,
      short_bio,
      full_bio,
      photo
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      '黃振家',
      'Cheng-Chia Huang',
      'cchiahuang@fcu.edu.tw', // email
      '逢甲大學 臺中市西屯區文華路100號', // address
      '黃振家博士現任逢甲大學水利工程與資源保育學系副教授，研究聚焦水庫與河川泥砂運移、水庫防淤排砂、水工模型試驗、數值模擬及現地監測，並結合人工智慧、影像分析與數位孿生技術，發展水資源管理、災害預警及工程決策支援方法。', // short_bio
      `黃振家博士長期投入水利工程、水資源、河川與水庫泥砂運移、防災預警及永續發展工作。研究方法涵蓋水工模型試驗、數值模擬、現地監測、影像分析、人工智慧及數位孿生。
2009至2018年間，參與國立臺灣大學水工試驗所37件研究及工程計畫，累積水工模型、泥砂運移、現地監測、數值模擬及國際技術合作經驗。近年進一步結合資料科學與智慧化技術，應用於泥砂濃度預測、都市淹水辨識、災害預警及流域決策支援。
除研究與教學外，現兼任逢甲大學永續處永續組組長，參與校級永續發展、跨單位協調及國際交流工作。`, // full_bio
      null, // photo
    ],
    function (err) {
      if (err) {
        console.error('Error inserting profile:', err.message)
        return
      }

      console.log('Profile inserted successfully.')
    },
  )

  // 教授目前職稱
  const positions = [
    ['副教授', '逢甲大學', '水利工程與資源保育學系', 1],
    ['永續組組長', '逢甲大學', '永續處', 2],
  ]

  const positionStmt = db.prepare(`
  INSERT INTO positions (
    title,
    organization,
    department,
    sort_order
  )
  VALUES (?, ?, ?, ?)
`)

  positions.forEach((position) => {
    positionStmt.run(position)
  })

  positionStmt.finalize((err) => {
    if (err) {
      console.error('Error inserting positions:', err.message)
      return
    }

    console.log('Positions inserted successfully.')
  })

  // 首頁研究領域
  const researchAreas = [
    ['水庫與河川泥砂運移', 1],
    ['水庫淤積與防淤排砂', 2],
    ['水工模型試驗', 3],
    ['水文、水理與泥砂數值模擬', 4],
    ['現地監測', 5],
    ['人工智慧與影像分析', 6],
    ['洪水、泥砂與都市淹水預警', 7],
    ['流域數位孿生', 8],
    ['氣候韌性與防災管理', 9],
  ]

  const researchAreaStmt = db.prepare(`
  INSERT INTO research_areas (
    title,
    sort_order
  )
  VALUES (?, ?)
`)

  researchAreas.forEach((area) => {
    researchAreaStmt.run(area)
  })

  researchAreaStmt.finalize((err) => {
    if (err) {
      console.error('Error inserting research areas:', err.message)
      return
    }

    console.log('Research areas inserted successfully.')
  })

  // 實驗室基本資料
  db.run(
    `
  INSERT INTO labs (
    name,
    description,
    photo
  )
  VALUES (?, ?, ?)
  `,
    [
      'STARLAB',
      `STARLAB 聚焦水庫與河川泥砂運移、水工模型試驗、數值模擬、現地監測、人工智慧及數位孿生，並將研究成果應用於水庫防淤排砂、洪水泥砂預警、都市淹水辨識及流域決策支援。`,
      null,
    ],
    function (err) {
      if (err) {
        console.error('Error inserting lab:', err.message)
        return
      }

      console.log('Lab inserted successfully.')
    },
  )

  // About－研究興趣
  const researchInterests = [
    ['水庫淤積、防淤及排砂操作', 1],
    ['河川泥砂運移與河道沖淤', 2],
    ['水工模型試驗與智慧量測', 3],
    ['數值模式與現地資料驗證', 4],
    ['人工智慧與影像辨識', 5],
    ['洪水、泥砂與淹水預警', 6],
    ['流域數位孿生與決策支援', 7],
    ['都市防洪與氣候韌性', 8],
    ['水利防災科普與人才培育', 9],
  ]

  const researchInterestStmt = db.prepare(`
  INSERT INTO research_interests (
    title,
    sort_order
  )
  VALUES (?, ?)
`)

  researchInterests.forEach((item) => {
    researchInterestStmt.run(item)
  })

  researchInterestStmt.finalize()

  // Research
  const research = [
    [
      '水庫與河川水砂治理',
      '研究水庫淤積、異重流、河道沖淤及泥砂運移機制，探討防淤隧道、排砂操作及水庫庫容維持策略。研究方法包括水工模型試驗、數值模擬、現地監測及工程資料分析。',
      1,
    ],
    [
      '水工模型與智慧量測',
      '運用水工模型分析水流、泥砂、局部沖刷及排水效能，並導入影像分析、自動量測及即時資料處理方法，提升試驗資料的完整性與工程應用價值。',
      2,
    ],
    [
      '人工智慧與災害預警',
      '結合機器學習、深度學習、影像辨識及物聯網技術，發展泥砂濃度預測、洪水泥砂聯合預警及都市淹水辨識方法。',
      3,
    ],
    [
      '流域數位孿生',
      '整合水文、水理、泥砂模式及現地監測資料，建置流域數位孿生與決策支援工具，應用於流域治理、災害預警及水資源管理。',
      4,
    ],
    [
      '都市防洪與氣候韌性',
      '整合土地使用、排水規劃、防洪工程及氣候調適策略，評估都市淹水風險並發展跨領域治理方法。',
      5,
    ],
  ]

  const researchStmt = db.prepare(`
  INSERT INTO research (
    title,
    description,
    sort_order
  )
  VALUES (?, ?, ?)
`)

  research.forEach((item) => {
    researchStmt.run(item)
  })

  researchStmt.finalize()

  // 研究成果摘要
  const researchSummaries = [
    ['2021 至 2026 年列有 16 篇期刊論文，其中 14 篇 SCIE 及 2 篇 EI。', 1],
    ['另列有 28 篇研討會論文及 1 件產業個案教材。', 2],
    ['2021 年後取得 3 件發明專利；另有 1 件早期共同發明專利。', 3],
    ['主持 18 件研究、產學、教學及國際人才培育計畫。', 4],
    ['共同主持 10 件計畫，協同主持 2 件計畫。', 5],
    ['指導 6 件國科會大專學生研究計畫。', 6],
    ['2009 至 2018 年間參與 37 件臺大水工試驗所研究及工程計畫。', 7],
  ]

  const researchSummaryStmt = db.prepare(`
  INSERT INTO research_summaries (
    text,
    sort_order
  )
  VALUES (?, ?)
`)

  researchSummaries.forEach((item) => {
    researchSummaryStmt.run(item)
  })

  researchSummaryStmt.finalize()

  // 期刊論文
  const journalPapers = [
    [
      2026,
      'Cheng-Chia Huang and Fong-Zuo Lee',
      'A comprehensive study of turbid water consolidation and influence of outlet elevation on reservoir sediment management.',
      'Advances in Water Resources, 214, 105354',
      null,
      1,
    ],
    [
      2026,
      '王政為、張恩齊、黃振家*',
      '水庫防淤隧道之操作策略與效益評估',
      '農業工程學報, 72(2), 46-61',
      null,
      2,
    ],
    [
      2026,
      'Yee Siang Gan, Sze-Teng Liong, and Cheng-Chia Huang*',
      'Using Multiple Advanced Machine Learning Approaches to Enhance Prediction and Early Warning Techniques for River Sediment Concentration in Water Supply during Short-term Typhoon Events.',
      'Taiwan Water Conservancy, 74(1), 62-77',
      null,
      3,
    ],
    [
      2025,
      'Cheng-Chia Huang, Che-Cheng Chang, and Chiao-Ming Chang',
      'Evaluating convolutional neural networks using residual blocks and global average pooling techniques for predicting sediment concentration.',
      'Scientific Reports, 15(1), 35278',
      null,
      4,
    ],
    [
      2025,
      'Chin-Hsien Liao, James C. Y. Guo, and Cheng-Chia Huang*',
      'The runoff flow loading approach for interim stormwater detention design.',
      'Journal of Water and Climate Change, 16(11), 3275-3284',
      null,
      5,
    ],
    [
      2025,
      'Cheng-Chia Huang and Fong-Zuo Lee',
      'Real time response strategy for reservoir storage maintenance and desiltation operations.',
      'Scientific Reports, 15(1), 14983',
      null,
      6,
    ],
    [
      2024,
      'Cheng-Chia Huang*',
      'Navigating Reservoir Deposition Challenges: Evaluation of Reservoir Desilting Strategy Through a 4-Stage Life Cycle Assessment Approach.',
      'Water Resources Management, 38, 3937-3952',
      null,
      7,
    ],
    [
      2024,
      'Cheng-Chia Huang* and Chen-Ling Wang',
      'Enhancing urban flood resilience: interdisciplinary integration of climate adaptation, flood control, and land-use planning from 3PA to 4PA.',
      'Journal of Water and Climate Change, 15(4), 1961-1968',
      null,
      8,
    ],
    [
      2024,
      'Chin-Hsien Liao and Cheng-Chia Huang*',
      'Interdisciplinary integration of land use and drainage planning for urban adaptation under the climate change scenario.',
      'Journal of Water and Climate Change, 15(3), 1155-1171',
      null,
      9,
    ],
    [
      2023,
      'Cheng-Chia Huang*, Che-Cheng Chang, Chiao-Ming Chang, and Ming-Han Tsai',
      'Development of a lightweight convolutional neural network-based visual model for sediment concentration prediction by incorporating the IoT concept.',
      'Journal of Hydroinformatics, 25(6), 2660-2674',
      null,
      10,
    ],
    [
      2023,
      'Cheng-Chia Huang, Hao-Che Ho, Jihn-Sung Lai, and Fong-Zuo Lee',
      'Experimental study with hydraulic modeling of a reservoir desilting operation using a sediment bypass tunnel.',
      'Environmental Earth Sciences, 82(12), 313',
      null,
      11,
    ],
    [
      2023,
      'Hao-Che Ho, Kun-Che Chan, Shu-Hao Chang, and Cheng-Chia Huang*',
      'Three-phase data augmentation for the prediction of sediment flux in mountain basins during typhoon events.',
      'Journal of Hydroinformatics, 25(3), 1054-1071',
      null,
      12,
    ],
    [
      2022,
      'Chia-Ching Hung, Jihn-Sung Lai, and Cheng-Chia Huang*',
      'An efficient and economic desilitation strategy for reservoir sustainable development under the threat of extreme flooding threaten.',
      'Journal of Water and Climate Change, 13(3), 1257-1274',
      null,
      13,
    ],
    [
      2021,
      'Hao-Che Ho, Yen-Ming Chiang, Che-Chi Lin, Hong-Yuan Lee, and Cheng-Chia Huang*',
      'Development of an Interdisciplinary Prediction System Combining Sediment Transport Simulation and Ensemble Method.',
      'Water, 13(18), 2588',
      null,
      14,
    ],
    [
      2021,
      'Bing-Chen Jhong, Hsi-Ting Fang, and Cheng-Chia Huang*',
      'Assessment of Effective Monitoring Sites in a Reservoir Watershed by Support Vector Machine Coupled with Multi-Objective Genetic Algorithm for Sediment Flux Prediction during Typhoons.',
      'Water Resources Management, 35(8), 2387-2408',
      null,
      15,
    ],
    [
      2021,
      'Cheng-Chia Huang, Ming-Jui Chang, Gwo-Fong Lin, Ming-Chang Wu, and Po-Hsiang Wang',
      'Real-time forecasting of suspended sediment concentrations in reservoirs by the optimal integration of multiple machine learning techniques.',
      'Journal of Hydrology: Regional Studies, 34, 100804',
      null,
      16,
    ],
  ]

  const journalStmt = db.prepare(`
  INSERT INTO journal_papers (
    year,
    authors,
    title,
    journal,
    doi_url,
    sort_order
  )
  VALUES (?, ?, ?, ?, ?, ?)
`)

  journalPapers.forEach((paper) => {
    journalStmt.run(paper)
  })

  journalStmt.finalize()

  // 研討會論文
  const conferencePapers = [
    [
      2026,
      null,
      'Evaluating the Sediment Reduction Efficiency of Best Management Practices in A Reservoir Watershed Using the Numerical Model',
      'River Flow 2026, Greece',
      1,
    ],
    [
      2026,
      null,
      'Enhancing Reservoir Desilting Efficiency via Dual-Tunnel Synergistic Operation: A Case Study of Shimen Reservoir',
      'JpGU-AGU Joint Meeting 2026, Japan',
      2,
    ],
    [
      2026,
      null,
      'Numerical Investigation of Dam-Break Flood Propagation and Geomorphic Impacts: A Case Study of the Feitsui Reservoir, Taiwan',
      'JpGU-AGU Joint Meeting 2026, Japan',
      3,
    ],
    [2026, null, '融合小水力發電的流體力學試驗創新教學', '2026 創新教育與教學實踐研究論壇', 4],
    [2026, null, '二階段數值模式應用於排砂操作之研究', '銘傳大學 2026 國際學術研討會', 5],

    [
      2025,
      null,
      'Temporal and Spatial Dynamics of Sediment Settling: Analyzing the Impact of Varying Orifice Heights on Sediment Release Efficiency',
      '114 年農業工程研討會',
      6,
    ],
    [
      2025,
      null,
      'Application of Two-Dimensional Layer-Averaged Model on Sediment Flux Assessment under an Artificial Countermeasure',
      '4th International Workshop on Sediment Bypass Tunnels',
      7,
    ],
    [
      2025,
      null,
      'Integrating mechanical and hydraulic methods to improve desilting efficiency',
      '4th International Workshop on Sediment Bypass Tunnels',
      8,
    ],
    [
      2025,
      null,
      'Utilizing Particle Image Velocimetry to Analyze the Flow Field and Scour Potential around Different Pier Structure Shapes',
      '第二十七屆水利工程研討會',
      9,
    ],
    [
      2025,
      null,
      'Long-term Simulation of River Morphodynamics Under Climate Change Using SRH-2D',
      'AOGS 2025',
      10,
    ],
    [
      2025,
      null,
      'When Water Meets Wallets: Mapping Urban Flood Risk with Hazard and Economic Indicators',
      'ICEO & SI 2025',
      11,
    ],
    [
      2025,
      null,
      'Assessing Levee Overtopping Risks Under Climate Change: A Numerical Investigation of Water Level Variations in the Tamsui River Basin',
      'Japan Geoscience Union Meeting 2025',
      12,
    ],
    [2025, null, 'HEC-RAS 專題導向學習之實務應用', '中國機械工程學會第 42 屆全國學術研討會', 13],
    [
      2025,
      null,
      '疫情後的課堂轉型：聽得懂、學得會、算得出的 Fun 流力 2.0 創新教學模式',
      '2025 創新教育與教學實踐研究論壇',
      14,
    ],

    [
      2024,
      null,
      'Enhancing Reservoir Sustainability: A Joint-Operated Bypass Tunnel Approach for Effective Sediment Management in Reservoir',
      'AGU24',
      15,
    ],
    [
      2024,
      null,
      'Assessing Flood Resilience and Economic Impact in Urban Area: A Three-Dimensional Risk Analysis in Taichung City, Taiwan',
      '19th APRU Multi-Hazards Symposium 2024',
      16,
    ],
    [
      2024,
      null,
      'Development of a Multi-prediction Model to Investigate Sediment Flux in the Reservoir',
      'JpGU 2024',
      17,
    ],
    [
      2024,
      null,
      'Combining the three-dimensional matrix of hazard, vulnerability, and temporal factors for the assessment of spatiotemporal variations in disaster risk',
      'JpGU 2024',
      18,
    ],
    [
      2024,
      null,
      '利用粒子影像測速技術分析不同橋墩型式之周圍流場及沖刷潛勢',
      '113 年農業工程研討會',
      19,
    ],
    [2024, null, '結合 CDIO 實踐於生活中的流體力學教學', '2024 創新教育與教學實踐研究論壇', 20],

    [
      2023,
      null,
      'Assessing Tidal River Channel Affordability and Sediment Dynamics After Reservoir Sediment Back to the Downstream River',
      '2023 ICEO & SI Conference',
      21,
    ],
    [
      2023,
      null,
      'Simulation of River Morphology Change due to Reservoir Desiltitation Operation',
      'EGU General Assembly 2023',
      22,
    ],
    [
      2023,
      null,
      '利用導流渠道優化水庫排砂效率之模擬研究',
      '中華民國力學學會第四十七屆全國力學會議',
      23,
    ],
    [2023, null, '都市河川水質在水環境改善前後之評估分析', '第二十六屆水利工程研討會', 24],
    [2023, null, '小水力發電應用於都市型河川之效率評估', '第二十六屆水利工程研討會', 25],
    [
      2023,
      null,
      '應用問題導向學習於流體力學的 CDIO 教學模式',
      '2023 創新教育與教學實踐研究論壇',
      26,
    ],

    [
      2022,
      null,
      'Estimation of the Reservoir Desiltitation Strategy',
      'Particles in the Americas Conference 2022',
      27,
    ],

    [
      2021,
      null,
      '整合數值模式、小波分析與機器學習的平原地區地下水位分析',
      '2021 臺灣地下水資源暨水文地質學會年會',
      28,
    ],
  ]

  const conferenceStmt = db.prepare(`
  INSERT INTO conference_papers (
    year,
    authors,
    title,
    conference,
    sort_order
  )
  VALUES (?, ?, ?, ?, ?)
`)

  conferencePapers.forEach((paper) => {
    conferenceStmt.run(paper)
  })

  conferenceStmt.finalize()

  // 其他著作
  db.run(
    `
  INSERT INTO other_publications (
    year,
    title,
    description,
    sort_order
  )
  VALUES (?, ?, ?, ?)
  `,
    [2021, '臺灣產業個案教材《水庫醫生》', '佳作', 1],
  )

  // 發明專利
  const patents = [
    [2026, '水質的監測方法與系統', 'I918195', '黃振家等／逢甲大學', 1],
    [2025, '災害預警方法及災害預警系統', 'I873901', '黃振家／逢甲大學', 2],
    [2024, '水文資料分析方法及水文資料分析系統', 'I832767', '黃振家／逢甲大學', 3],
    [2015, '軌道式雷射光學掃描設備及方法', 'I484138', '共同發明', 4],
  ]

  const patentStmt = db.prepare(`
  INSERT INTO patents (
    year,
    title,
    patent_number,
    inventor_or_owner,
    sort_order
  )
  VALUES (?, ?, ?, ?, ?)
`)

  patents.forEach((patent) => {
    patentStmt.run(patent)
  })

  patentStmt.finalize()

  // 主持人計畫
  const projects = [
    [
      '2026/08-2027/07',
      '融合數位孿生之淡水河流域土砂運移決策支援系統',
      '國科會',
      '主持人',
      '尚未開始',
      1,
    ],
    ['2026/07-2027/06', '小小水利工程師養成計畫', '國科會', '主持人', '執行中', 2],
    [
      '2026/06-2027/05',
      '非破壞性深層排水技術於坡地緊急救災之應用研究與規範建立',
      '國科會產學合作',
      '主持人',
      '執行中',
      3,
    ],
    [
      '2026/04-2026/12',
      '流域數值模式與數位孿生整合初步建置',
      '水利署水利規劃分署',
      '主持人',
      '執行中',
      4,
    ],
    ['2025/12-2026/11', '基於影像分析之動態淹水預警系統雛型開發', '國科會', '主持人', '執行中', 5],
    [
      '2025/09-2026/07',
      '跨野溪橋涵瓶頸段水砂災害分析與水砂無害化之解決方案',
      '農村水保署',
      '主持人',
      '已結束',
      6,
    ],
    [
      '2022/09-2025/12',
      '全流域洪水泥砂災害之聯合預警及決策分析系統',
      '國科會',
      '主持人',
      '已結束',
      7,
    ],
    [
      '2023/07-2024/10',
      '南投分局防災道路路網調查與構造物體檢計畫',
      '農村水保署南投分署',
      '主持人',
      '已結束',
      8,
    ],
    ['2023/11-2024/12', '玉穗溪整體治理方案評估研擬', '農村水保署臺南分署', '主持人', '已結束', 9],
    [
      '2023/08-2024/07',
      'CDIO 結合生活流力的沉浸式教學－流體力學',
      '教育部',
      '主持人',
      '已結束',
      10,
    ],
    ['2024/08-2025/07', '疫情後的 Fun 流力 2.0 轉型教學', '教育部', '主持人', '已結束', 11],
    ['2023/03-2025/04', '環境教育設施場所認證申請', '清水岩生態文創協會', '主持人', '已結束', 12],
    ['2024/07-2025/06', '富雨洋傘環境教育設施場所認證申請', '富雨洋傘', '主持人', '已結束', 13],
    [
      '2024/02-2024/12',
      '結合數據科學與機器學習建立集水區土砂來源分析系統',
      '農村水保署',
      '主持人',
      '已結束',
      14,
    ],
    [
      '114 年第 2 梯次',
      '臺義水資源永續與韌性農業防災實習計畫',
      '教育部／義大利 CNR',
      '主持人',
      null,
      15,
    ],
    [
      '114 年第 2 梯次',
      '臺泰水資源及綠能永續發展實習計畫',
      '教育部／泰國清邁大學',
      '主持人',
      null,
      16,
    ],
    ['115 年度', '臺日流域治理與韌性防災實習計畫', '教育部／日本筑波大學', '主持人', null, 17],
    [
      '115 年度',
      '臺泰水－能源－糧食 Nexus 與韌性調適實習計畫',
      '教育部／泰國清邁大學',
      '主持人',
      null,
      18,
    ],
  ]

  const projectStmt = db.prepare(`
  INSERT INTO projects (
    period,
    title,
    organization,
    role,
    status,
    sort_order
  )
  VALUES (?, ?, ?, ?, ?, ?)
`)

  projects.forEach((project) => {
    projectStmt.run(project)
  })

  projectStmt.finalize()

  // 合作計畫摘要
  const collaborationProjects = [
    ['水庫水力防淤試驗、模擬與風險分析。', 1],
    ['石門水庫排洪排砂對下游河道生態及沖淤影響研究。', 2],
    ['極端氣候都市水文變遷與智慧化雲端微服務預警平台。', 3],
    ['國際淨零技術生態創新聯盟。', 4],
    ['永續社區空間治理與防減災 ESG 成效評估。', 5],
    ['一所大學守護一條河四校聯盟行動。', 6],
  ]

  const collaborationStmt = db.prepare(`
  INSERT INTO collaboration_projects (
    text,
    sort_order
  )
  VALUES (?, ?)
`)

  collaborationProjects.forEach((item) => {
    collaborationStmt.run(item)
  })

  collaborationStmt.finalize()

  // 任職及研究經歷
  const experiences = [
    ['2024/02 至今', '逢甲大學', '副教授；兼任永續處永續組組長', 1],
    ['2022/02-2024/01', '逢甲大學', '助理教授', 2],
    ['2021/02-2022/01', '國立臺北商業大學通識教育中心', '助理教授', 3],
    ['2020/08-2021/01', '國立臺北商業大學通識教育中心', '講師', 4],
    ['2018/06-2020/06', '國立臺灣大學土木工程學系', '博士後研究', 5],
    ['2017/02-2017/09', 'University of Colorado Denver', '訪問學者', 6],
    ['2009-2018', '國立臺灣大學水工試驗所', '博士班研究生及計畫工作人員', 7],
  ]

  const experienceStmt = db.prepare(`
  INSERT INTO experiences (
    period,
    organization,
    position,
    sort_order
  )
  VALUES (?, ?, ?, ?)
`)

  experiences.forEach((item) => {
    experienceStmt.run(item)
  })

  experienceStmt.finalize()

  // Experience 其他項目
  const experienceItems = [
    ['professional_service', '國際及國內期刊論文審查。', 1],
    ['professional_service', '碩博士學位考試及博士資格考審查。', 2],
    ['professional_service', '教師升等、優秀論文及產學技術審查。', 3],
    ['professional_service', '學術論壇主持及國內外大學受邀演講。', 4],
    ['professional_service', '課程、招生及研究生事務委員會服務。', 5],
    ['professional_service', '校級永續發展與國際交流工作。', 6],

    ['teaching', '流體力學與水利相關課程。', 1],
    ['teaching', '環境、永續、智慧城市及災害管理課程。', 2],
    ['teaching', 'CDIO 與實作導向教學。', 3],
    ['teaching', '水利防災科普教育。', 4],
    ['teaching', '國科會大專學生研究計畫指導。', 5],
    ['teaching', '國際實習及海外人才培育。', 6],

    ['training', '人工智慧學校結業證書。', 1],
    ['training', 'EMI 教學結業證書。', 2],
    ['training', '企業永續管理師。', 3],
    ['training', '溫室氣體盤查主任查證員。', 4],
    ['training', 'Python 證照。', 5],
    ['training', 'NVIDIA 證照。', 6],
  ]

  const experienceItemStmt = db.prepare(`
  INSERT INTO experience_items (
    type,
    text,
    sort_order
  )
  VALUES (?, ?, ?)
`)

  experienceItems.forEach((item) => {
    experienceItemStmt.run(item)
  })

  experienceItemStmt.finalize()

  // International
  const internationalItems = [
    ['visit_exchange', '2017 年於 University of Colorado Denver 進行訪問研究。', 1],
    ['visit_exchange', '與美國墾務局進行水庫與河川數值模式及 SRH 相關技術交流。', 2],
    ['visit_exchange', '參與臺美水利技術引進及應用研究。', 3],
    ['visit_exchange', '參與 EGU、AGU、AOGS、JpGU 及水庫沉砂繞道等國際會議。', 4],

    ['approved_cooperation', '義大利國家研究委員會 CNR。', 1],
    ['approved_cooperation', '日本筑波大學。', 2],
    ['approved_cooperation', '泰國清邁大學及相關研究中心。', 3],

    ['developing_cooperation', 'University of Technology Sydney。', 1],
    ['developing_cooperation', '京都大學防災研究所。', 2],
    ['developing_cooperation', 'Colorado State University。', 3],
    ['developing_cooperation', 'Adamas University。', 4],
  ]

  const internationalStmt = db.prepare(`
  INSERT INTO international_items (
    type,
    text,
    sort_order
  )
  VALUES (?, ?, ?)
`)

  internationalItems.forEach((item) => {
    internationalStmt.run(item)
  })

  internationalStmt.finalize()

  // STARLAB 主要研究主題
  const researchTopics = [
    [1, '水庫與河川泥砂運移', 1],
    [1, '水工模型試驗', 2],
    [1, '數值模擬與模式驗證', 3],
    [1, '現地調查與智慧監測', 4],
    [1, '人工智慧與影像分析', 5],
    [1, '洪水與泥砂災害預警', 6],
    [1, '流域數位孿生', 7],
    [1, '水資源與氣候韌性', 8],
  ]

  const researchTopicStmt = db.prepare(`
  INSERT INTO research_topics (
    lab_id,
    topic,
    sort_order
  )
  VALUES (?, ?, ?)
`)

  researchTopics.forEach((topic) => {
    researchTopicStmt.run(topic)
  })

  researchTopicStmt.finalize()

  // STARLAB 活動
  const labActivities = [
    [1, '水工模型試驗', 1],
    [1, '現地調查與量測', 2],
    [1, '研討會及研究成果發表', 3],
    [1, '國際交流', 4],
    [1, '水利防災科普活動', 5],
    [1, '學生研究成果', 6],
  ]

  const labActivityStmt = db.prepare(`
  INSERT INTO lab_activities (
    lab_id,
    title,
    sort_order
  )
  VALUES (?, ?, ?)
`)

  labActivities.forEach((activity) => {
    labActivityStmt.run(activity)
  })

  labActivityStmt.finalize()
})

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message)
    return
  }

  console.log('Database connection closed.')
})
