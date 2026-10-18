<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type FieldOption = { value: string; label: string }
type Field = { name: string; label: string; type: string; required: boolean; options?: FieldOption[] }
type Resource = { key: string; label: string; singleton: boolean; sortable?: boolean; fields: Field[]; apiKey?: string; filterType?: string }
type Row = Record<string, string | number | null>

const token = ref(sessionStorage.getItem('admin-token') || '')
const username = ref('')
const password = ref('')
const currentUser = ref('')
const resources = ref<Resource[]>([])
const activeKey = ref('')
const rows = ref<Row[]>([])
const loading = ref(false)
const saving = ref(false)
const uploadingField = ref('')
const error = ref('')
const notice = ref('')
const editorOpen = ref(false)
const editingId = ref<number | null>(null)
const form = ref<Row>({})
const activeField = ref('')
const draggingId = ref<number | null>(null)
const orderBeforeDrag = ref<number[]>([])

const activeResource = computed(() => resources.value.find((item) => item.key === activeKey.value))
const resourceApiKey = computed(() => activeResource.value?.apiKey || activeKey.value)
const sortableResourceKeys = new Set([
  'positions', 'research_areas', 'research_interests', 'research', 'research_summaries',
  'journal_papers', 'conference_papers', 'other_publications', 'patents', 'projects',
  'other_works',
  'collaboration_projects', 'experiences', 'experience_items', 'international_items',
  'experience_professional_service', 'experience_teaching', 'experience_training',
  'international_visit_exchange', 'international_approved_cooperation', 'international_developing_cooperation',
  'research_topics', 'lab_members', 'lab_activities',
])
const reorderable = computed(() => activeResource.value?.sortable ?? sortableResourceKeys.has(activeKey.value))
const timeField = computed(() => activeResource.value?.fields.find((field) => field.name === 'year' || field.name === 'period')?.name || '')
const previewUrl = computed(() => {
  const params = new URLSearchParams({ 'admin-preview': resourceApiKey.value })
  if (activeResource.value?.filterType) params.set('admin-preview-type', activeResource.value.filterType)
  return `/?${params.toString()}`
})
const imagePreviewClass = computed(() => {
  if (activeKey.value === 'research') return 'research'
  if (activeKey.value === 'projects') return 'project'
  if (['journal_papers', 'conference_papers'].includes(activeKey.value)) return 'paper'
  return 'landscape'
})
const editorPreviewUrl = computed(() => {
  const params = new URLSearchParams({ 'admin-preview': resourceApiKey.value })
  if (editingId.value != null) params.set('admin-preview-id', String(editingId.value))
  if (activeResource.value?.filterType || form.value.type) params.set('admin-preview-type', String(activeResource.value?.filterType || form.value.type))
  if (activeField.value) params.set('admin-preview-field', activeField.value)
  return `/?${params.toString()}`
})
const navigationGroups = computed(() => {
  const definitions = [
    { label: 'Home', keys: ['profile', 'positions', 'research_areas', 'research_interests'] },
    { label: 'Research', keys: ['research_summaries', 'research'] },
    { label: 'Publications', keys: ['journal_papers', 'conference_papers', 'other_works'] },
    { label: 'Projects', keys: ['collaboration_projects', 'projects'] },
    { label: 'Experience', keys: ['experiences', 'experience_professional_service', 'experience_teaching', 'experience_training'] },
    { label: 'International', keys: ['international_visit_exchange', 'international_approved_cooperation', 'international_developing_cooperation'] },
    { label: 'Lab', keys: ['labs', 'research_topics', 'lab_members', 'lab_activities'] },
  ]
  return definitions.map((group) => ({
    ...group,
    resources: group.keys.map((key) => resources.value.find((resource) => resource.key === key)).filter((resource): resource is Resource => Boolean(resource)),
  }))
})

async function api(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)
  if (token.value) headers.set('Authorization', `Bearer ${token.value}`)
  if (options.body) headers.set('Content-Type', 'application/json')
  const response = await fetch(`/api/admin${path}`, { ...options, headers })
  if (response.status === 401 && path !== '/login') logout(false)
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || '操作失敗，請稍後再試')
  }
  return response.status === 204 ? null : response.json()
}

function announceContentUpdate() {
  localStorage.setItem('site-content-updated', String(Date.now()))
}

async function login() {
  error.value = ''
  loading.value = true
  try {
    const result = await api('/login', { method: 'POST', body: JSON.stringify({ username: username.value, password: password.value }) })
    token.value = result.token
    currentUser.value = result.username
    sessionStorage.setItem('admin-token', result.token)
    password.value = ''
    await loadResources()
  } catch (loginError) {
    error.value = loginError instanceof Error ? loginError.message : '登入失敗'
  } finally {
    loading.value = false
  }
}

async function restoreSession() {
  if (!token.value) return
  try {
    const session = await api('/session')
    currentUser.value = session.username
    await loadResources()
  } catch {
    logout(false)
  }
}

async function loadResources() {
  const loadedResources: Resource[] = await api('/resources')
  const normalized = loadedResources.map((resource) => ({
    ...resource,
    fields: resource.fields
      .filter((field) => resource.key !== 'profile' || field.name !== 'photo')
      .map((field) => field.name === 'photo' ? { ...field, type: 'image', label: field.label.replace('路徑／網址', '').replace('路徑', '').trim() || '照片' } : field),
  }))
  const experience = normalized.find((resource) => resource.key === 'experience_items')
  const international = normalized.find((resource) => resource.key === 'international_items')
  resources.value = normalized
    .filter((resource) => !['experience_items', 'international_items'].includes(resource.key))
    .concat(experience ? [
      { ...experience, key: 'experience_professional_service', label: '專業服務', apiKey: 'experience_items', filterType: 'professional_service', fields: experience.fields.map((field) => field.name === 'type' ? { ...field, type: 'hidden' } : field) },
      { ...experience, key: 'experience_teaching', label: '教學與人才培育', apiKey: 'experience_items', filterType: 'teaching', fields: experience.fields.map((field) => field.name === 'type' ? { ...field, type: 'hidden' } : field) },
      { ...experience, key: 'experience_training', label: '專業訓練', apiKey: 'experience_items', filterType: 'training', fields: experience.fields.map((field) => field.name === 'type' ? { ...field, type: 'hidden' } : field) },
    ] : [])
    .concat(international ? [
      { ...international, key: 'international_visit_exchange', label: '國際訪問與技術交流', apiKey: 'international_items', filterType: 'visit_exchange', fields: international.fields.map((field) => field.name === 'type' ? { ...field, type: 'hidden' } : field) },
      { ...international, key: 'international_approved_cooperation', label: '已核定國際合作', apiKey: 'international_items', filterType: 'approved_cooperation', fields: international.fields.map((field) => field.name === 'type' ? { ...field, type: 'hidden' } : field) },
      { ...international, key: 'international_developing_cooperation', label: '發展中的合作', apiKey: 'international_items', filterType: 'developing_cooperation', fields: international.fields.map((field) => field.name === 'type' ? { ...field, type: 'hidden' } : field) },
    ] : [])
  if (!activeKey.value && resources.value.length) activeKey.value = resources.value[0]!.key
  await loadRows()
}

async function loadRows() {
  if (!activeKey.value) return
  loading.value = true
  error.value = ''
  try {
    const loadedRows: Row[] = await api(`/${resourceApiKey.value}`)
    rows.value = activeResource.value?.filterType ? loadedRows.filter((row) => row.type === activeResource.value?.filterType) : loadedRows
  } catch (loadError) {
    error.value = loadError instanceof Error ? loadError.message : '讀取失敗'
  } finally {
    loading.value = false
  }
}

async function selectResource(key: string) {
  activeKey.value = key
  closeEditor()
  await loadRows()
}

function emptyForm(resource: Resource) {
  const values = Object.fromEntries(resource.fields.map((field) => [field.name, field.type === 'number' ? 0 : (field.options?.[0]?.value ?? '')]))
  if (resource.fields.some((field) => field.name === 'photo_position')) values.photo_position = '50% 50%'
  return values
}

function photoPositionPart(index: number) {
  const parts = String(form.value.photo_position || '50% 50%').split(/\s+/)
  return Number.parseInt(parts[index] || '50', 10)
}

function setPhotoPosition(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const parts = [photoPositionPart(0), photoPositionPart(1)]
  parts[index] = Number(input.value)
  form.value.photo_position = `${parts[0]}% ${parts[1]}%`
}

function fieldVisible(field: Field) {
  if (field.type === 'hidden') return false
  if (activeKey.value !== 'other_works') return true
  if (field.name === 'description') return form.value.kind !== 'patent'
  if (field.name === 'patent_number' || field.name === 'inventor_or_owner') return form.value.kind === 'patent'
  return true
}

function openCreate() {
  if (!activeResource.value) return
  editingId.value = null
  form.value = emptyForm(activeResource.value)
  if (activeResource.value.filterType) form.value.type = activeResource.value.filterType
  activeField.value = activeResource.value.fields[0]?.name || ''
  error.value = ''
  editorOpen.value = true
}

function openEdit(row: Row) {
  editingId.value = Number(row.id)
  form.value = Object.fromEntries(activeResource.value!.fields.map((field) => [field.name, row[field.name] ?? '']))
  activeField.value = activeResource.value!.fields[0]?.name || ''
  error.value = ''
  editorOpen.value = true
}

function closeEditor() {
  editorOpen.value = false
  editingId.value = null
  form.value = {}
  activeField.value = ''
}

async function uploadImage(event: Event, fieldName: string) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  activeField.value = fieldName
  error.value = ''
  if (file.size > 5 * 1024 * 1024) {
    error.value = '圖片大小不可超過 5 MB'
    input.value = ''
    return
  }
  uploadingField.value = fieldName
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('無法讀取圖片'))
      reader.readAsDataURL(file)
    })
    const data = dataUrl.split(',')[1] || ''
    const result = await api('/upload', { method: 'POST', body: JSON.stringify({ mimeType: file.type, data }) })
    form.value[fieldName] = result.path
  } catch (uploadError) {
    error.value = uploadError instanceof Error ? uploadError.message : '圖片上傳失敗'
  } finally {
    uploadingField.value = ''
    input.value = ''
  }
}

async function save() {
  if (!activeResource.value) return
  saving.value = true
  error.value = ''
  try {
    if (activeResource.value.filterType) form.value.type = activeResource.value.filterType
    const path = editingId.value == null ? `/${resourceApiKey.value}` : `/${resourceApiKey.value}/${editingId.value}`
    await api(path, { method: editingId.value == null ? 'POST' : 'PUT', body: JSON.stringify(form.value) })
    notice.value = editingId.value == null ? '資料已新增' : '資料已修改'
    closeEditor()
    await loadRows()
    announceContentUpdate()
    window.setTimeout(() => { notice.value = '' }, 3000)
  } catch (saveError) {
    error.value = saveError instanceof Error ? saveError.message : '儲存失敗'
  } finally {
    saving.value = false
  }
}

async function remove(row: Row) {
  if (!activeResource.value || activeResource.value.singleton) return
  const previewField = activeResource.value.fields.find((field) => field.required) || activeResource.value.fields[0]
  const preview = previewField ? String(row[previewField.name] || '') : ''
  if (!window.confirm(`確定要刪除「${preview.slice(0, 80)}」嗎？此動作無法復原。`)) return
  error.value = ''
  try {
    await api(`/${resourceApiKey.value}/${row.id}`, { method: 'DELETE' })
    notice.value = '資料已刪除'
    await loadRows()
    announceContentUpdate()
    window.setTimeout(() => { notice.value = '' }, 3000)
  } catch (deleteError) {
    error.value = deleteError instanceof Error ? deleteError.message : '刪除失敗'
  }
}

async function logout(callApi = true) {
  if (callApi && token.value) await api('/logout', { method: 'POST' }).catch(() => null)
  token.value = ''
  currentUser.value = ''
  resources.value = []
  rows.value = []
  sessionStorage.removeItem('admin-token')
}

function rowSummary(row: Row, resource: Resource) {
  return resource.fields
    .filter((field) => field.type !== 'number' && field.type !== 'hidden' && row[field.name])
    .slice(0, 2)
    .map((field) => String(row[field.name]))
    .join(' · ')
}

function startRowDrag(row: Row, event: DragEvent) {
  if (!reorderable.value) return
  draggingId.value = Number(row.id)
  orderBeforeDrag.value = rows.value.map((item) => Number(item.id))
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(row.id))
  }
}

function moveDraggedRow(target: Row) {
  if (draggingId.value == null || draggingId.value === Number(target.id)) return
  const from = rows.value.findIndex((item) => Number(item.id) === draggingId.value)
  const to = rows.value.findIndex((item) => Number(item.id) === Number(target.id))
  if (from < 0 || to < 0) return
  const [moved] = rows.value.splice(from, 1)
  if (moved) rows.value.splice(to, 0, moved)
}

async function finishRowDrag() {
  if (draggingId.value == null) return
  draggingId.value = null
  const ids = rows.value.map((item) => Number(item.id))
  if (ids.every((id, index) => id === orderBeforeDrag.value[index])) return
  await persistCurrentOrder(ids)
}

async function persistCurrentOrder(ids: number[]) {
  error.value = ''
  try {
    try {
      await api(`/${resourceApiKey.value}/reorder`, { method: 'PUT', body: JSON.stringify({ ids }) })
    } catch (reorderError) {
      if (!token.value) throw reorderError
      await Promise.all(rows.value.map((row, index) => api(`/${resourceApiKey.value}/${row.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...row, sort_order: index }),
      })))
    }
    notice.value = '排序已儲存'
    await loadRows()
    announceContentUpdate()
    window.setTimeout(() => { notice.value = '' }, 3000)
  } catch (sortError) {
    error.value = sortError instanceof Error ? sortError.message : '排序儲存失敗'
    await loadRows()
  }
}

function timeRank(value: string | number | null) {
  const text = String(value || '').trim()
  const westernYear = text.match(/(?:19|20)\d{2}/)?.[0]
  if (westernYear) {
    const month = Number(text.match(/(?:19|20)\d{2}\D{0,2}(\d{1,2})/)?.[1] || 0)
    return Number(westernYear) * 100 + month
  }
  const rocYear = Number(text.match(/\b(\d{3})\s*年/)?.[1] || 0)
  return rocYear ? (rocYear + 1911) * 100 : 0
}

async function sortByTime() {
  if (!timeField.value || rows.value.length < 2) return
  rows.value = rows.value
    .map((row, index) => ({ row, index }))
    .sort((a, b) => timeRank(b.row[timeField.value] ?? null) - timeRank(a.row[timeField.value] ?? null) || a.index - b.index)
    .map(({ row }) => row)
  await persistCurrentOrder(rows.value.map((row) => Number(row.id)))
}

onMounted(restoreSession)
</script>

<template>
  <main class="admin-page">
    <section v-if="!token" class="admin-login">
      <a class="admin-back" href="/">← 返回網站</a>
      <div class="admin-login-card">
        <p class="admin-eyebrow">CONTENT MANAGEMENT</p>
        <h1>管理員登入</h1>
        <form @submit.prevent="login">
          <label>帳號<input v-model="username" autocomplete="username" required /></label>
          <label>密碼<input v-model="password" type="password" autocomplete="current-password" required /></label>
          <p v-if="error" class="admin-error" role="alert">{{ error }}</p>
          <button class="admin-primary" :disabled="loading">{{ loading ? '登入中…' : '登入' }}</button>
        </form>
      </div>
    </section>

    <div v-else class="admin-layout">
      <aside class="admin-sidebar">
        <div><p class="admin-eyebrow">WEBSITE ADMIN</p><h1>內容管理</h1></div>
        <nav aria-label="管理項目">
          <section v-for="group in navigationGroups" :key="group.label" class="admin-nav-group">
            <h2>{{ group.label }}</h2>
            <button v-for="resource in group.resources" :key="resource.key" :class="{ active: resource.key === activeKey }" @click="selectResource(resource.key)">
              {{ resource.label }}
            </button>
          </section>
        </nav>
        <div class="admin-account"><span>{{ currentUser }}</span><button @click="logout()">登出</button><a href="/">查看網站 ↗</a></div>
      </aside>

      <section class="admin-content">
        <header class="admin-content-header">
          <div><p class="admin-eyebrow">MANAGE CONTENT</p><h2>{{ activeResource?.label }}</h2></div>
          <div class="admin-header-actions">
            <button v-if="timeField && rows.length > 1" class="admin-time-sort" @click="sortByTime">↓ 依時間排序</button>
            <button v-if="activeResource && !activeResource.singleton" class="admin-primary" @click="openCreate">＋ 新增資料</button>
          </div>
        </header>
        <div class="admin-workspace">
          <div class="admin-records">
            <p v-if="error" class="admin-error" role="alert">{{ error }}</p>
            <p v-if="notice" class="admin-notice" role="status">{{ notice }}</p>
            <p v-if="activeResource?.singleton" class="admin-hint">這是固定內容，可修改但不可新增或刪除。</p>
            <p v-else-if="reorderable" class="admin-hint">按住左側 ⠿ 並上下拖曳，即可調整網站上的排列順序；新增資料會放在最下面。</p>
            <div v-if="loading" class="admin-empty">資料載入中…</div>
            <div v-else-if="!rows.length" class="admin-empty">目前沒有資料。</div>
            <div v-else class="admin-list">
              <article v-for="row in rows" :key="Number(row.id)" class="admin-row" :class="{ dragging: draggingId === Number(row.id) }" @dragenter.prevent="moveDraggedRow(row)" @dragover.prevent @drop.prevent="finishRowDrag">
                <span v-if="reorderable" class="admin-drag-handle" draggable="true" role="button" aria-label="拖曳排序" title="按住並拖曳排序" @dragstart.stop="startRowDrag(row, $event)" @dragend="finishRowDrag">⠿</span>
                <div class="admin-row-copy"><p>{{ rowSummary(row, activeResource!) || '未命名資料' }}</p></div>
                <div class="admin-row-actions"><button @click="openEdit(row)">修改</button><button v-if="!activeResource?.singleton" class="danger" @click="remove(row)">刪除</button></div>
              </article>
            </div>
          </div>
          <aside v-if="activeResource" class="admin-site-preview admin-page-preview">
            <div><span>目前調整：{{ activeResource.label }}</span><small>紅框標示網站位置</small></div>
            <iframe :key="`page-${previewUrl}`" :src="previewUrl" :title="`${activeResource.label}網站位置預覽`" />
          </aside>
        </div>
      </section>
    </div>

    <div v-if="editorOpen && activeResource" class="admin-modal-backdrop" @mousedown.self="closeEditor">
      <section class="admin-editor" role="dialog" aria-modal="true" aria-labelledby="admin-editor-title">
        <header><div><p class="admin-eyebrow">{{ editingId == null ? 'CREATE' : 'EDIT' }}</p><h2 id="admin-editor-title">{{ editingId == null ? '新增' : '修改' }}{{ activeResource.label }}</h2></div><button class="admin-close" aria-label="關閉" @click="closeEditor">×</button></header>
        <div class="admin-editor-layout">
          <form @submit.prevent="save">
            <label v-for="field in activeResource.fields" v-show="fieldVisible(field)" :key="field.name">
              <span>{{ field.label }}<b v-if="field.required"> *</b></span>
              <div v-if="field.type === 'image'" class="admin-image-field">
                <img v-if="form[field.name]" :class="imagePreviewClass" :src="String(form[field.name])" :alt="`${field.label}預覽`" :style="{ objectPosition: String(form.photo_position || '50% 50%') }" />
                <div v-else class="admin-image-placeholder">尚未上傳照片</div>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" :disabled="uploadingField === field.name" @focus="activeField = field.name" @change="uploadImage($event, field.name)" />
                <small>支援 JPG、PNG、WebP、GIF，檔案上限 5 MB</small>
                <div v-if="form[field.name]" class="admin-position-controls">
                  <label><span>水平位置</span><input type="range" min="0" max="100" :value="photoPositionPart(0)" @input="setPhotoPosition(0, $event)" /></label>
                  <label><span>垂直位置</span><input type="range" min="0" max="100" :value="photoPositionPart(1)" @input="setPhotoPosition(1, $event)" /></label>
                </div>
                <button v-if="form[field.name]" type="button" class="admin-remove-image" @click="form[field.name] = ''">移除照片</button>
                <span v-if="uploadingField === field.name">圖片上傳中…</span>
              </div>
              <textarea v-else-if="field.type === 'textarea'" v-model="form[field.name]" :required="field.required" rows="4" @focus="activeField = field.name" />
              <select v-else-if="field.type === 'select'" v-model="form[field.name]" :required="field.required" :disabled="activeKey === 'other_works' && field.name === 'kind' && editingId != null" @focus="activeField = field.name"><option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option></select>
              <input v-else v-model="form[field.name]" :type="field.type" :required="field.required" @focus="activeField = field.name" />
            </label>
            <p v-if="error" class="admin-error" role="alert">{{ error }}</p>
            <div class="admin-editor-actions"><button type="button" @click="closeEditor">取消</button><button class="admin-primary" :disabled="saving">{{ saving ? '儲存中…' : '儲存變更' }}</button></div>
          </form>
          <aside class="admin-site-preview">
            <div><span>目前網站畫面</span><small>紅框為正在修改的區塊</small></div>
            <iframe :key="editorPreviewUrl" :src="editorPreviewUrl" :title="`${activeResource.label}目前網站預覽`" />
          </aside>
        </div>
      </section>
    </div>
  </main>
</template>
