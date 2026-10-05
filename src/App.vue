<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Item = Record<string, string | number | null>
type HomeData = {
  profile?: Item
  positions?: Item[]
  research_areas?: Item[]
  navigation_items?: Item[]
  settings?: Record<string, string>
  content_groups?: Item[]
}
type AboutData = { profile?: Item; research_interests?: Item[] }
type ResearchData = { research?: Item[]; research_summaries?: Item[] }
type PublicationsData = { journal_papers?: Item[]; conference_papers?: Item[]; other_publications?: Item[]; patents?: Item[] }
type ProjectsData = { projects?: Item[]; collaboration_projects?: Item[] }
type ExperienceData = { experiences?: Item[]; experience_items?: Record<string, Item[]> }
type InternationalData = { visit_exchange?: Item[]; approved_cooperation?: Item[]; developing_cooperation?: Item[] }
type LabData = { lab?: Item; research_topics?: Item[]; lab_members?: Item[]; lab_activities?: Item[] }
type PublicationDisplay = { id: string; title: string; year: string; meta: string; source: string; url: string }

const home = ref<HomeData>({})
const about = ref<AboutData>({})
const researchData = ref<ResearchData>({})
const publicationsData = ref<PublicationsData>({})
const projectsData = ref<ProjectsData>({})
const experienceData = ref<ExperienceData>({})
const internationalData = ref<InternationalData>({})
const labData = ref<LabData>({})
const loading = ref(true)
const loadError = ref(false)
const aboutLoading = ref(false)
const aboutError = ref(false)
const contentLoading = ref(true)
const contentError = ref(false)
const currentPage = ref('Home')
const mobileNavOpen = ref(false)
const notice = ref('')
const fieldsOpen = ref(false)
const aboutOpen = ref(false)
const interestsOpen = ref(false)
const detailOpen = ref(false)
const publicationOpen = ref(false)
const selectedPublicationKey = ref('journal')
const publicationIndexes = ref<Record<string, number>>({ journal: 0, conference: 0, other: 0 })
const detailType = ref<'research' | 'project'>('research')
const selectedDetail = ref<Item>({})
const activeExperienceGroup = ref('professional_service')
const activeInternationalGroup = ref('visit_exchange')
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
const navItems = computed(() => (home.value.navigation_items ?? []).map((item) => String(item.name)))
const groupsFor = (section: string) => computed(() => (home.value.content_groups ?? [])
  .filter((item) => item.section === section)
  .map((item, index) => ({
    key: String(item.key),
    title: String(item.title),
    shortTitle: String(item.short_title || item.title),
    label: String(item.label || ''),
    number: String(index + 1).padStart(2, '0'),
  })))
const experienceGroups = groupsFor('experience')
const internationalGroups = groupsFor('international')
const labGroups = groupsFor('lab')
const publicationGroupLabels = groupsFor('publications')
const aboutProfile = computed(() => about.value.profile ?? {})
const researchInterests = computed(() => about.value.research_interests ?? [])
const aboutParagraphs = computed(() => {
  const text = String(aboutProfile.value.full_bio || '').trim()
  return text ? text.split(/\r?\n/).filter(Boolean) : []
})
const fullBio = computed(() => String(profile.value.short_bio || ''))
const emptyGroup = { key: '', title: '', shortTitle: '', label: '', number: '' }
const activeExperience = computed(() => experienceGroups.value.find((group) => group.key === activeExperienceGroup.value) ?? experienceGroups.value[0] ?? emptyGroup)
const activeInternational = computed(() => internationalGroups.value.find((group) => group.key === activeInternationalGroup.value) ?? internationalGroups.value[0] ?? emptyGroup)
const activeLab = computed(() => labGroups.value.find((group) => group.key === activeLabGroup.value) ?? labGroups.value[0] ?? emptyGroup)
const publicationTitle = (key: string) => publicationGroupLabels.value.find((group) => group.key === key)?.title || ''
const publicationGroups = computed(() => [
  {
    key: 'journal',
    title: publicationTitle('journal'),
    number: '01',
    items: (publicationsData.value.journal_papers || []).map((item) => ({
      id: `journal-${item.id}`,
      title: String(item.title || ''),
      year: String(item.year || ''),
      meta: String(item.authors || ''),
      source: String(item.journal || ''),
      url: String(item.doi_url || ''),
    })),
  },
  {
    key: 'conference',
    title: publicationTitle('conference'),
    number: '02',
    items: (publicationsData.value.conference_papers || []).map((item) => ({
      id: `conference-${item.id}`,
      title: String(item.title || ''),
      year: String(item.year || ''),
      meta: String(item.authors || ''),
      source: String(item.conference || ''),
      url: '',
    })),
  },
  {
    key: 'other',
    title: publicationTitle('other'),
    number: '03',
    items: [...(publicationsData.value.patents || []), ...(publicationsData.value.other_publications || [])].map((item) => ({
      id: `other-${item.id}-${item.patent_number || 'work'}`,
      title: String(item.title || ''),
      year: String(item.year || ''),
      meta: String(item.patent_number || item.description || ''),
      source: String(item.inventor_or_owner || ''),
      url: '',
    })),
  },
])
const selectedPublicationGroup = computed(() => publicationGroups.value.find((group) => group.key === selectedPublicationKey.value) ?? publicationGroups.value[0]!)

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
    startTyping(String(home.value.profile?.short_bio || ''))
  } catch {
    loadError.value = true
    startTyping('')
  } finally {
    loading.value = false
  }
}

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
    const endpoints = ['research', 'publications', 'projects', 'experience', 'international', 'lab']
    const responses = await Promise.all(endpoints.map((endpoint) => fetch(`/api/${endpoint}`)))
    if (responses.some((response) => !response.ok)) throw new Error('API response error')
    const [research, publications, projects, experience, international, lab] = await Promise.all(responses.map((response) => response.json()))
    researchData.value = research
    publicationsData.value = publications
    projectsData.value = projects
    experienceData.value = experience
    internationalData.value = international
    labData.value = lab
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

function startProjectDrag(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  const marquee = projectMarquee.value
  if (!marquee) return
  projectPointerStart = event.clientX
  projectScrollStart = marquee.scrollLeft
  projectDragged = false
  projectDragging.value = false
}

function moveProjectDrag(event: PointerEvent) {
  if (!projectMarquee.value || event.buttons === 0) return
  const distance = event.clientX - projectPointerStart
  if (Math.abs(distance) <= 5 && !projectDragged) return
  if (!projectDragged) {
    projectDragged = true
    projectDragging.value = true
    projectMarquee.value.setPointerCapture(event.pointerId)
  }
  projectMarquee.value.scrollLeft = projectScrollStart - distance
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

function openPublicationGroup(key: string) {
  selectedPublicationKey.value = key
  publicationOpen.value = true
  document.body.classList.add('modal-open')
}

function closePublicationGroup() {
  publicationOpen.value = false
  document.body.classList.remove('modal-open')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeFields()
    closeAbout()
    closeInterests()
    closeDetail()
    closePublicationGroup()
  }
}

onMounted(() => {
  loadHome()
  loadContent()
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', updateCurrentPageOnScroll, { passive: true })
  updateCurrentPageOnScroll()
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
  if (typingTimer) window.clearInterval(typingTimer)
  if (typingRestartTimer) window.clearTimeout(typingRestartTimer)
  if (publicationTimer) window.clearInterval(publicationTimer)
  publicationStepTimers.forEach((timer) => window.clearTimeout(timer))
  document.body.classList.remove('modal-open')
})
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <button class="brand" type="button" aria-label="回到首頁" @click="selectNav('Home')">
        <img class="brand-logo" src="/starlab_logo.png" :alt="settings.brand_name" />
      </button>

      <button class="menu-button" type="button" :aria-expanded="mobileNavOpen" @click="mobileNavOpen = !mobileNavOpen">
        MENU <span aria-hidden="true">{{ mobileNavOpen ? '×' : '☰' }}</span>
      </button>

      <nav :class="{ open: mobileNavOpen }" aria-label="主要導覽">
        <button
          v-for="item in navItems"
          :key="item"
          type="button"
          :class="{ active: item === currentPage }"
          :aria-current="item === currentPage ? 'page' : undefined"
          @click="selectNav(item)"
        >{{ item }}</button>
      </nav>
    </header>

    <Transition name="toast"><div v-if="notice" class="toast" role="status">{{ notice }}</div></Transition>

    <main id="home">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow"><span class="status-dot"></span> {{ settings.department_name }} </p>
          <h1 id="hero-title">
            <span>{{ profile.name_zh }}</span>
            <strong>{{ profile.name_en }}</strong>
          </h1>
          <div class="positions">
            <span v-for="position in positions" :key="position.id as number">
              {{ position.organization }} · {{ position.department }} · {{ position.title }}
            </span>
            <span v-if="!positions.length && !loading">資料整理中</span>
          </div>
          <p class="hero-intro typewriter" :aria-label="fullBio">
            <span aria-hidden="true">{{ displayedBio }}</span><i aria-hidden="true"></i>
          </p>
          <div class="hero-actions">
            <button class="pixel-button primary" type="button" @click="openAbout">關於我</button>
            <button class="pixel-button primary" type="button" @click="openFields">研究領域 </button>
            <button class="pixel-button primary" type="button" @click="openInterests">研究興趣</button>
          </div>
        </div>

      </section>

      <div v-if="contentError" class="site-api-error" role="status">
        資料暫時無法載入。<button type="button" @click="loadContent">重新連線</button>
      </div>

      <section id="research" class="content-page research-page" :class="{ 'is-active': currentPage === 'Research' }" aria-labelledby="research-title">
        <header class="content-heading">
          <p>03 / RESEARCH</p>
          <h2 id="research-title">研究方向</h2>
          <span>RESEARCH THEMES & OUTCOMES</span>
        </header>
        <div class="summary-window">
          <div class="mini-window-title">研究成果摘要</div>
          <ul><li v-for="item in researchData.research_summaries || []" :key="item.id as number">{{ item.text }}</li></ul>
        </div>
        <div class="research-card-grid">
          <button v-for="(item, index) in researchData.research || []" :key="item.id as number" class="research-card" type="button" :style="{ '--card-index': index }" @click="openDetail('research', item)">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <i class="research-pixel-art" :class="`art-${(index % 5) + 1}`" aria-hidden="true"></i>
            <h3>{{ item.title }}</h3>
            <small>OPEN DETAIL ↗</small>
          </button>
        </div>
      </section>

      <section id="publications" class="content-page publications-page" aria-labelledby="publications-title">
        <header class="content-heading">
          <p>04 / PUBLICATIONS</p>
          <h2 id="publications-title">學術著作</h2>
          <span>JOURNALS · CONFERENCES · PATENTS</span>
        </header>
        <div class="publication-showcase">
          <article v-for="group in publicationGroups" :key="group.key" class="publication-column">
            <header><span>{{ group.number }}</span><h3>{{ group.title }}</h3><b>{{ group.items.length }}</b></header>
            <Transition name="publication-swap" mode="out-in">
              <div v-if="activePublicationItem(group.key, group.items)" :key="activePublicationItem(group.key, group.items)?.id" class="publication-feature">
                <time>{{ activePublicationItem(group.key, group.items)?.year }}</time>
                <h4>{{ activePublicationItem(group.key, group.items)?.title }}</h4>
                <p>{{ activePublicationItem(group.key, group.items)?.meta }}</p>
                <small>{{ activePublicationItem(group.key, group.items)?.source }}</small>
              </div>
            </Transition>
            <button class="publication-all-button" type="button" @click="openPublicationGroup(group.key)">顯示全部 <span>＋</span></button>
          </article>
        </div>
      </section>

      <section id="projects" class="content-page projects-page" aria-labelledby="projects-title">
        <header class="content-heading">
          <p>05 / PROJECTS</p>
          <h2 id="projects-title">研究計畫</h2>
          <span>FUNDED & COLLABORATIVE PROJECTS</span>
        </header>
        <div class="summary-window collaboration-window">
          <div class="mini-window-title">合作計畫摘要</div>
          <ul><li v-for="item in projectsData.collaboration_projects || []" :key="item.id as number">{{ item.text }}</li></ul>
        </div>
        <div
          ref="projectMarquee"
          class="project-marquee"
          :class="{ 'is-dragging': projectDragging }"
          aria-label="研究計畫輪播，移入可暫停，按住可左右拖曳"
          @pointerdown="startProjectDrag"
          @pointermove="moveProjectDrag"
          @pointerup="stopProjectDrag"
          @pointercancel="stopProjectDrag"
          @click.capture="guardProjectClick"
        >
          <div class="project-track">
            <div v-for="copy in 2" :key="copy" class="project-set" :aria-hidden="copy === 2 ? 'true' : undefined">
              <button v-for="(project, index) in projectsData.projects || []" :key="`${copy}-${project.id}`" class="project-strip-card" type="button" :tabindex="copy === 2 ? -1 : 0" @click="openDetail('project', project)">
                <i class="project-card-visual" :class="`visual-${(index % 4) + 1}`" aria-hidden="true"><span></span></i>
                <div class="project-card-copy">
                  <p><span>{{ project.period }}</span><b>{{ project.status }}</b></p>
                  <h3>{{ project.title }}</h3>
                  <small>VIEW PROJECT ↗</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" class="content-page experience-page" aria-labelledby="experience-title">
        <header class="content-heading">
          <p>06 / EXPERIENCE</p>
          <h2 id="experience-title">經歷</h2>
          <span>CAREER · TEACHING · SERVICE</span>
        </header>
        <ol class="career-timeline" :class="{ 'is-active': currentPage === 'Experience' }">
          <li v-for="(item, index) in experienceData.experiences || []" :key="item.id as number" :style="{ '--career-index': index }">
            <time>{{ item.period }}</time><div><strong>{{ item.position }}</strong><p>{{ item.organization }}</p></div>
          </li>
        </ol>
        <div class="experience-explorer">
          <div class="experience-tabs" role="tablist" aria-label="其他經歷分類">
            <button v-for="group in experienceGroups" :id="`experience-tab-${group.key}`" :key="group.key" type="button" role="tab" :aria-selected="activeExperienceGroup === group.key" :aria-controls="`experience-panel-${group.key}`" :class="{ active: activeExperienceGroup === group.key }" @click="activeExperienceGroup = group.key">
              <span>{{ group.number }}</span><strong>{{ group.title }}</strong><small>{{ activeExperienceGroup === group.key ? 'OPEN' : 'VIEW' }}</small>
            </button>
          </div>
          <Transition name="experience-swap" mode="out-in">
            <article :id="`experience-panel-${activeExperience.key}`" :key="activeExperience.key" class="experience-panel" role="tabpanel" :aria-labelledby="`experience-tab-${activeExperience.key}`">
              <header><span>{{ activeExperience.number }}</span><h3>{{ activeExperience.title }}</h3><small>{{ (experienceData.experience_items?.[activeExperience.key] || []).length }} RECORDS</small></header>
              <ul><li v-for="(item, index) in experienceData.experience_items?.[activeExperience.key] || []" :key="item.id as number" :style="{ '--item-index': index }">{{ item.text }}</li></ul>
            </article>
          </Transition>
        </div>
      </section>

      <section id="international" class="content-page international-page" aria-labelledby="international-title">
        <header class="content-heading">
          <p>07 / INTERNATIONAL</p>
          <h2 id="international-title">國際交流</h2>
          <span>VISITS & COLLABORATION</span>
        </header>
        <div class="international-explorer">
          <div class="international-orbits" role="tablist" aria-label="國際交流分類">
            <button v-for="group in internationalGroups" :id="`international-tab-${group.key}`" :key="group.key" type="button" role="tab" :aria-selected="activeInternationalGroup === group.key" :aria-controls="`international-panel-${group.key}`" :class="{ active: activeInternationalGroup === group.key }" @click="activeInternationalGroup = group.key">
              <span>{{ group.number }}</span><strong>{{ group.shortTitle }}</strong>
            </button>
          </div>
          <Transition name="mindmap" mode="out-in">
            <article :id="`international-panel-${activeInternational.key}`" :key="activeInternational.key" class="international-panel" role="tabpanel" :aria-labelledby="`international-tab-${activeInternational.key}`">
              <ul class="mindmap-branches">
                <li v-for="(item, index) in internationalData[activeInternational.key as keyof InternationalData] || []" :key="item.id as number" :style="{ '--branch-index': index }">{{ item.text }}</li>
              </ul>
            </article>
          </Transition>
        </div>
      </section>

      <section id="lab" class="content-page lab-page" aria-labelledby="lab-title">
        <header class="content-heading light">
          <p>08 / LAB</p>
          <h2 id="lab-title">{{ labData.lab?.name }}</h2>
          <span>SEDIMENT · TECHNOLOGY · RESILIENCE</span>
        </header>
        <div class="lab-command">
          <div class="lab-signal" aria-hidden="true"><span></span><i></i><b>{{ settings.brand_name }}</b></div>
          <div class="lab-manifesto">
            <p class="lab-kicker">LABORATORY / ACTIVE RESEARCH BASE</p>
            <p class="lab-intro">{{ labData.lab?.description }}</p>
            <div class="lab-stats" role="tablist" aria-label="實驗室資料分類">
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
              <ol v-if="activeLab.key === 'topics'"><li v-for="(item, index) in labData.research_topics || []" :key="item.id as number" :style="{ '--lab-item-index': index }"><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ item.topic }}</li></ol>
              <ul v-else-if="activeLab.key === 'members'"><li v-for="item in labData.lab_members || []" :key="item.id as number">{{ item.name }}</li></ul>
              <ol v-else><li v-for="(item, index) in labData.lab_activities || []" :key="item.id as number" :style="{ '--lab-item-index': index }"><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ item.title }}</li></ol>
            </article>
          </Transition>
        </div>
      </section>
    </main>

    <footer id="contact" class="contact">
      <div class="contact-scene" aria-hidden="true"><span class="tower"></span><span class="tree one"></span><span class="tree two"></span></div>
      <div class="contact-content">
        <a v-if="profile.email" class="email-link" :href="`mailto:${profile.email}`">{{ profile.email }} <span>↗</span></a>
        <address>{{ profile.address }}</address>
      </div>
      <div class="footer-line"><span>© {{ new Date().getFullYear() }} {{ settings.footer_name }}</span><button type="button" @click="selectNav('Home')">BACK TO TOP ↑</button></div>
    </footer>

    <Transition name="modal">
      <div v-if="publicationOpen" class="modal-backdrop" role="presentation" @mousedown.self="closePublicationGroup">
        <section class="fields-modal content-modal publication-window" role="dialog" aria-modal="true" aria-labelledby="publication-window-title">
          <header class="fields-modal-header">
            <div class="window-title"><h2 id="publication-window-title">{{ selectedPublicationGroup.title }}</h2></div>
            <div class="window-controls"><button type="button" :aria-label="`關閉${selectedPublicationGroup.title}`" @click="closePublicationGroup">×</button></div>
          </header>
          <ol class="publication-modal-list">
            <li v-for="item in selectedPublicationGroup.items" :key="item.id">
              <time>{{ item.year }}</time>
              <div><strong>{{ item.title }}</strong><p>{{ item.meta }}</p><small>{{ item.source }}</small><a v-if="item.url" :href="item.url" target="_blank" rel="noreferrer">DOI ↗</a></div>
            </li>
          </ol>
        </section>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="fieldsOpen" class="modal-backdrop" role="presentation" @mousedown.self="closeFields">
        <section class="fields-modal" role="dialog" aria-modal="true" aria-labelledby="fields-title">
          <header class="fields-modal-header">
            <div class="window-title">
              <h2 id="fields-title">研究領域</h2>
            </div>
            <div class="window-controls">
              <button type="button" aria-label="關閉研究領域" @click="closeFields">×</button>
            </div>
          </header>
          <div v-if="loadError" class="api-notice" role="status"><span>!</span>資料暫時無法載入。<button type="button" @click="loadHome">重新連線</button></div>
          <ol class="field-list" :class="{ loading }">
            <li v-for="(area, index) in researchAreas" :key="area.id as number">
              <span>0{{ index + 1 }}</span><strong>{{ area.title }}</strong>
            </li>
            <li v-if="!researchAreas.length && !loading"><span>--</span><strong>資料整理中</strong></li>
          </ol>
        </section>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="aboutOpen" class="modal-backdrop" role="presentation" @mousedown.self="closeAbout">
        <section class="fields-modal content-modal about-window" role="dialog" aria-modal="true" aria-labelledby="about-window-title">
          <header class="fields-modal-header">
            <div class="window-title"><h2 id="about-window-title">關於我</h2></div>
            <div class="window-controls"><button type="button" aria-label="關閉關於我" @click="closeAbout">×</button></div>
          </header>
          <div class="window-copy">
            <p v-if="aboutLoading">資料載入中...</p>
            <p v-for="paragraph in aboutParagraphs" v-else :key="paragraph">{{ paragraph }}</p>
            <p v-if="aboutError" class="api-notice">資料暫時無法載入。</p>
          </div>
        </section>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="interestsOpen" class="modal-backdrop" role="presentation" @mousedown.self="closeInterests">
        <section class="fields-modal content-modal interests-window" role="dialog" aria-modal="true" aria-labelledby="interests-window-title">
          <header class="fields-modal-header">
            <div class="window-title"><h2 id="interests-window-title">研究興趣</h2></div>
            <div class="window-controls"><button type="button" aria-label="關閉研究興趣" @click="closeInterests">×</button></div>
          </header>
          <ul class="window-interest-list">
            <li v-if="aboutLoading"><span>--</span><strong>資料載入中...</strong></li>
            <li v-for="(item, index) in researchInterests" v-else :key="item.id as number">
              <span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ item.title }}</strong>
            </li>
            <li v-if="aboutError"><span>!!</span><strong>資料暫時無法載入</strong></li>
          </ul>
        </section>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="detailOpen" class="modal-backdrop" role="presentation" @mousedown.self="closeDetail">
        <section class="fields-modal content-modal detail-window" role="dialog" aria-modal="true" aria-labelledby="detail-window-title">
          <header class="fields-modal-header">
            <div class="window-title"><h2 id="detail-window-title">{{ detailType === 'research' ? '研究方向' : '研究計畫' }}</h2></div>
            <div class="window-controls"><button type="button" aria-label="關閉詳細資料" @click="closeDetail">×</button></div>
          </header>
          <div class="detail-window-content">
            <p class="detail-meta">{{ detailType === 'research' ? 'RESEARCH DETAIL' : selectedDetail.period }}</p>
            <h3>{{ selectedDetail.title }}</h3>
            <p v-if="detailType === 'research'">{{ selectedDetail.description }}</p>
            <template v-else>
              <dl>
                <div><dt>執行期間</dt><dd>{{ selectedDetail.period }}</dd></div>
                <div><dt>補助或合作機構</dt><dd>{{ selectedDetail.organization }}</dd></div>
                <div><dt>角色</dt><dd>{{ selectedDetail.role }}</dd></div>
                <div><dt>狀態</dt><dd>{{ selectedDetail.status }}</dd></div>
              </dl>
            </template>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>


