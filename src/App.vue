<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Item = Record<string, string | number | null>
type HomeData = {
  profile?: Item
  positions?: Item[]
  research_areas?: Item[]
  navigation_items?: Item[]
  settings?: Record<string, string>
  content_groups?: Item[]
  latest_news?: Item[]
  academic_links?: Item[]
  research_stats?: Item[]
}
type AboutData = { profile?: Item; research_interests?: Item[] }
type ResearchData = { research?: Item[]; research_summaries?: Item[] }
type PublicationsData = { journal_papers?: Item[]; conference_papers?: Item[]; other_publications?: Item[]; patents?: Item[] }
type ProjectsData = { projects?: Item[]; collaboration_projects?: Item[] }
type ExperienceData = { experiences?: Item[]; experience_items?: Record<string, Item[]> }
type InternationalData = { regions?: Record<string, Item[]>; notes?: Item[]; conferences?: Item[] }
type LabData = { lab?: Item; research_topics?: Item[]; lab_members?: Item[]; lab_activities?: Item[] }
type HonorsData = { honors?: Item[] }
type NewsData = { news?: Item[] }
type ServiceStatsData = { invited_talks?: Item[]; review_stats?: Item[] }
type PublicationDisplay = { id: string; title: string; year: string; meta: string; source: string; url: string; graphicalAbstract: string }
type ImagePreview = { title: string; photo: string }

const home = ref<HomeData>({})
const about = ref<AboutData>({})
const researchData = ref<ResearchData>({})
const publicationsData = ref<PublicationsData>({})
const projectsData = ref<ProjectsData>({})
const experienceData = ref<ExperienceData>({})
const internationalData = ref<InternationalData>({})
const labData = ref<LabData>({})
const honorsData = ref<HonorsData>({})
const newsData = ref<NewsData>({})
const serviceStatsData = ref<ServiceStatsData>({})
const loading = ref(true)
const loadError = ref(false)
const aboutLoading = ref(false)
const aboutError = ref(false)
const contentLoading = ref(true)
const contentError = ref(false)
const currentPage = ref('Home')
const language = ref<'zh' | 'en'>((window.localStorage.getItem('site-language') as 'zh' | 'en' | null) || 'zh')
const previewResource = new URLSearchParams(window.location.search).get('admin-preview') || ''
const previewItemId = Number(new URLSearchParams(window.location.search).get('admin-preview-id') || 0)
const previewItemType = new URLSearchParams(window.location.search).get('admin-preview-type') || ''
const previewField = new URLSearchParams(window.location.search).get('admin-preview-field') || ''
const previewSectionMap: Record<string, string> = {
  profile: 'home', positions: 'home', research_areas: 'home', research_interests: 'home', research_stats: 'home', academic_links: 'home',
  research: 'research', research_summaries: 'research',
  journal_papers: 'publications', conference_papers: 'publications', other_publications: 'publications', patents: 'publications', other_works: 'publications',
  projects: 'projects', collaboration_projects: 'projects', honors: 'honors', news: 'news',
  experiences: 'experience', experience_items: 'experience', international_items: 'international', international_conferences: 'international',
  labs: 'lab', research_topics: 'lab', lab_members: 'lab', lab_activities: 'lab',
}
const previewSection = previewSectionMap[previewResource] || ''
const mobileNavOpen = ref(false)
const notice = ref('')
const fieldsOpen = ref(false)
const aboutOpen = ref(false)
const interestsOpen = ref(false)
const detailOpen = ref(false)
const newsDetailOpen = ref(false)
const selectedNews = ref<Item>({})
const publicationOpen = ref(false)
const enlargedPublicationPhoto = ref<ImagePreview | null>(null)
const selectedPublicationKey = ref('journal')
const publicationIndexes = ref<Record<string, number>>({ journal: 0, conference: 0, other: 0 })
const detailType = ref<'research' | 'project'>('research')
const selectedDetail = ref<Item>({})
const activeExperienceGroup = ref('professional_service')
const activeLabGroup = ref('topics')
const displayedBio = ref('')
const projectMarquee = ref<HTMLElement | null>(null)
const projectDragging = ref(false)
let projectPointerStart = 0
let projectScrollStart = 0
let projectDragged = false
let typingTimer: ReturnType<typeof window.setInterval> | null = null
let typingRestartTimer: ReturnType<typeof window.setTimeout> | null = null
let publicationTimer: ReturnType<typeof window.setInterval> | null = null
const publicationStepTimers: ReturnType<typeof window.setTimeout>[] = []
let scrollTicking = false

const profile = computed(() => home.value.profile ?? {})
const positions = computed(() => home.value.positions ?? [])
const researchAreas = computed(() => home.value.research_areas ?? [])
const settings = computed(() => home.value.settings ?? {})
const navigationLabels: Record<string, { zh: string; en: string }> = {
  Home: { zh: '首頁', en: 'Home' },
  News: { zh: '最新消息', en: 'News' },
  Honors: { zh: '榮譽獎項', en: 'Honors' },
  Research: { zh: '研究', en: 'Research' },
  Publications: { zh: '學術著作', en: 'Publications' },
  Projects: { zh: '研究計畫', en: 'Projects' },
  Experience: { zh: '經歷', en: 'Experience' },
  International: { zh: '國際合作', en: 'International' },
  Lab: { zh: '研究團隊', en: 'Lab' },
}
const navigationKeys: Record<string, string> = Object.fromEntries(Object.entries(navigationLabels).flatMap(([key, labels]) => [[key, key], [labels.zh, key], [labels.en, key]]))
const hasHan = (text: string) => /\p{Script=Han}/u.test(text)
const navItems = computed(() => (home.value.navigation_items ?? [])
  .map((item) => navigationKeys[String(item.name)] || String(item.name))
  .filter((key) => language.value !== 'en' || !hasHan(key)))
const navLabel = (key: string) => navigationLabels[key]?.en || key
const localized = (item: Item | undefined, field: string) => {
  if (!item) return ''
  const original = String(item[field] ?? '')
  if (language.value !== 'en') return original
  const english = String(item[`${field}_en`] ?? '').trim()
  if (field === 'authors') return english || original
  if (english && !hasHan(english)) return english
  return hasHan(original) ? '' : original
}
const ui = (zh: string, en: string) => language.value === 'en' ? en : zh
watch(language, () => {
  document.documentElement.lang = ui('zh-Hant', 'en')
  document.title = ui('黃振家 Cheng-Chia Huang｜水利工程與資源保育學系', 'Cheng-Chia Huang | Water Resources Engineering and Conservation')
}, { immediate: true })
const toggleLanguage = () => {
  language.value = language.value === 'zh' ? 'en' : 'zh'
  window.localStorage.setItem('site-language', language.value)
}
const groupsFor = (section: string) => computed(() => (home.value.content_groups ?? [])
  .filter((item) => item.section === section)
  .map((item, index) => ({
    key: String(item.key),
    title: localized(item, 'title'),
    shortTitle: localized(item, 'short_title') || localized(item, 'title'),
    label: localized(item, 'label'),
    number: String(index + 1).padStart(2, '0'),
  })))
const experienceGroups = groupsFor('experience')
const labGroups = groupsFor('lab')
const publicationGroupLabels = groupsFor('publications')
const aboutProfile = computed(() => about.value.profile ?? {})
const researchInterests = computed(() => about.value.research_interests ?? [])
const aboutParagraphs = computed(() => {
  const text = localized(aboutProfile.value, 'full_bio').trim()
  return text ? text.split(/\r?\n/).filter(Boolean) : []
})
const fullBio = computed(() => localized(profile.value, 'short_bio'))
const researchMetrics = computed(() => {
  const rows = home.value.research_stats || []
  return rows.map((item) => ({ value: String(item.value || ''), label: localized(item, 'label'), note: localized(item, 'note') }))
})
const academicLinks = computed(() => {
  const rows = (home.value.academic_links || []).map((item) => [localized(item, 'name'), String(item.url || '')])
  return rows
})
const latestNewsRows = computed(() => {
  const rows = [...(newsData.value.news || home.value.latest_news || [])]
  while (rows.length < 3) rows.push({ id: -rows.length - 1, news_date: '—', category: '', title: '', content: null, photo: null, url: null })
  return rows.slice(0, 3)
})
const newsFilter = ref('全部')
const newsCategories = computed(() => ['全部', '受邀演講', '國際交流', '論文發表', '計畫', '學生與教學', ...new Set((newsData.value.news || []).map((item) => String(item.category || '')).filter((category) => !['受邀演講', '國際交流', '論文發表', '計畫', '學生與教學'].includes(category)))])
const newsCategoryLabel = (category: string) => {
  if (language.value !== 'en') return category
  const knownLabel = { 全部: 'All', 受邀演講: 'Invited Talks', 國際交流: 'International Exchange', 論文發表: 'Publications', 計畫: 'Projects', 學生與教學: 'Students and Teaching' }[category]
  if (knownLabel) return knownLabel
  const translated = (newsData.value.news || []).find((item) => item.category === category && localized(item, 'category'))
  return localized(translated, 'category') || (hasHan(category) ? 'Other' : category)
}
const displayNewsCategory = (item: Item) => localized(item, 'category') || newsCategoryLabel(String(item.category ?? ''))
const filteredNewsRows = computed(() => {
  const rows = newsData.value.news || []
  return newsFilter.value === '全部' ? rows : rows.filter((item) => String(item.category || '') === newsFilter.value)
})
const pinnedNewsRows = computed(() => {
  const rows = newsData.value.news || []
  const pinned = rows.filter((item) => Number(item.is_pinned) === 1)
  return pinned.length ? pinned : rows.slice(0, 1)
})
const newsListRows = computed(() => filteredNewsRows.value.filter((item) => !pinnedNewsRows.value.includes(item)).slice(0, 8))
const emptyGroup = { key: '', title: '', shortTitle: '', label: '', number: '' }
const activeExperience = computed(() => experienceGroups.value.find((group) => group.key === activeExperienceGroup.value) ?? experienceGroups.value[0] ?? emptyGroup)
const activeLab = computed(() => labGroups.value.find((group) => group.key === activeLabGroup.value) ?? labGroups.value[0] ?? emptyGroup)
const publicationTitle = (key: string) => publicationGroupLabels.value.find((group) => group.key === key)?.title || ''
const publicationGroups = computed(() => [
  {
    key: 'journal',
    title: publicationTitle('journal'),
    number: '01',
    items: (publicationsData.value.journal_papers || []).map((item) => ({
      id: `journal-${item.id}`,
      title: localized(item, 'title'),
      year: String(item.year || ''),
      meta: localized(item, 'authors'),
      source: localized(item, 'journal'),
      url: String(item.doi_url || ''),
      graphicalAbstract: String(item.graphical_abstract || ''),
    })),
  },
  {
    key: 'conference',
    title: publicationTitle('conference'),
    number: '02',
    items: (publicationsData.value.conference_papers || []).map((item) => ({
      id: `conference-${item.id}`,
      title: localized(item, 'title'),
      year: String(item.year || ''),
      meta: localized(item, 'authors'),
      source: localized(item, 'conference'),
      url: '',
      graphicalAbstract: String(item.graphical_abstract || ''),
    })),
  },
  {
    key: 'other',
    title: publicationTitle('other'),
    number: '03',
    items: [...(publicationsData.value.patents || []), ...(publicationsData.value.other_publications || [])]
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map((item) => ({
      id: `other-${item.id}-${item.patent_number || 'work'}`,
      title: localized(item, 'title'),
      year: String(item.year || ''),
      meta: String(item.patent_number || localized(item, 'description') || ''),
      source: localized(item, 'inventor_or_owner'),
      url: '',
      graphicalAbstract: '',
    })),
  },
])
const selectedPublicationGroup = computed(() => publicationGroups.value.find((group) => group.key === selectedPublicationKey.value) ?? publicationGroups.value[0]!)
const publicationYearStats = computed(() => Array.from({ length: 6 }, (_, index) => {
  const year = 2021 + index
  return {
    year,
    journal: (publicationsData.value.journal_papers || []).filter((item) => Number(item.year) === year).length,
    conference: (publicationsData.value.conference_papers || []).filter((item) => Number(item.year) === year).length,
  }
}))
const indexSummary = computed(() => {
  const journalPapers = publicationsData.value.journal_papers || []
  const conferencePapers = publicationsData.value.conference_papers || []
  const scie = journalPapers.filter((item) => Number(item.is_scie) === 1 || String(item.index_type || '').toUpperCase() === 'SCIE').length
  const ei = [...journalPapers, ...conferencePapers].filter((item) => Number(item.is_ei) === 1 || String(item.index_type || '').toUpperCase() === 'EI').length
  return { scie, ei, total: scie + ei }
})
const featuredPapers = computed(() => {
  const candidates = [...(publicationsData.value.journal_papers || []), ...(publicationsData.value.conference_papers || [])].filter((item) => Number(item.is_featured) === 1)
  return [...candidates].sort(() => Math.random() - 0.5).slice(0, 3)
})
const timelineStart = Date.parse('2022-01-01')
const timelineStartYear = 2022
function projectDateRange(project: Item) {
  let start = String(project.start_date || '').slice(0, 10)
  let end = String(project.end_date || '').slice(0, 10)
  const period = String(project.period || '')
  const western = period.match(/((?:19|20)\d{2})\/(\d{1,2})(?:\s*-\s*((?:19|20)\d{2})\/(\d{1,2}))?/)
  if (!start && western) start = `${western[1]}-${western[2]!.padStart(2, '0')}-01`
  if (!end && western) end = western[3] ? `${western[3]}-${western[4]!.padStart(2, '0')}-28` : start
  return { start, end }
}
const timelineEndYear = computed(() => {
  let latestEndYear = 2027
  for (const project of projectsData.value.projects || []) {
    if (project.project_type === 'dream') continue
    const { end } = projectDateRange(project)
    const endYear = Number(end.slice(0, 4))
    if (endYear) latestEndYear = Math.max(latestEndYear, endYear)
  }
  return latestEndYear + 1
})
const timelineYears = computed(() => Array.from({ length: timelineEndYear.value - timelineStartYear }, (_, index) => timelineStartYear + index))
const timelineEnd = computed(() => Date.parse(`${timelineEndYear.value}-01-01`))
function timelinePercent(date: string) {
  if (!date) return 0
  return ((Date.parse(date) - timelineStart) / (timelineEnd.value - timelineStart)) * 100
}
const todayTimelinePercent = computed(() => {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return Math.max(0, Math.min(100, timelinePercent(today)))
})
const projectTimeline = computed<Array<Item & { start: string; end: string; status: string; left: number; width: number }>>(() => (projectsData.value.projects || []).filter((project) => project.project_type !== 'dream').map((project) => {
  const { start, end } = projectDateRange(project)
  const today = new Date().toISOString().slice(0, 10)
  const status = String(project.status_override || (end && end < today ? 'ended' : 'active'))
  const left = Math.max(0, Math.min(100, timelinePercent(start)))
  const right = Math.max(left, Math.min(100, timelinePercent(end)))
  return { ...project, start, end, status, left, width: Math.max(2, right - left) }
}).sort((a, b) => a.start.localeCompare(b.start)))
const projectDreamProjects = computed(() => (projectsData.value.projects || []).filter((project) => project.project_type === 'dream'))
const projectStatusLabel = (status: string) => status === 'ended' ? ui('已結束', 'Completed') : ui('執行中', 'In Progress')
const projectStatusDisplay = (status: unknown) => ({ '尚未開始': ui('尚未開始', 'Not Started'), '執行中': ui('執行中', 'In Progress'), '已結束': ui('已結束', 'Completed') }[String(status)] || String(status || ''))
const projectFundingClass = (category: unknown) => {
  const value = String(category || '').trim().toLowerCase()
  const aliases: Record<string, string> = {
    national_science: 'national_science',
    '國科會': 'national_science',
    '國家科學及技術委員會': 'national_science',
    rural_conservation: 'rural_conservation',
    '農村水保署': 'rural_conservation',
    '農業部農村發展及水土保持署': 'rural_conservation',
    water_resources: 'water_resources',
    '水利署': 'water_resources',
    '經濟部水利署': 'water_resources',
    education: 'education',
    '教育部': 'education',
    private: 'private',
    '民間': 'private',
  }
  return `funding-${aliases[value] || 'private'}`
}
const labMemberIsAlumni = (member: Item) => Number(member.is_alumni) === 1 || /已畢業|畢業/.test(String(member.name || ''))
const projectFundingLegend = computed(() => [
  { key: 'national_science', label: ui('國科會', 'NSTC') },
  { key: 'rural_conservation', label: ui('農村水保署', 'Rural Development and Soil and Water Conservation Agency') },
  { key: 'water_resources', label: ui('水利署', 'Water Resources Agency') },
  { key: 'education', label: ui('教育部', 'Ministry of Education') },
  { key: 'private', label: ui('民間／其他', 'Private / Other') },
])
const invitedTalkYearStats = computed(() => {
  const counts = new Map<number, number>()
  for (const item of serviceStatsData.value.invited_talks || []) {
    const year = Number(String(item.talk_date || '').slice(0, 4))
    if (year) counts.set(year, (counts.get(year) || 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => a[0] - b[0])
})
const featuredTalks = computed(() => (serviceStatsData.value.invited_talks || []).filter((item) => Number(item.is_featured) === 1).slice(0, 5))
const internationalRegions = [
  { key: 'europe', zh: '歐洲', en: 'Europe' },
  { key: 'east_asia', zh: '東亞', en: 'East Asia' },
  { key: 'southeast_asia', zh: '東南亞', en: 'Southeast Asia' },
  { key: 'south_asia', zh: '南亞', en: 'South Asia' },
  { key: 'oceania', zh: '大洋洲', en: 'Oceania' },
  { key: 'americas', zh: '美洲', en: 'Americas' },
]
const internationalRegionCards = computed(() => internationalRegions.map((region) => ({ ...region, items: internationalData.value.regions?.[region.key] || [] })))
const internationalNotes = computed(() => internationalData.value.notes || [])
const internationalConferences = computed(() => internationalData.value.conferences || [])
const internationalStatusLabel = (status: unknown) => ({ approved: ui('已核定', 'Approved'), exchange: ui('技術交流', 'Technical Exchange'), discussing: ui('洽談中', 'Under Discussion') }[String(status)] || ui('合作狀態', 'Status'))

function activePublicationItem(key: string, items: PublicationDisplay[]) {
  if (!items.length) return null
  return items[(publicationIndexes.value[key] || 0) % items.length]
}

function startTyping(text: string) {
  if (typingTimer) window.clearInterval(typingTimer)
  if (typingRestartTimer) window.clearTimeout(typingRestartTimer)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    displayedBio.value = text
    return
  }
  displayedBio.value = ''
  let index = 0
  typingTimer = window.setInterval(() => {
    displayedBio.value += text[index] ?? ''
    index += 1
    if (index >= text.length && typingTimer) {
      window.clearInterval(typingTimer)
      typingTimer = null
      typingRestartTimer = window.setTimeout(() => startTyping(text), 15000)
    }
  }, 55)
}

async function loadHome() {
  loading.value = true
  loadError.value = false
  try {
    const response = await fetch('/api/home')
    if (!response.ok) throw new Error('API response error')
    home.value = await response.json()
    startTyping(localized(home.value.profile, 'short_bio'))
  } catch {
    loadError.value = true
    startTyping('')
  } finally {
    loading.value = false
  }
}

watch(language, () => {
  startTyping(localized(home.value.profile, 'short_bio'))
})

async function loadAbout() {
  if (about.value.profile) return
  aboutLoading.value = true
  aboutError.value = false
  try {
    const response = await fetch('/api/about')
    if (!response.ok) throw new Error('API response error')
    about.value = await response.json()
  } catch {
    aboutError.value = true
  } finally {
    aboutLoading.value = false
  }
}

async function loadContent() {
  contentLoading.value = true
  contentError.value = false
  try {
    const endpoints = ['research', 'publications', 'projects', 'experience', 'international', 'lab', 'honors', 'news', 'service-stats']
    const responses = await Promise.all(endpoints.map((endpoint) => fetch(`/api/${endpoint}`)))
    if (responses.some((response) => !response.ok)) throw new Error('API response error')
    const [research, publications, projects, experience, international, lab, honors, news, serviceStats] = await Promise.all(responses.map((response) => response.json()))
    researchData.value = research
    publicationsData.value = publications
    projectsData.value = projects
    experienceData.value = experience
    internationalData.value = international
    labData.value = lab
    honorsData.value = honors
    newsData.value = news
    serviceStatsData.value = serviceStats
  } catch {
    contentError.value = true
  } finally {
    contentLoading.value = false
  }
}

function selectNav(item: string) {
  mobileNavOpen.value = false
  currentPage.value = item
  window.setTimeout(() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function updateCurrentPageOnScroll() {
  if (scrollTicking) return
  scrollTicking = true
  window.requestAnimationFrame(() => {
    const marker = Math.min(180, window.innerHeight * 0.32)
    let active = 'Home'
    for (const item of navItems.value) {
      const section = document.getElementById(item.toLowerCase())
      if (section && section.getBoundingClientRect().top <= marker) active = item
    }
    currentPage.value = active
    scrollTicking = false
  })
}

function openFields() {
  fieldsOpen.value = true
  document.body.classList.add('modal-open')
}

function openAbout() {
  loadAbout()
  aboutOpen.value = true
  document.body.classList.add('modal-open')
}

function openInterests() {
  loadAbout()
  interestsOpen.value = true
  document.body.classList.add('modal-open')
}

function openDetail(type: 'research' | 'project', item: Item) {
  detailType.value = type
  selectedDetail.value = item
  detailOpen.value = true
  document.body.classList.add('modal-open')
}

function openNewsDetail(item: Item) {
  if (Number(item.id) < 0) return
  selectedNews.value = item
  newsDetailOpen.value = true
  document.body.classList.add('modal-open')
}

function projectSummary(project: Item) {
  const summary = localized(project, 'summary').trim()
  if (!summary) return ui('目前尚未提供計畫摘要。', 'No project summary is currently available.')
  const sentences = summary.split(/(?<=[。！？.!?])\s*/).filter(Boolean)
  return sentences.length > 3 ? `${sentences.slice(0, 3).join('')}…` : summary
}

function startProjectDrag(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  const marquee = projectMarquee.value
  if (!marquee) return
  const set = marquee.querySelector<HTMLElement>('.project-set')
  const loopWidth = set ? set.offsetWidth + 18 : 0
  if (loopWidth && marquee.scrollLeft < loopWidth * 0.5) marquee.scrollLeft += loopWidth
  else if (loopWidth && marquee.scrollLeft > loopWidth * 1.5) marquee.scrollLeft -= loopWidth
  projectPointerStart = event.clientX
  projectScrollStart = marquee.scrollLeft
  projectDragged = false
  projectDragging.value = false
}

function moveProjectDrag(event: PointerEvent) {
  const marquee = projectMarquee.value
  if (!marquee || event.buttons === 0) return
  const distance = event.clientX - projectPointerStart
  if (Math.abs(distance) <= 5 && !projectDragged) return
  if (!projectDragged) {
    projectDragged = true
    projectDragging.value = true
    marquee.setPointerCapture(event.pointerId)
  }
  marquee.scrollLeft = projectScrollStart - distance

  const set = marquee.querySelector<HTMLElement>('.project-set')
  const loopWidth = set ? set.offsetWidth + 18 : 0
  if (loopWidth && marquee.scrollLeft < loopWidth * 0.5) {
    marquee.scrollLeft += loopWidth
    projectScrollStart += loopWidth
  } else if (loopWidth && marquee.scrollLeft > loopWidth * 1.5) {
    marquee.scrollLeft -= loopWidth
    projectScrollStart -= loopWidth
  }
}

function stopProjectDrag(event: PointerEvent) {
  const marquee = projectMarquee.value
  if (!marquee) return
  projectDragging.value = false
  if (marquee.hasPointerCapture(event.pointerId)) marquee.releasePointerCapture(event.pointerId)
}

function guardProjectClick(event: MouseEvent) {
  if (!projectDragged) return
  event.preventDefault()
  event.stopPropagation()
  projectDragged = false
}

function closeFields() {
  fieldsOpen.value = false
  document.body.classList.remove('modal-open')
}

function closeAbout() {
  aboutOpen.value = false
  document.body.classList.remove('modal-open')
}

function closeInterests() {
  interestsOpen.value = false
  document.body.classList.remove('modal-open')
}

function closeDetail() {
  detailOpen.value = false
  document.body.classList.remove('modal-open')
}

function closeNewsDetail() {
  newsDetailOpen.value = false
  document.body.classList.remove('modal-open')
}

function openPublicationGroup(key: string) {
  selectedPublicationKey.value = key
  publicationOpen.value = true
  document.body.classList.add('modal-open')
}

function closePublicationGroup() {
  publicationOpen.value = false
  enlargedPublicationPhoto.value = null
  document.body.classList.remove('modal-open')
}

function openPublicationPhoto(item: PublicationDisplay) {
  enlargedPublicationPhoto.value = { title: item.title, photo: item.graphicalAbstract }
}

function openDetailPhoto(item: Item) {
  enlargedPublicationPhoto.value = {
    title: String(item.title || ''),
    photo: String(item.photo || ''),
  }
}

function closePublicationPhoto() {
  enlargedPublicationPhoto.value = null
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (enlargedPublicationPhoto.value) {
      closePublicationPhoto()
      return
    }
    closeFields()
    closeAbout()
    closeInterests()
    closeDetail()
    closeNewsDetail()
    closePublicationGroup()
  }
}

async function handleContentUpdate(event: StorageEvent) {
  if (event.key !== 'site-content-updated') return
  about.value = {}
  await Promise.all([loadHome(), loadContent()])
  if (aboutOpen.value || interestsOpen.value) await loadAbout()
}

async function applyAdminPreview() {
  if (!previewSection) return
  let target: Element | null = null
  const recordId = previewResource === 'other_works' ? Math.floor(previewItemId / 2) : previewItemId
  const recordIn = (selector: string) => recordId
    ? document.querySelector(`${selector} [data-admin-record="${recordId}"]`)
    : null

  if (previewResource === 'profile' && previewField === 'full_bio') {
    await loadAbout()
    openAbout()
    await nextTick()
    target = document.querySelector('.about-window .window-copy')
  } else if (previewResource === 'profile') {
    if (previewField === 'email' || previewField === 'address') target = document.querySelector('.contact-content')
    else target = previewField === 'short_bio' ? document.querySelector('.hero-intro') : document.querySelector('.hero-copy h1')
  } else if (previewResource === 'research_areas') {
    openFields()
    await nextTick()
    target = recordIn('[aria-labelledby="fields-title"]') || document.querySelector('[aria-labelledby="fields-title"] .field-list')
  } else if (previewResource === 'research_interests') {
    await loadAbout()
    openInterests()
    await nextTick()
    target = recordIn('.interests-window') || document.querySelector('.interests-window .window-interest-list')
  } else if (['journal_papers', 'conference_papers', 'other_publications', 'patents', 'other_works'].includes(previewResource)) {
    const group = previewResource === 'journal_papers' ? 'journal' : previewResource === 'conference_papers' ? 'conference' : 'other'
    openPublicationGroup(group)
    await nextTick()
    target = recordIn('.publication-window') || document.querySelector('.publication-window .publication-modal-list')
  } else if (previewResource === 'research') {
    const items = researchData.value.research || []
    const item = previewItemId ? items.find((entry) => Number(entry.id) === previewItemId) : undefined
    if (item) {
      openDetail('research', item)
      await nextTick()
      target = document.querySelector('.detail-window-content')
    } else {
      target = document.querySelector('#research .research-card-grid')
    }
  } else if (previewResource === 'projects') {
    const items = projectsData.value.projects || []
    const item = previewItemId ? items.find((entry) => Number(entry.id) === previewItemId) : undefined
    if (item) {
      openDetail('project', item)
      await nextTick()
      target = document.querySelector('.detail-window-content')
    } else {
      target = document.querySelector('#projects .project-marquee')
    }
  } else {
    if (previewResource === 'experience_items' && previewItemType) activeExperienceGroup.value = previewItemType
    if (previewResource === 'research_topics') activeLabGroup.value = 'topics'
    if (previewResource === 'lab_members') activeLabGroup.value = 'members'
    if (previewResource === 'lab_activities') activeLabGroup.value = 'activities'
    await nextTick()
    if (['experience_items', 'international_items', 'research_topics', 'lab_members', 'lab_activities'].includes(previewResource)) {
      await new Promise((resolve) => window.setTimeout(resolve, 360))
    }
    if (previewResource === 'positions') target = recordIn('.positions') || document.querySelector('.positions')
    else if (previewResource === 'research_summaries') target = recordIn('#research .summary-window') || document.querySelector('#research .summary-window')
    else if (previewResource === 'collaboration_projects') target = recordIn('#projects .collaboration-window') || document.querySelector('#projects .collaboration-window')
    else if (previewResource === 'research_stats') target = document.querySelector('.overview-metrics')
    else if (previewResource === 'academic_links') target = document.querySelector('.overview-links')
    else if (previewResource === 'honors') target = document.querySelector('#honors')
    else if (previewResource === 'news') target = document.querySelector('#news')
    else if (previewResource === 'experiences') target = recordIn('.career-timeline') || document.querySelector('.career-timeline')
    else if (previewResource === 'experience_items') target = recordIn('.experience-panel') || document.querySelector('.experience-panel ul')
    else if (previewResource === 'international_items' && previewItemType === 'note') target = recordIn('.international-notes') || document.querySelector('.international-page .international-notes')
    else if (previewResource === 'international_items') target = recordIn('.international-page') || document.querySelector('.international-page .international-stage')
    else if (previewResource === 'international_conferences') target = recordIn('.conference-footprints') || document.querySelector('.international-page .conference-footprints')
    else if (['research_topics', 'lab_members', 'lab_activities'].includes(previewResource)) target = recordIn('.lab-panel') || document.querySelector('.lab-panel > ol, .lab-panel > ul')
    else if (previewResource === 'labs') {
      if (previewField === 'name') target = document.getElementById('lab-title')
      else if (previewField === 'description') target = document.querySelector('#lab .lab-intro')
      else target = document.querySelector('#lab .lab-manifesto')
    }
    else target = previewSection === 'home' ? document.querySelector('.hero-copy') : document.getElementById(previewSection)
  }

  if (!target) target = previewSection === 'home' ? document.querySelector('.hero-copy') : document.getElementById(previewSection)
  target?.classList.add('admin-preview-target')
  if (target) {
    // The home page continues rendering several data-driven sections after the
    // first paint. Delay the final positioning so the highlighted element is
    // actually visible instead of leaving the browser near the top of the page.
    const positionPreviewTarget = () => {
      target?.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' })
    }
    positionPreviewTarget()
    window.setTimeout(positionPreviewTarget, 250)
    window.setTimeout(positionPreviewTarget, 800)
  }
}

onMounted(async () => {
  await Promise.all([loadHome(), loadContent()])
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', updateCurrentPageOnScroll, { passive: true })
  window.addEventListener('storage', handleContentUpdate)
  updateCurrentPageOnScroll()
  await applyAdminPreview()
  publicationTimer = window.setInterval(() => {
    publicationGroups.value.forEach((group, index) => {
      const timer = window.setTimeout(() => {
        if (group.items.length > 1) publicationIndexes.value[group.key] = ((publicationIndexes.value[group.key] || 0) + 1) % group.items.length
      }, index * 500)
      publicationStepTimers.push(timer)
    })
  }, 5000)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', updateCurrentPageOnScroll)
  window.removeEventListener('storage', handleContentUpdate)
  if (typingTimer) window.clearInterval(typingTimer)
  if (typingRestartTimer) window.clearTimeout(typingRestartTimer)
  if (publicationTimer) window.clearInterval(publicationTimer)
  publicationStepTimers.forEach((timer) => window.clearTimeout(timer))
  document.body.classList.remove('modal-open')
})
</script>

<template>
  <div class="site-shell" :class="{ 'admin-preview-mode': previewSection }">
    <header class="topbar" :lang="language">
      <button class="brand" type="button" :aria-label="language === 'zh' ? '回到首頁' : 'Back to home'" @click="selectNav('Home')">
        <img class="brand-logo" src="/starlab_logo.png" :alt="settings.brand_name" />
      </button>

      <button class="menu-button" type="button" :aria-expanded="mobileNavOpen" @click="mobileNavOpen = !mobileNavOpen">
        {{ language === 'zh' ? '選單' : 'MENU' }} <span aria-hidden="true">{{ mobileNavOpen ? '×' : '☰' }}</span>
      </button>

      <nav :class="{ open: mobileNavOpen }" :aria-label="ui('主要導覽', 'Main navigation')">
        <button
          v-for="item in navItems"
          :key="item"
          type="button"
          :class="{ active: item === currentPage }"
          :aria-current="item === currentPage ? 'page' : undefined"
          @click="selectNav(item)"
        >{{ navLabel(item) }}</button>
      </nav>

      <button class="language-toggle" type="button" :aria-label="language === 'zh' ? '切換為英文' : 'Switch to Chinese'" @click="toggleLanguage">
        <span :class="{ active: language === 'zh' }">{{ ui('中', 'ZH') }}</span><i aria-hidden="true">/</i><span :class="{ active: language === 'en' }">EN</span>
      </button>
    </header>

    <Transition name="toast"><div v-if="notice" class="toast" role="status">{{ notice }}</div></Transition>

    <main id="home">
      <section class="hero" aria-labelledby="hero-title">
        <div class="home-overview-window">
          <div class="overview-titlebar"><span>HOME / PROFESSOR PROFILE</span><i aria-hidden="true"></i></div>
          <div class="overview-main">
            <div class="hero-copy">
          <p class="eyebrow"><span class="status-dot"></span> {{ settings.department_name }} </p>
          <h1 id="hero-title">
            <span>{{ profile.name_zh }}</span>
            <strong>{{ profile.name_en }}</strong>
          </h1>
          <div class="positions">
            <span v-for="position in positions" :key="position.id as number" :data-admin-record="position.id">
              {{ localized(position, 'organization') }} · {{ localized(position, 'department') }} · {{ localized(position, 'title') }}
            </span>
            <span v-if="!positions.length && !loading">{{ ui('資料整理中', 'Content is being prepared') }}</span>
          </div>
          <p class="hero-intro typewriter" :aria-label="fullBio">
            <span aria-hidden="true">{{ displayedBio }}</span><i aria-hidden="true"></i>
          </p>
          <div class="hero-actions">
            <button class="pixel-button primary" type="button" @click="openAbout">{{ ui('關於我', 'About Me') }}</button>
            <button class="pixel-button primary" type="button" @click="openFields">{{ ui('研究領域', 'Research Areas') }}</button>
            <button class="pixel-button primary" type="button" @click="openInterests">{{ ui('研究興趣', 'Research Interests') }}</button>
          </div>
            </div>
            <div class="overview-metrics" :aria-label="ui('研究數據', 'Research metrics')">
              <article v-for="metric in researchMetrics" :key="metric.label"><strong>{{ metric.value }}</strong><span>{{ metric.label }}</span><small v-if="metric.note">{{ metric.note }}</small></article>
            </div>
          </div>
          <section class="overview-links" aria-labelledby="academic-links-title"><h2 id="academic-links-title">{{ ui('學術連結', 'Academic Links') }} <small>ACADEMIC LINKS</small></h2><nav><a v-for="link in academicLinks" :key="link[0]" :href="link[1]" target="_blank" rel="noreferrer">{{ link[0] }} <span>↗</span></a></nav></section>
          <section class="overview-news" aria-labelledby="latest-news-title"><header><h2 id="latest-news-title">{{ ui('最新消息', 'Latest News') }} <small>LATEST NEWS</small></h2><span>{{ ui('最新 3 則', 'Latest 3') }}</span></header><div class="overview-news-grid"><article v-for="item in latestNewsRows" :key="item.id as number" :class="{ 'is-placeholder': Number(item.id) < 0 }" role="button" tabindex="0" @click="openNewsDetail(item)" @keydown.enter="openNewsDetail(item)"><img v-if="item.photo" :src="String(item.photo)" :alt="localized(item, 'title')" /><div><time>{{ item.news_date }}</time><span v-if="item.category">{{ displayNewsCategory(item) }}</span><strong>{{ localized(item, 'title') }}</strong><p v-if="item.content">{{ localized(item, 'content') }}</p></div><a v-if="item.url" :href="String(item.url)" target="_blank" rel="noreferrer" :aria-label="ui('閱讀消息', 'Read news')" @click.stop>↗</a></article></div><button class="overview-news-more" type="button" @click="selectNav('News')">{{ ui('查看全部', 'View All') }} ↗</button></section>
        </div>

      </section>

      <div v-if="contentError" class="site-api-error" role="status">
        {{ ui('資料暫時無法載入。', 'Content is temporarily unavailable.') }}<button type="button" @click="loadContent">{{ ui('重新連線', 'Retry') }}</button>
      </div>

        <section id="research" class="content-page research-page" :class="{ 'is-active': currentPage === 'Research' }" aria-labelledby="research-title">
        <header class="content-heading">
          <p>04 / RESEARCH</p>
          <h2 id="research-title">{{ ui('研究方向', 'Research Directions') }}</h2>
          <span>RESEARCH THEMES & OUTCOMES</span>
        </header>
        <div class="summary-window">
          <div class="mini-window-title">{{ ui('研究成果摘要', 'Research Highlights') }}</div>
          <ul><li v-for="item in researchData.research_summaries || []" :key="item.id as number" :data-admin-record="item.id">{{ localized(item, 'text') }}</li></ul>
        </div>
        <div class="research-card-grid">
          <button v-for="(item, index) in researchData.research || []" :key="item.id as number" class="research-card" type="button" :style="{ '--card-index': index }" @click="openDetail('research', item)">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <img v-if="item.photo" class="research-card-photo" :src="String(item.photo)" :style="{ objectPosition: String(item.photo_position || '50% 50%') }" alt="" />
            <i v-else class="research-pixel-art" :class="`art-${(index % 5) + 1}`" aria-hidden="true"></i>
            <h3>{{ localized(item, 'title') }}</h3>
            <small>OPEN DETAIL ↗</small>
          </button>
        </div>
      </section>

      <section id="publications" class="content-page publications-page" aria-labelledby="publications-title">
        <header class="content-heading">
          <p>05 / PUBLICATIONS</p>
          <h2 id="publications-title">{{ ui('學術著作', 'Publications') }}</h2>
          <span>JOURNALS · CONFERENCES · PATENTS</span>
        </header>
        <div class="publication-showcase">
          <article v-for="group in publicationGroups" :key="group.key" class="publication-column">
            <header><span>{{ group.number }}</span><h3>{{ group.title }}</h3><b>{{ group.items.length }}</b></header>
            <Transition name="publication-swap" mode="out-in">
              <div v-if="activePublicationItem(group.key, group.items)" :key="activePublicationItem(group.key, group.items)?.id" class="publication-feature">
                <img v-if="activePublicationItem(group.key, group.items)?.graphicalAbstract" class="publication-feature-abstract" :src="activePublicationItem(group.key, group.items)?.graphicalAbstract" :alt="ui('圖像摘要', 'Graphical Abstract')" />
                <time>{{ activePublicationItem(group.key, group.items)?.year }}</time>
                <h4>{{ activePublicationItem(group.key, group.items)?.title }}</h4>
                <p>{{ activePublicationItem(group.key, group.items)?.meta }}</p>
                <small>{{ activePublicationItem(group.key, group.items)?.source }}</small>
              </div>
            </Transition>
                <button class="publication-all-button" type="button" @click="openPublicationGroup(group.key)">{{ ui('顯示全部', 'View All') }} <span>＋</span></button>
          </article>
        </div>
        <div class="publication-analytics">
          <article class="chart-panel"><h3>{{ ui('年度發表', 'Annual Publications') }}</h3><div class="bar-chart" :aria-label="ui('2021 至 2026 年期刊與研討會論文數量', 'Journal and conference papers from 2021 to 2026')"><div v-for="stat in publicationYearStats" :key="stat.year" class="bar-group"><div class="bars"><i class="bar journal-bar" :style="{ height: `${Math.max(8, stat.journal * 12)}px` }" :title="`${ui('期刊', 'Journal')} ${stat.journal}`"></i><i class="bar conference-bar" :style="{ height: `${Math.max(8, stat.conference * 8)}px` }" :title="`${ui('研討會', 'Conference')} ${stat.conference}`"></i></div><small>{{ stat.year }}</small></div></div><p class="chart-legend"><span class="journal-dot">{{ ui('期刊', 'Journal') }}</span><span class="conference-dot">{{ ui('研討會', 'Conference') }}</span></p></article>
          <article class="chart-panel"><h3>SCIE／EI {{ ui('比例', 'Ratio') }}</h3><div class="index-ratio-bar" role="img" :aria-label="ui('SCIE 與 EI 比例', 'SCIE and EI ratio')"><b class="scie-ratio" :style="{ width: `${indexSummary.total ? indexSummary.scie / indexSummary.total * 100 : 0}%` }"></b><i class="ei-ratio" :style="{ width: `${indexSummary.total ? indexSummary.ei / indexSummary.total * 100 : 0}%` }"></i></div><div class="index-ratio-legend"><span class="scie-legend">SCIE</span><span class="ei-legend">EI</span></div></article>
        </div>
        <section v-if="featuredPapers.length" class="featured-papers-section" aria-labelledby="featured-papers-title"><h3 id="featured-papers-title">{{ ui('精選論文', 'Featured Papers') }}</h3><div class="featured-paper-grid"><article v-for="paper in featuredPapers" :key="String(paper.id || '')" class="featured-paper-card"><img v-if="paper.graphical_abstract" :src="String(paper.graphical_abstract)" :alt="localized(paper, 'title')" /><div v-else class="abstract-placeholder">{{ ui('尚無圖像摘要', 'No graphical abstract available') }}</div><div><h3>{{ localized(paper, 'title') }}</h3><p>{{ localized(paper, 'authors') }}</p><a v-if="paper.doi_url" :href="String(paper.doi_url)" target="_blank" rel="noreferrer">DOI ↗</a></div></article></div></section>
      </section>

      <section id="projects" class="content-page projects-page" aria-labelledby="projects-title">
        <header class="content-heading">
          <p>06 / PROJECTS</p>
          <h2 id="projects-title">{{ ui('研究計畫', 'Research Projects') }}</h2>
          <span>FUNDED & COLLABORATIVE PROJECTS</span>
        </header>
        <div class="summary-window collaboration-window">
          <div class="mini-window-title">{{ ui('合作計畫摘要', 'Collaborative Project Highlights') }}</div>
          <ul><li v-for="item in projectsData.collaboration_projects || []" :key="item.id as number" :data-admin-record="item.id">{{ localized(item, 'text') }}</li></ul>
        </div>
        <div class="project-gantt" :aria-label="ui(`2022 至 ${timelineEndYear - 1} 研究計畫甘特圖`, `Research project timeline, 2022 to ${timelineEndYear - 1}`)"><div class="gantt-axis" :style="{ gridTemplateColumns: `35% repeat(${timelineYears.length}, 1fr)` }"><span class="gantt-axis-spacer" aria-hidden="true"></span><span v-for="year in timelineYears" :key="year">{{ year }}</span></div><i class="gantt-today-marker" :style="{ left: `calc(35% + ${todayTimelinePercent * 0.65}%)` }" :aria-label="ui('今天', 'Today')"><span>{{ ui('今天', 'Today') }}</span></i><article v-for="project in projectTimeline" :key="String(project.id || '')" class="gantt-row" role="button" tabindex="0" :aria-label="ui('查看計畫', 'View project') + ' · ' + localized(project, 'title')" @click="openDetail('project', project)" @keydown.enter="openDetail('project', project)" @keydown.space.prevent="openDetail('project', project)"><div class="gantt-label"><strong>{{ projectStatusLabel(project.status) }}</strong><span>{{ localized(project, 'title') }}</span></div><div class="gantt-track" :style="{ background: `repeating-linear-gradient(90deg, #f0f5f8 0, #f0f5f8 calc(${100 / timelineYears.length}% - 1px), #cfdae3 calc(${100 / timelineYears.length}% - 1px), #cfdae3 ${100 / timelineYears.length}%)` }"><i :class="projectFundingClass(project.funding_category)" :style="{ left: `${project.left}%`, width: `${project.width}%` }"></i></div></article></div><div class="gantt-legend" :aria-label="ui('計畫單位顏色圖例', 'Project funding legend')"><span v-for="legend in projectFundingLegend" :key="legend.key"><i :class="`funding-${legend.key}`"></i>{{ legend.label }}</span></div>
        <div v-if="projectDreamProjects.length" class="dream-projects"><h3>{{ ui('學海築夢', 'Dream Projects') }}</h3><div class="dream-project-grid"><button v-for="project in projectDreamProjects" :key="String(project.id || '')" class="dream-project-card" type="button" @click="openDetail('project', project)"><strong>{{ localized(project, 'period') }}</strong><h4>{{ localized(project, 'title') }}</h4><p>{{ localized(project, 'organization') }}</p><small>VIEW PROJECT ↗</small></button></div></div>
        <div ref="projectMarquee" class="project-marquee" :class="{ 'is-dragging': projectDragging }" :aria-label="ui('研究計畫輪播，移入可暫停，按住可左右拖曳', 'Research project carousel. Hover to pause or drag to scroll')" @pointerdown="startProjectDrag" @pointermove="moveProjectDrag" @pointerup="stopProjectDrag" @pointercancel="stopProjectDrag" @click.capture="guardProjectClick">
          <div class="project-track">
            <div v-for="copy in 3" :key="copy" class="project-set" :aria-hidden="copy !== 1 ? 'true' : undefined">
              <button v-for="(project, index) in projectTimeline" :key="`${copy}-${project.id}`" class="project-strip-card" type="button" :tabindex="copy !== 1 ? -1 : 0" @click="openDetail('project', project)">
                <img v-if="project.photo" class="project-card-photo" :src="String(project.photo)" :style="{ objectPosition: String(project.photo_position || '50% 50%') }" alt="" />
                <i v-else class="project-card-visual" :class="`visual-${(index % 4) + 1}`" aria-hidden="true"><span></span></i>
                <div class="project-card-copy"><p><span>{{ localized(project, 'period') }}</span><b>{{ projectStatusDisplay(project.status) }}</b></p><h3>{{ localized(project, 'title') }}</h3><small>VIEW PROJECT ↗</small></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="honors" class="content-page honors-page" :class="{ 'is-active': currentPage === 'Honors' }" aria-labelledby="honors-title">
        <header class="content-heading">
          <p>03 / HONORS & AWARDS</p>
          <h2 id="honors-title">{{ ui('榮譽獎項', 'Honors & Awards') }} <small v-if="language === 'zh'">Honors & Awards</small></h2>
          <span>RESEARCH · TEACHING · STUDENT ADVISING</span>
        </header>
        <div class="honor-stats">
          <article><strong>{{ (honorsData.honors || []).length }}</strong><span>{{ ui('獲獎總數', 'Total Awards') }}</span></article>
          <article><strong>{{ (honorsData.honors || []).filter((item) => item.category === 'research').length }}</strong><span>{{ ui('研究獎項', 'Research Awards') }}</span></article>
          <article><strong>{{ (honorsData.honors || []).filter((item) => item.category === 'teaching').length }}</strong><span>{{ ui('教學獎項', 'Teaching Awards') }}</span></article>
          <article><strong>{{ (honorsData.honors || []).filter((item) => item.category === 'student_advising').length }}</strong><span>{{ ui('指導學生獲獎', 'Student Advising Awards') }}</span></article>
        </div>
        <p class="honor-legend"><span class="honor-research">{{ ui('研究', 'Research') }}</span><span class="honor-teaching">{{ ui('教學', 'Teaching') }}</span><span class="honor-student">{{ ui('指導學生', 'Student Advising') }}</span></p>
        <div class="honor-years"><article v-for="year in [...new Set([2021, 2023, 2024, 2025, 2026, ...(honorsData.honors || []).map((item) => Number(item.year)).filter(Boolean)])].sort((a, b) => a - b)" :key="year" class="honor-column"><h3>{{ year }}</h3><div v-for="item in (honorsData.honors || []).filter((honor) => Number(honor.year) === year)" :key="item.id as number" class="honor-card" :class="`honor-${String(item.category || 'research')}`" :data-admin-record="item.id"><time v-if="item.month">{{ String(item.month).padStart(2, '0') }}</time><strong>{{ localized(item, 'name') }}</strong><small>{{ localized(item, 'organization') }}</small><p v-if="item.description">{{ localized(item, 'description') }}</p></div><p v-if="!(honorsData.honors || []).some((honor) => Number(honor.year) === year)" class="empty-note">{{ ui('尚無公開獎項', 'No published awards') }}</p></article></div>
      </section>

      <section id="news" class="content-page news-page" :class="{ 'is-active': currentPage === 'News' }" aria-labelledby="news-title">
        <header class="content-heading">
          <p>02 / NEWS</p>
          <h2 id="news-title">{{ ui('最新消息', 'Latest News') }} <small v-if="language === 'zh'">Latest News</small></h2>
          <span>INVITED TALKS · INTERNATIONAL · PUBLICATIONS · PROJECTS · TEACHING</span>
        </header>
        
        <div class="news-layout"><div class="news-pinned-stack"><article v-for="item in pinnedNewsRows" :key="item.id as number" class="news-card pinned" :data-admin-record="item.id" role="button" tabindex="0" @click="openNewsDetail(item)" @keydown.enter="openNewsDetail(item)"><img v-if="item.photo" :src="String(item.photo)" :alt="localized(item, 'title')" /><div class="news-card-copy"><time>{{ item.news_date }}</time><span>{{ displayNewsCategory(item) }}</span><h3>{{ Number(item.id) < 0 ? ui('尚無最新消息', 'No Latest News') : localized(item, 'title') }}</h3><p>{{ localized(item, 'content') }}</p><a v-if="item.url" :href="String(item.url)" target="_blank" rel="noreferrer" @click.stop>{{ ui('閱讀更多', 'Read More') }} ↗</a></div></article></div><div class="news-list"><div class="news-filters" role="tablist" :aria-label="ui('最新消息分類', 'News Categories')"><button v-for="category in newsCategories" :key="category" type="button" :class="{ active: newsFilter === category }" @click="newsFilter = category">{{ category === '全部' ? ui('全部', 'All') : newsCategoryLabel(category) }}</button></div><article v-for="item in newsListRows" :key="item.id as number" :data-admin-record="item.id" role="button" tabindex="0" @click="openNewsDetail(item)" @keydown.enter="openNewsDetail(item)"><time>{{ item.news_date }}</time><span>{{ displayNewsCategory(item) }}</span><strong>{{ localized(item, 'title') }}</strong></article><p v-if="newsFilter !== '全部' && !newsListRows.length" class="empty-note">{{ ui('尚無消息', 'No news in this category') }}</p></div></div>
      </section>

      <section id="experience" class="content-page experience-page" aria-labelledby="experience-title">
        <header class="content-heading">
          <p>07 / EXPERIENCE</p>
          <h2 id="experience-title">{{ ui('經歷', 'Experience') }}</h2>
          <span>CAREER · TEACHING · SERVICE</span>
        </header>
        <ol class="career-timeline" :class="{ 'is-active': currentPage === 'Experience' }">
          <li v-for="(item, index) in experienceData.experiences || []" :key="item.id as number" :data-admin-record="item.id" :style="{ '--career-index': index }">
            <time>{{ localized(item, 'period') }}</time><div><strong>{{ localized(item, 'position') }}</strong><p>{{ localized(item, 'organization') }}</p></div>
          </li>
        </ol>
        <div class="experience-explorer">
          <div class="experience-tabs" role="tablist" :aria-label="ui('其他經歷分類', 'Experience categories')">
            <button v-for="group in experienceGroups" :id="`experience-tab-${group.key}`" :key="group.key" type="button" role="tab" :aria-selected="activeExperienceGroup === group.key" :aria-controls="`experience-panel-${group.key}`" :class="{ active: activeExperienceGroup === group.key }" @click="activeExperienceGroup = group.key">
              <span>{{ group.number }}</span><strong>{{ group.title }}</strong><small>{{ activeExperienceGroup === group.key ? 'OPEN' : 'VIEW' }}</small>
            </button>
          </div>
          <Transition name="experience-swap" mode="out-in">
            <article :id="`experience-panel-${activeExperience.key}`" :key="activeExperience.key" class="experience-panel" role="tabpanel" :aria-labelledby="`experience-tab-${activeExperience.key}`">
              <header><span>{{ activeExperience.number }}</span><h3>{{ activeExperience.title }}</h3><small>{{ (experienceData.experience_items?.[activeExperience.key] || []).length }} RECORDS</small></header>
              <ul><li v-for="(item, index) in experienceData.experience_items?.[activeExperience.key] || []" :key="item.id as number" :data-admin-record="item.id" :style="{ '--item-index': index }">{{ localized(item, 'text') }}</li></ul>
            </article>
          </Transition>
        </div>
        <div class="service-analytics">
          <div class="service-chart"><h3>{{ ui('受邀演講年度統計', 'Invited Talks by Year') }}</h3><div class="service-bars"><div v-for="([year, count]) in invitedTalkYearStats" :key="year" class="service-bar"><span :style="{ height: `${Math.max(12, count * 24)}px` }"></span><strong>{{ count }}</strong><small>{{ year }}</small></div></div></div>
          <div class="service-chart"><h3>{{ ui('審稿期刊統計', 'Journal Reviews') }}</h3><ol class="review-stat-list"><li v-for="item in serviceStatsData.review_stats || []" :key="String(item.id || '')"><span>{{ localized(item, 'journal') }}</span><strong>{{ item.count }}</strong></li></ol></div>
          <div class="talk-list"><h3>{{ ui('精選受邀演講', 'Featured Invited Talks') }}</h3><article v-for="item in featuredTalks" :key="String(item.id || '')"><time>{{ item.talk_date }}</time><strong>{{ localized(item, 'title') }}</strong><small>{{ localized(item, 'organization') }}</small></article></div>
        </div>
      </section>

      <section id="international" class="content-page international-page" aria-labelledby="international-title">
        <header class="content-heading">
          <p>07 / INTERNATIONAL COLLABORATION</p>
          <h2 id="international-title">{{ ui('國際合作', 'International Collaboration') }}</h2>
          <span>FENG CHIA UNIVERSITY, TAIWAN</span>
        </header>
        <div class="international-stage" :aria-label="ui('臺灣逢甲大學 STARLAB', 'STARLAB at Feng Chia University, Taiwan')">
          <div class="international-hub"><strong>{{ ui('臺灣・逢甲大學 STARLAB', 'STARLAB') }}</strong><span>Feng Chia University, Taiwan</span></div>
        </div>
        <div class="international-status-legend" :aria-label="ui('合作狀態圖例', 'Cooperation Status Legend')">
          <span><i class="status-approved"></i>{{ internationalStatusLabel('approved') }}</span><span><i class="status-exchange"></i>{{ internationalStatusLabel('exchange') }}</span><span><i class="status-discussing"></i>{{ internationalStatusLabel('discussing') }}</span>
        </div>
        <div class="continent-grid">
          <article v-for="region in internationalRegionCards" :key="region.key" class="continent-card">
            <header><div><h3>{{ language === 'en' ? region.en : region.zh }}</h3><small>{{ language === 'en' ? region.zh : region.en }}</small></div><strong>{{ region.items.length }}</strong></header>
            <div v-for="item in region.items" :key="String(item.id || '')" class="partner-card" :class="`status-${String(item.status || 'discussing')}`" :data-admin-record="item.id">
              <small v-if="item.country || item.city" class="partner-location">{{ localized(item, 'country') }}{{ item.city ? ` · ${localized(item, 'city')}` : '' }}</small><strong>{{ localized(item, 'institution') }}</strong><small v-if="item.year" class="partner-year">{{ item.year }}</small><p>{{ localized(item, 'description') }}</p><a v-if="item.link" :href="String(item.link)" target="_blank" rel="noreferrer">{{ ui('相關連結 ↗', 'Related Link ↗') }}</a>
            </div>
            <p v-if="!region.items.length" class="empty-note">{{ ui('目前尚無公開合作資料', 'No published cooperation data') }}</p>
          </article>
        </div>
        <div v-if="internationalNotes.length" class="international-notes"><h3>{{ ui('補充說明', 'Additional Notes') }}</h3><p v-for="note in internationalNotes" :key="String(note.id || '')" :data-admin-record="note.id">{{ localized(note, 'description') }}</p></div>
        <div class="conference-footprints"><h3>{{ ui('國際會議足跡', 'International Conference Participation') }}</h3><a v-for="conference in internationalConferences" :key="String(conference.id || '')" :data-admin-record="conference.id" :href="conference.link ? String(conference.link) : undefined" :target="conference.link ? '_blank' : undefined" rel="noreferrer"><strong>{{ localized(conference, 'name') }}</strong><small>{{ [localized(conference, 'city'), conference.year].filter(Boolean).join(' · ') || ui('城市與年份待確認', 'City and year to be confirmed') }}</small></a><p v-if="!internationalConferences.length" class="empty-note">{{ ui('目前尚無公開會議資料', 'No published conference data') }}</p></div>
      </section>

      <section id="lab" class="content-page lab-page" aria-labelledby="lab-title">
        <header class="content-heading light">
          <p>08 / LAB</p>
          <h2 id="lab-title">{{ localized(labData.lab, 'name') }}</h2>
          <span>SEDIMENT · TECHNOLOGY · RESILIENCE</span>
        </header>
        <div class="lab-command">
          <div class="lab-signal" aria-hidden="true"><span></span><i></i><b>{{ settings.brand_name }}</b></div>
          <div class="lab-manifesto">
            <p class="lab-kicker">LABORATORY / ACTIVE RESEARCH BASE</p>
            <p class="lab-intro">{{ localized(labData.lab, 'description') }}</p>
            <div class="lab-stats" role="tablist" :aria-label="ui('實驗室資料分類', 'Lab categories')">
              <button v-for="group in labGroups" :id="`lab-tab-${group.key}`" :key="group.key" type="button" role="tab" :aria-selected="activeLabGroup === group.key" :aria-controls="`lab-panel-${group.key}`" :class="{ active: activeLabGroup === group.key }" @click="activeLabGroup = group.key">
                <span>{{ group.number }}</span>
                <strong>{{ group.key === 'topics' ? (labData.research_topics || []).length : group.key === 'members' ? (labData.lab_members || []).length : (labData.lab_activities || []).length }}</strong>
                {{ group.shortTitle }}
                <small>{{ activeLabGroup === group.key ? 'OPEN' : 'VIEW' }}</small>
              </button>
            </div>
          </div>
        </div>
        <div class="lab-explorer">
          <Transition name="lab-swap" mode="out-in">
            <article :id="`lab-panel-${activeLab.key}`" :key="activeLab.key" class="lab-panel" role="tabpanel" :aria-labelledby="`lab-tab-${activeLab.key}`">
              <header><span>{{ activeLab.number }}</span><h3>{{ activeLab.title }}</h3><small>{{ activeLab.label }}</small></header>
              <ol v-if="activeLab.key === 'topics'"><li v-for="(item, index) in labData.research_topics || []" :key="item.id as number" :data-admin-record="item.id" :style="{ '--lab-item-index': index }"><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ localized(item, 'topic') }}</li></ol>
              <div v-else-if="activeLab.key === 'members'" class="lab-member-list"><section v-for="group in [0, 1]" v-show="(labData.lab_members || []).some((member) => (labMemberIsAlumni(member) ? 1 : 0) === group)" :key="group" class="lab-member-group"><h4>{{ group === 0 ? ui('在學成員', 'Current Members') : ui('畢業成員', 'Alumni') }}</h4><div class="lab-member-cards"><article v-for="item in (labData.lab_members || []).filter((member) => (labMemberIsAlumni(member) ? 1 : 0) === group)" :key="String(item.id || '')" class="lab-member-card" :data-admin-record="item.id"><div class="member-avatar">{{ item.photo ? '' : String(item.name || '?').slice(0, 1) }}</div><div><strong>{{ item.name }}</strong><small v-if="item.role || item.cohort">{{ [localized(item, 'role'), localized(item, 'cohort')].filter(Boolean).join(' · ') }}</small><p v-if="item.research_topic">{{ localized(item, 'research_topic') }}</p></div></article></div></section></div>
              <div v-else class="lab-activity-cards"><article v-for="item in labData.lab_activities || []" :key="item.id as number" class="lab-activity-card" :data-admin-record="item.id"><img v-if="item.photo" :src="String(item.photo)" :alt="localized(item, 'title')" /><time>{{ item.activity_date }}</time><strong>{{ localized(item, 'title') }}</strong><p>{{ localized(item, 'description') }}</p><small>{{ localized(item, 'category') }}</small></article></div>
            </article>
          </Transition>
        </div>
      </section>

    </main>

    <footer id="contact" class="contact">
      <div class="contact-scene" aria-hidden="true"><span class="tower"></span><span class="tree one"></span><span class="tree two"></span></div>
      <div class="contact-content">
        <a v-if="profile.email" class="email-link" :href="`mailto:${profile.email}`">{{ profile.email }} <span>↗</span></a>
        <address>{{ localized(profile, 'address') }}</address>
      </div>
      <div class="footer-line">
        <span>© {{ new Date().getFullYear() }} {{ settings.footer_name }}</span>
        <div class="footer-actions">
          <button type="button" @click="selectNav('Home')">BACK TO TOP ↑</button>
        </div>
      </div>
    </footer>

    <Transition name="modal">
      <div v-if="publicationOpen" class="modal-backdrop" role="presentation" @mousedown.self="closePublicationGroup">
        <section class="fields-modal content-modal publication-window" role="dialog" aria-modal="true" aria-labelledby="publication-window-title">
          <header class="fields-modal-header">
            <div class="window-title"><h2 id="publication-window-title">{{ selectedPublicationGroup.title }}</h2></div>
            <div class="window-controls"><button type="button" :aria-label="`${ui('關閉', 'Close')} ${selectedPublicationGroup.title}`" @click="closePublicationGroup">×</button></div>
          </header>
          <ol class="publication-modal-list">
            <li v-for="item in selectedPublicationGroup.items" :key="item.id" :data-admin-record="item.id.split('-')[1]">
              <div v-if="item.graphicalAbstract" class="publication-item-visual">
                <img class="publication-item-photo" :src="item.graphicalAbstract" :alt="ui('圖像摘要', 'Graphical abstract')" />
                <button class="image-zoom-button" type="button" :aria-label="ui('放大圖片', 'Enlarge image')" :title="ui('放大圖片', 'Enlarge image')" @click="openPublicationPhoto(item)">⛶</button>
              </div>
              <time>{{ item.year }}</time>
              <div>
                <strong>{{ item.title }}</strong><p>{{ item.meta }}</p><small>{{ item.source }}</small>
                <div class="publication-item-actions">
                  <a v-if="item.url" :href="item.url" target="_blank" rel="noreferrer">DOI ↗</a>
                </div>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="enlargedPublicationPhoto" class="publication-photo-backdrop" role="presentation" @mousedown.self="closePublicationPhoto">
        <section class="publication-photo-dialog" role="dialog" aria-modal="true" :aria-label="`${enlargedPublicationPhoto.title} · ${ui('圖片預覽', 'Image preview')}`">
          <button type="button" :aria-label="ui('關閉圖片預覽', 'Close image preview')" @click="closePublicationPhoto">×</button>
          <img :src="enlargedPublicationPhoto.photo" :alt="`${enlargedPublicationPhoto.title} · ${ui('圖片', 'Image')}`" />
        </section>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="fieldsOpen" class="modal-backdrop" role="presentation" @mousedown.self="closeFields">
        <section class="fields-modal" role="dialog" aria-modal="true" aria-labelledby="fields-title">
          <header class="fields-modal-header">
            <div class="window-title">
              <h2 id="fields-title">{{ ui('研究領域', 'Research Areas') }}</h2>
            </div>
            <div class="window-controls">
              <button type="button" :aria-label="ui('關閉研究領域', 'Close research areas')" @click="closeFields">×</button>
            </div>
          </header>
          <div v-if="loadError" class="api-notice" role="status"><span>!</span>{{ ui('資料暫時無法載入。', 'Content is temporarily unavailable.') }}<button type="button" @click="loadHome">{{ ui('重新連線', 'Retry') }}</button></div>
          <ol class="field-list" :class="{ loading }">
            <li v-for="(area, index) in researchAreas" :key="area.id as number" :data-admin-record="area.id">
              <span>0{{ index + 1 }}</span><strong>{{ localized(area, 'title') }}</strong>
            </li>
            <li v-if="!researchAreas.length && !loading"><span>--</span><strong>{{ ui('資料整理中', 'Content is being prepared') }}</strong></li>
          </ol>
        </section>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="aboutOpen" class="modal-backdrop" role="presentation" @mousedown.self="closeAbout">
        <section class="fields-modal content-modal about-window" role="dialog" aria-modal="true" aria-labelledby="about-window-title">
          <header class="fields-modal-header">
            <div class="window-title"><h2 id="about-window-title">{{ ui('關於我', 'About Me') }}</h2></div>
            <div class="window-controls"><button type="button" :aria-label="ui('關閉關於我', 'Close About Me')" @click="closeAbout">×</button></div>
          </header>
          <div class="window-copy">
            <p v-if="aboutLoading">{{ ui('資料載入中...', 'Loading…') }}</p>
            <p v-for="paragraph in aboutParagraphs" v-else :key="paragraph">{{ paragraph }}</p>
            <p v-if="aboutError" class="api-notice">{{ ui('資料暫時無法載入。', 'Content is temporarily unavailable.') }}</p>
          </div>
        </section>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="interestsOpen" class="modal-backdrop" role="presentation" @mousedown.self="closeInterests">
        <section class="fields-modal content-modal interests-window" role="dialog" aria-modal="true" aria-labelledby="interests-window-title">
          <header class="fields-modal-header">
            <div class="window-title"><h2 id="interests-window-title">{{ ui('研究興趣', 'Research Interests') }}</h2></div>
            <div class="window-controls"><button type="button" :aria-label="ui('關閉研究興趣', 'Close research interests')" @click="closeInterests">×</button></div>
          </header>
          <ul class="window-interest-list">
            <li v-if="aboutLoading"><span>--</span><strong>{{ ui('資料載入中...', 'Loading…') }}</strong></li>
            <li v-for="(item, index) in researchInterests" v-else :key="item.id as number" :data-admin-record="item.id">
              <span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ localized(item, 'title') }}</strong>
            </li>
            <li v-if="aboutError"><span>!!</span><strong>{{ ui('資料暫時無法載入', 'Content is temporarily unavailable') }}</strong></li>
          </ul>
        </section>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="detailOpen" class="modal-backdrop" role="presentation" @mousedown.self="closeDetail">
        <section class="fields-modal content-modal detail-window" role="dialog" aria-modal="true" aria-labelledby="detail-window-title">
          <header class="fields-modal-header">
            <div class="window-title"><h2 id="detail-window-title">{{ detailType === 'research' ? ui('研究方向', 'Research Directions') : ui('研究計畫', 'Research Projects') }}</h2></div>
            <div class="window-controls"><button type="button" :aria-label="ui('關閉詳細資料', 'Close details')" @click="closeDetail">×</button></div>
          </header>
          <div class="detail-window-content">
            <div v-if="selectedDetail.photo && detailType === 'project'" class="detail-photo-wrap">
              <img class="detail-photo" :src="String(selectedDetail.photo)" :style="{ objectPosition: String(selectedDetail.photo_position || '50% 50%') }" alt="" />
              <button class="image-zoom-button" type="button" :aria-label="ui('放大圖片', 'Enlarge image')" :title="ui('放大圖片', 'Enlarge image')" @click="openDetailPhoto(selectedDetail)">⛶</button>
            </div>
            <img v-else-if="selectedDetail.photo" class="detail-photo" :src="String(selectedDetail.photo)" :style="{ objectPosition: String(selectedDetail.photo_position || '50% 50%') }" alt="" />
            <p class="detail-meta">{{ detailType === 'research' ? 'RESEARCH DETAIL' : localized(selectedDetail, 'period') }}</p>
            <h3>{{ localized(selectedDetail, 'title') }}</h3>
            <p v-if="detailType === 'research'">{{ localized(selectedDetail, 'description') }}</p>
            <template v-else>
              <p class="project-detail-summary">{{ projectSummary(selectedDetail) }}</p>
              <dl>
                <div><dt>{{ ui('委託單位', 'Commissioning Organization') }}</dt><dd>{{ localized(selectedDetail, 'organization') || '—' }}</dd></div>
                <div><dt>{{ ui('研究區位', 'Research Location') }}</dt><dd>{{ localized(selectedDetail, 'research_location') || '—' }}</dd></div>
                <div><dt>{{ ui('相關成果', 'Related Outcomes') }}</dt><dd><a v-if="selectedDetail.outcome_url" :href="String(selectedDetail.outcome_url)" target="_blank" rel="noreferrer">{{ ui('查看相關成果', 'View Related Outcomes') }} ↗</a><span v-else>—</span></dd></div>
              </dl>
            </template>
          </div>
        </section>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="newsDetailOpen" class="modal-backdrop" role="presentation" @mousedown.self="closeNewsDetail">
        <section class="fields-modal content-modal detail-window" role="dialog" aria-modal="true" aria-labelledby="news-detail-title">
          <header class="fields-modal-header"><div class="window-title"><h2 id="news-detail-title">{{ ui('最新消息', 'Latest News') }}</h2></div><div class="window-controls"><button type="button" :aria-label="ui('關閉消息詳細內容', 'Close news details')" @click="closeNewsDetail">×</button></div></header>
          <div class="detail-window-content news-detail-content"><img v-if="selectedNews.photo" class="detail-photo" :src="String(selectedNews.photo)" :alt="localized(selectedNews, 'title')" /><p class="detail-meta">{{ selectedNews.news_date }} · {{ displayNewsCategory(selectedNews) }}</p><h3>{{ localized(selectedNews, 'title') }}</h3><p>{{ localized(selectedNews, 'content') }}</p><a v-if="selectedNews.url" class="news-detail-link" :href="String(selectedNews.url)" target="_blank" rel="noreferrer">{{ ui('閱讀更多 ↗', 'Read More ↗') }}</a></div>
        </section>
      </div>
    </Transition>
  </div>
</template>


