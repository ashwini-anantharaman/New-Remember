require('dotenv').config()
const OpenAI = require('openai')
const { resolveQuestionPrompt } = require('../lib/questionnaireQuestions')

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

function parseJson(content) {
  const clean = (content || '').replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

function buildMemoryCorpus(responses, contributors, subjectName, memorial) {
  const lines = []
  if (memorial?.biography?.trim()) {
    lines.push(`[Organizer biography]: ${memorial.biography.trim()}`)
  }

  const sorted = [...(responses || [])].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
  )

  for (const response of sorted) {
    const text = response.response_text?.trim()
    if (!text) continue
    const contributor = contributors?.find((c) => c.id === response.contributor_id)
    const who = contributor?.name || 'A contributor'
    const rel = contributor?.relationship_type || 'someone who knew them'
    const question = resolveQuestionPrompt(response)
    lines.push(`[${who} (${rel}) — Q: ${question}]\n${text}`)
  }

  if (!lines.length) {
    return `No written questionnaire responses yet for ${subjectName}.`
  }

  return lines.join('\n\n')
}

function buildPhotoVisionCorpus(analyzedPhotos = []) {
  if (!analyzedPhotos.length) return 'No photos were analyzed yet.'

  return analyzedPhotos
    .map((photo, index) => {
      const analysis = photo.analysis || {}
      return [
        `Photo ${index + 1} (id: ${photo.id}):`,
        analysis.scene ? `Scene: ${analysis.scene}` : null,
        analysis.setting ? `Setting: ${analysis.setting}` : null,
        analysis.life_moment_type ? `Moment type: ${analysis.life_moment_type}` : null,
        analysis.life_stage ? `Life stage: ${analysis.life_stage}` : null,
        analysis.visual_mood ? `Mood: ${analysis.visual_mood}` : null,
        analysis.tags?.length ? `Tags: ${analysis.tags.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join(' | ')
    })
    .join('\n')
}

function buildPhotoInventoryForThemes(analyzedPhotos = []) {
  return analyzedPhotos.map((photo) => ({
    photo_id: photo.id,
    scene: photo.analysis?.scene || '',
    setting: photo.analysis?.setting || '',
    life_moment_type: photo.analysis?.life_moment_type || '',
    life_stage: photo.analysis?.life_stage || '',
    tags: photo.analysis?.tags || [],
    visual_mood: photo.analysis?.visual_mood || '',
  }))
}

function normalizeThemePhotoIds(theme, validPhotoIds) {
  const ids = [
    ...(theme.supporting_photo_ids || []),
    ...(theme.photo_ids || []),
  ].filter((id) => validPhotoIds.has(id))
  return [...new Set(ids)]
}

function seedPhotoThemeAssignments(analyzedPhotos, themes) {
  const validPhotoIds = new Set(analyzedPhotos.map((photo) => photo.id))
  return analyzedPhotos.map((photo) => {
    const seeded = themes
      .filter((theme) => normalizeThemePhotoIds(theme, validPhotoIds).includes(photo.id))
      .map((theme) => theme.id)
    return {
      ...photo,
      matched_theme_ids: seeded,
    }
  })
}

function filterThemesWithPhotoSupport(themes, analyzedPhotos) {
  const supported = themes.filter((theme) =>
    analyzedPhotos.some((photo) => photo.matched_theme_ids?.includes(theme.id)),
  )
  return supported.length ? supported : themes
}

function clusterFallbackThemes(analyzedPhotos, subjectName) {
  if (!analyzedPhotos.length) {
    return [{
      id: 'theme_001',
      label: `${subjectName}'s photos`,
      category: 'other',
      summary: `Photos contributed in memory of ${subjectName}.`,
      discovery_angle: 'Contributor photos from their life.',
      prominence_score: 0.9,
      supporting_photo_ids: [],
      visual_keywords: [],
      matching_keywords: [],
      memory_anchors: [],
    }]
  }

  const groups = analyzedPhotos.reduce((acc, photo) => {
    const key = photo.analysis?.life_moment_type || photo.analysis?.setting || 'Everyday moments'
    if (!acc[key]) acc[key] = []
    acc[key].push(photo)
    return acc
  }, {})

  return Object.entries(groups).slice(0, 6).map(([name, photos], index) => ({
    id: `theme_${String(index + 1).padStart(3, '0')}`,
    label: String(name).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    category: 'daily_life',
    summary: `Photos showing ${String(name).replace(/_/g, ' ')}.`,
    discovery_angle: `Moments from ${subjectName}'s life captured in these photos.`,
    prominence_score: 0.5 + index * 0.05,
    supporting_photo_ids: photos.map((photo) => photo.id),
    visual_keywords: photos.flatMap((photo) => photo.analysis?.tags || []).slice(0, 8),
    matching_keywords: [],
    memory_anchors: [],
  }))
}

async function extractConstellationThemes(
  responses,
  contributors,
  subjectName,
  memorial,
  analyzedPhotos = [],
) {
  const memories = buildMemoryCorpus(responses, contributors, subjectName, memorial)
  const photoVision = buildPhotoVisionCorpus(analyzedPhotos)
  const photoInventory = buildPhotoInventoryForThemes(analyzedPhotos)
  const themeCount = Math.min(6, Math.max(3, Math.ceil(analyzedPhotos.length / 2) || 4))

  if (!openai) {
    const fallbackThemes = clusterFallbackThemes(analyzedPhotos, subjectName)
    return { themes: fallbackThemes, edges: [] }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2600,
      messages: [{
        role: 'user',
        content: `Design photo-grounded constellation themes for ${subjectName}'s memorial.

GOAL: Themes must describe what is actually visible in contributor photos, enriched with questionnaire details ONLY when those details match the same scene/activity/place.

Photo inventory (each theme MUST cite specific photo_ids from this list):
${JSON.stringify(photoInventory, null, 2)}

Photo vision summaries:
${photoVision}

Questionnaire memories (secondary — use only to add factual context when it matches a photo cluster):
${memories}

Create ${themeCount} themes. Each theme is a concrete visual-life chapter — NOT poetry.

LABEL rules (strict):
- Plain, specific, 2–6 words — describe what we SEE or a specific repeated activity/place
- GOOD: "Backyard barbecues", "Hospital visits", "Wedding day", "Fishing trips", "At the kitchen table", "Grandchildren visits"
- BAD: "Laughter in simple moments", "The warmth they carried", "Quiet devotion", "Legacy of love", "A life well lived"
- No metaphors, no abstract virtues, no words like: legacy, warmth, spirit, essence, journey, cherished, treasured

SUMMARY rules:
- 2 sentences max, factual and plain
- Sentence 1: what the photos in this theme show (setting, people, activity)
- Sentence 2: one concrete detail from questionnaire memories that matches those photos (if any); if none match, describe only what is visible — do not invent biography

Each theme MUST include:
- supporting_photo_ids: 1–4 photo_ids from the inventory that clearly belong together visually
- visual_keywords: 5–10 literal tags from those photos (objects, places, activities)
- matching_keywords: words from questionnaire text that match this visual cluster (can be empty)
- memory_anchors: only if questionnaire explicitly mentions the same place/activity; otherwise []
- prominence_score: higher when more photos and stronger memory+photo alignment

Every photo should appear in at least one theme when possible. Do not create a theme with zero supporting_photo_ids.

Return JSON only:
{
  "themes": [
    {
      "id": "theme_001",
      "label": "plain descriptive label",
      "category": "daily_life|relationships|celebrations|travel|work|home|other",
      "summary": "factual summary tied to visible photos",
      "discovery_angle": "one plain sentence on what these photos show about them",
      "prominence_score": 0.85,
      "supporting_photo_ids": ["photo uuid"],
      "visual_keywords": ["grill", "backyard", "summer"],
      "matching_keywords": ["optional memory words"],
      "memory_anchors": ["optional literal memory phrase"]
    }
  ],
  "edges": [
    {
      "source": "theme_001",
      "target": "theme_002",
      "relationship_type": "friend|family|colleague|community",
      "weight": 0.5,
      "label": "why these photo clusters connect"
    }
  ]
}`,
      }],
    })
    const parsed = parseJson(completion.choices[0].message.content)
    const validPhotoIds = new Set(analyzedPhotos.map((photo) => photo.id))
    const themes = (parsed.themes || []).slice(0, 6).map((theme, index) => ({
      ...theme,
      id: theme.id || `theme_${String(index + 1).padStart(3, '0')}`,
      prominence_score: Number(theme.prominence_score) || 0.55 + index * 0.05,
      supporting_photo_ids: normalizeThemePhotoIds(theme, validPhotoIds),
      matching_keywords: [
        ...(theme.visual_keywords || []),
        ...(theme.matching_keywords || []),
      ],
    }))
    const themeIds = new Set(themes.map((theme) => theme.id))
    const edges = (parsed.edges || [])
      .filter((edge) => themeIds.has(edge.source) && themeIds.has(edge.target))
      .slice(0, 8)
    return { themes, edges }
  } catch (err) {
    console.error('[ConstellationThemes] error:', err.message)
    throw err
  }
}

async function extractThemes(responses, contributors, subjectName, memorial, analyzedPhotos = []) {
  const result = await extractConstellationThemes(
    responses,
    contributors,
    subjectName,
    memorial,
    analyzedPhotos,
  )
  return result.themes
}

async function buildVisionPhotoAlbums(analyzedPhotos, contributors, subjectName) {
  if (!analyzedPhotos.length) return []

  const photoSummaries = analyzedPhotos.map((photo) => ({
    photo_id: photo.id,
    scene: photo.analysis?.scene || '',
    emotion: photo.analysis?.emotion || '',
    setting: photo.analysis?.setting || 'unknown',
    tags: photo.analysis?.tags || [],
    visual_mood: photo.analysis?.visual_mood || '',
    life_moment_type: photo.analysis?.life_moment_type || '',
    life_stage: photo.analysis?.life_stage || '',
  }))

  let albumDefinitions = []

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1600,
        messages: [{
          role: 'user',
          content: `Group these memorial photos of ${subjectName} into 3–8 photo albums.

IMPORTANT: Use ONLY visual information from the images — scene, setting, activity, mood, life moment type, tags.
Do NOT use questionnaire content, personality themes, or relationship labels.

Album names should describe what we SEE — e.g. "Outdoor Gatherings", "Celebrations & Milestones", "At Home", "Travel & Adventures", "Portraits & Quiet Moments", "Work & Community Events".

Rules:
- Every photo belongs to exactly ONE album
- Album names must be visually descriptive, not emotional biography themes
- Prefer 4–6 albums when there are enough distinct visual categories
- Minimum 1 photo per album; merge tiny groups into the closest visual match

Photos:
${JSON.stringify(photoSummaries, null, 2)}

Return JSON only:
{
  "albums": [
    {
      "id": "album_001",
      "name": "Outdoor Gatherings",
      "description": "one sentence on the visual theme",
      "photo_ids": ["uuid"]
    }
  ]
}`,
        }],
      })
      albumDefinitions = parseJson(completion.choices[0].message.content).albums || []
    } catch (err) {
      console.error('[VisionAlbums] error:', err.message)
    }
  }

  if (!albumDefinitions.length) {
    const bySetting = analyzedPhotos.reduce((groups, photo) => {
      const key = photo.analysis?.life_moment_type || photo.analysis?.setting || 'Other moments'
      if (!groups[key]) groups[key] = []
      groups[key].push(photo)
      return groups
    }, {})

    albumDefinitions = Object.entries(bySetting).map(([name, photos], index) => ({
      id: `album_${String(index + 1).padStart(3, '0')}`,
      name: name.replace(/_/g, ' '),
      photo_ids: photos.map((photo) => photo.id),
    }))
  }

  const photosById = Object.fromEntries(analyzedPhotos.map((photo) => [photo.id, photo]))
  const assignedPhotoIds = new Set()

  const albums = albumDefinitions
    .map((album) => {
      const albumPhotos = (album.photo_ids || [])
        .map((photoId) => photosById[photoId])
        .filter(Boolean)

      albumPhotos.forEach((photo) => assignedPhotoIds.add(photo.id))

      return {
        id: album.id,
        name: album.name,
        album_name: album.name,
        description: album.description || '',
        cover_photo_url: albumPhotos[0]?.storage_path || null,
        photo_count: albumPhotos.length,
        photos: albumPhotos.map((photo) => {
          const contributor = contributors?.find((item) => item.id === photo.contributor_id)
          return {
            id: photo.id,
            url: photo.storage_path,
            caption: photo.caption,
            year: photo.taken_at ? new Date(photo.taken_at).getFullYear().toString() : null,
            contributor_name: contributor?.name || 'A contributor',
          }
        }),
      }
    })
    .filter((album) => album.photo_count > 0)

  const unassignedPhotos = analyzedPhotos.filter((photo) => !assignedPhotoIds.has(photo.id))
  if (unassignedPhotos.length) {
    albums.push({
      id: 'album_misc',
      name: 'More Moments',
      album_name: 'More Moments',
      description: 'Additional photos grouped by visual similarity.',
      cover_photo_url: unassignedPhotos[0]?.storage_path || null,
      photo_count: unassignedPhotos.length,
      photos: unassignedPhotos.map((photo) => {
        const contributor = contributors?.find((item) => item.id === photo.contributor_id)
        return {
          id: photo.id,
          url: photo.storage_path,
          caption: photo.caption,
          year: photo.taken_at ? new Date(photo.taken_at).getFullYear().toString() : null,
          contributor_name: contributor?.name || 'A contributor',
        }
      }),
    })
  }

  return albums
}

const LIFE_STAGE_ORDER = {
  childhood: 1,
  youth: 2,
  young_adult: 3,
  middle_age: 4,
  senior: 5,
  unknown: 99,
}

function getMemorialYears(memorial) {
  const birthYear = memorial?.date_of_birth
    ? new Date(memorial.date_of_birth).getFullYear()
    : null
  const passingYear = memorial?.date_of_passing
    ? new Date(memorial.date_of_passing).getFullYear()
    : null
  return { birthYear, passingYear }
}

function getPhotoChronologySortKey(photo) {
  if (photo.taken_at) {
    return new Date(photo.taken_at).getTime()
  }

  const estimatedYear = photo.analysis?.estimated_year
  if (Number.isFinite(Number(estimatedYear))) {
    return Number(estimatedYear)
  }

  const range = photo.analysis?.estimated_year_range
  if (typeof range === 'string') {
    const match = range.match(/(\d{4})/)
    if (match) return Number(match[1])
  }

  const lifeStage = photo.analysis?.life_stage || 'unknown'
  return (LIFE_STAGE_ORDER[lifeStage] ?? 99) * 1000
}

async function orderPhotosChronologically(analyzedPhotos, subjectName, memorial) {
  if (!analyzedPhotos.length) return analyzedPhotos
  if (analyzedPhotos.length === 1) return analyzedPhotos

  const { birthYear, passingYear } = getMemorialYears(memorial)
  const photoSummaries = analyzedPhotos.map((photo) => ({
    photo_id: photo.id,
    taken_at: photo.taken_at || null,
    scene: photo.analysis?.scene || '',
    tags: photo.analysis?.tags || [],
    life_moment_type: photo.analysis?.life_moment_type || '',
    life_stage: photo.analysis?.life_stage || 'unknown',
    estimated_year: photo.analysis?.estimated_year ?? null,
    estimated_year_range: photo.analysis?.estimated_year_range ?? null,
    era_clues: photo.analysis?.era_clues || [],
  }))

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: `Order these memorial photos chronologically from earliest to latest in ${subjectName}'s life.

${birthYear ? `Birth year: ${birthYear}.` : 'Birth year unknown.'}
${passingYear ? `Passing year: ${passingYear}.` : 'Passing year unknown.'}

Use visual era clues (clothing, photo quality, setting), estimated years, life stages, and taken_at metadata when present. When uncertain, make your best guess from visual cues — childhood photos before wedding photos, etc.

Photos:
${JSON.stringify(photoSummaries, null, 2)}

Return JSON only:
{
  "ordered_photo_ids": ["photo_id in chronological order"],
  "reasoning": "one sentence on how you ordered them"
}`,
        }],
      })

      const parsed = parseJson(completion.choices[0].message.content)
      const orderedIds = parsed.ordered_photo_ids || []
      const byId = Object.fromEntries(analyzedPhotos.map((photo) => [photo.id, photo]))
      const ordered = orderedIds.map((id) => byId[id]).filter(Boolean)

      if (ordered.length === analyzedPhotos.length) {
        return ordered
      }
    } catch (err) {
      console.error('[ChronoOrder] error:', err.message)
    }
  }

  return [...analyzedPhotos].sort(
    (a, b) => getPhotoChronologySortKey(a) - getPhotoChronologySortKey(b),
  )
}

function splitTextIntoSegments(text, slideCount) {
  const sentences = (text || '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  if (!sentences.length || slideCount <= 0) {
    return Array.from({ length: slideCount }, () => '')
  }

  const segments = []
  const chunkSize = Math.max(1, Math.ceil(sentences.length / slideCount))

  for (let index = 0; index < slideCount; index += 1) {
    const start = index * chunkSize
    const chunk = sentences.slice(start, start + chunkSize).join(' ')
    segments.push(chunk || sentences[Math.min(start, sentences.length - 1)] || '')
  }

  return segments
}

function buildContributorMemoryCorpus(responses, contributor) {
  if (!contributor) return ''

  return (responses || [])
    .filter((response) => response.contributor_id === contributor.id && response.response_text?.trim())
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((response) => {
      const question = resolveQuestionPrompt(response)
      return `[Q: ${question}]\n${response.response_text.trim()}`
    })
    .join('\n\n')
}

function normalizeRelationshipValue(relationshipType) {
  return String(relationshipType || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, ' ')
}

function getAttributionExamples(subjectName, contributorName, relationshipType) {
  const subject = subjectName || 'them'
  const name = contributorName || 'A contributor'
  const rel = normalizeRelationshipValue(relationshipType)

  if (rel.includes('parent') || rel === 'mother' || rel === 'father' || rel === 'mom' || rel === 'dad') {
    const parentWord = rel.includes('father') || rel === 'dad' ? 'father' : rel.includes('mother') || rel === 'mom' ? 'mother' : 'parent'
    return [
      `In ${name}'s eyes,`,
      `To ${name}, ${subject} was`,
      `${subject}'s ${parentWord} ${name} remembers:`,
      `In ${subject}'s ${parentWord}'s words,`,
    ]
  }

  if (rel === 'child' || rel.includes('son') || rel.includes('daughter')) {
    return [
      `In ${name}'s perspective,`,
      `To ${name},`,
      `${subject}'s child ${name} shares:`,
      `From ${name}'s point of view,`,
    ]
  }

  if (rel === 'sibling' || rel.includes('brother') || rel.includes('sister')) {
    return [
      `In ${name}'s eyes,`,
      `${subject}'s sibling ${name} says:`,
      `To ${name},`,
      `From ${name}'s perspective,`,
    ]
  }

  if (rel === 'friend') {
    return [
      `In ${name}'s words,`,
      `To ${name}, ${subject} was`,
      `From ${name}'s perspective,`,
      `${subject}'s friend ${name} recalls:`,
    ]
  }

  if (rel === 'colleague') {
    return [
      `In ${name}'s view,`,
      `To ${name}, ${subject} was`,
      `From ${name}'s professional perspective,`,
      `${name} remembers:`,
    ]
  }

  return [
    `In ${name}'s perspective,`,
    `To ${name},`,
    `From ${name}'s point of view,`,
    `${name} shares:`,
  ]
}

function buildFallbackAttributedSegment(subjectName, brief, slideIndex = 0) {
  const examples = getAttributionExamples(
    subjectName,
    brief.contributor_name,
    brief.relationship_type,
  )
  const opener = examples[slideIndex % examples.length]
  const memories = brief.contributor_memories?.trim()

  if (memories && memories !== '(No questionnaire responses from this contributor)') {
    const excerpt = memories
      .replace(/\[Q:[^\]]+\]\n?/g, '')
      .split(/\n\n+/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)[0]

    if (excerpt) {
      const trimmed = excerpt.length > 220 ? `${excerpt.slice(0, 217).trim()}...` : excerpt
      return `${opener} ${trimmed}`
    }
  }

  const scene = brief.photo_scene ? ` This photo captures ${brief.photo_scene.toLowerCase()}.` : ''
  return `${opener} ${subjectName || 'They'} left a lasting impression on those who knew them.${scene}`
}

async function generatePhotoBiographySegments({
  subjectName,
  memorial,
  orderedPhotos,
  responses,
  contributors,
}) {
  const slideCount = orderedPhotos.length
  if (slideCount <= 0) return []

  const { birthYear, passingYear } = getMemorialYears(memorial)
  const organizerBio = memorial?.biography?.trim() || ''
  const allMemories = buildMemoryCorpus(responses, contributors, subjectName, memorial)

  const slideBriefs = orderedPhotos.map((photo, index) => {
    const contributor = contributors?.find((item) => item.id === photo.contributor_id)
    const contributorMemories = buildContributorMemoryCorpus(responses, contributor)

    return {
      slide_index: index + 1,
      photo_id: photo.id,
      contributor_id: contributor?.id || null,
      contributor_name: contributor?.name || 'A contributor',
      relationship_type: contributor?.relationship_type || 'friend',
      contributor_memories: contributorMemories || '(No questionnaire responses from this contributor)',
      photo_scene: photo.analysis?.scene || '',
      life_stage: photo.analysis?.life_stage || '',
      attribution_examples: getAttributionExamples(
        subjectName,
        contributor?.name || 'A contributor',
        contributor?.relationship_type,
      ),
    }
  })

  if (!openai) {
    return slideBriefs.map((brief, index) => ({
      text: buildFallbackAttributedSegment(subjectName, brief, index),
      contributor_id: brief.contributor_id,
      contributor_name: brief.contributor_name,
      relationship_type: brief.relationship_type,
    }))
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 3500,
      messages: [{
        role: 'user',
        content: `Write attributed biography captions for a memorial photo slideshow about ${subjectName}.

${birthYear ? `Born: ${birthYear}.` : ''}
${passingYear ? `Passed: ${passingYear}.` : ''}
${organizerBio ? `Organizer notes:\n${organizerBio}\n` : ''}

Each slide pairs ONE photo with ONE caption. The caption must come primarily from that slide's contributor's questionnaire answers. When read in order, the slides should feel like a life story moving forward in time — but each caption stays in that contributor's voice and perspective.

Slides (in chronological order):
${JSON.stringify(slideBriefs.map((brief) => ({
  slide_index: brief.slide_index,
  photo_id: brief.photo_id,
  contributor_name: brief.contributor_name,
  relationship_to_subject: brief.relationship_type,
  contributor_questionnaire: brief.contributor_memories,
  photo_scene: brief.photo_scene,
  life_stage: brief.life_stage,
  attribution_phrases_to_use: brief.attribution_examples,
})), null, 2)}

Full questionnaire archive (use only to fill gaps when a slide's contributor has no responses):
${allMemories}

Rules:
- Write exactly ${slideCount} segments, one per slide, in order
- Each segment: 2–4 sentences, roughly 40–90 words, warm and dignified
- PRIMARY source for slide N: that slide's contributor_questionnaire only
- If a contributor has no questionnaire, draw carefully from organizer notes or the full archive but still open with attribution to that contributor (e.g. "In Sally's perspective, those who knew ${subjectName} recall...")
- EVERY segment MUST open with clear perspective attribution using the contributor's name and/or relationship to ${subjectName}. Vary phrasing across slides. Examples:
  * "In Sally's eyes, ..."
  * "To William, ${subjectName} was ..."
  * "${subjectName}'s mother Sally remembers ..."
  * "In ${subjectName}'s mom's words, ..."
  * "From William's perspective, ..."
- Match attribution to relationship naturally (parent → "mom/dad/parent", child → "son/daughter/child", friend → "friend", etc.)
- Paraphrase questionnaire content — do not copy verbatim except short natural phrases inside the attribution
- Weave in photo_scene or life_stage when it fits
- Do not repeat the same opening attribution phrase on consecutive slides
- Only include facts supported by the source material

Return JSON only:
{
  "segments": [
    {
      "photo_id": "uuid",
      "contributor_id": "uuid or null",
      "text": "attributed caption"
    }
  ]
}`,
      }],
    })

    const parsed = parseJson(completion.choices[0].message.content)
    const byPhotoId = Object.fromEntries(
      (parsed.segments || []).map((segment) => [segment.photo_id, segment]),
    )

    return slideBriefs.map((brief, index) => {
      const generated = byPhotoId[brief.photo_id]
      const text = String(generated?.text || '').trim()

      return {
        text: text || buildFallbackAttributedSegment(subjectName, brief, index),
        contributor_id: generated?.contributor_id || brief.contributor_id,
        contributor_name: brief.contributor_name,
        relationship_type: brief.relationship_type,
      }
    })
  } catch (err) {
    console.error('[Biography] error:', err.message)
    return slideBriefs.map((brief, index) => ({
      text: buildFallbackAttributedSegment(subjectName, brief, index),
      contributor_id: brief.contributor_id,
      contributor_name: brief.contributor_name,
      relationship_type: brief.relationship_type,
    }))
  }
}

/** @deprecated use generatePhotoBiographySegments */
async function generateBiographySegments({ subjectName, memorial, memories, slideCount }) {
  if (!openai || slideCount <= 0) {
    const source = memorial?.biography?.trim() || memories
    return splitTextIntoSegments(source, slideCount)
  }

  try {
    const { birthYear, passingYear } = getMemorialYears(memorial)
    const organizerBio = memorial?.biography?.trim() || ''
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `Write a flowing third-person biography of ${subjectName} for a memorial photo slideshow.

${birthYear ? `Born: ${birthYear}.` : ''}
${passingYear ? `Passed: ${passingYear}.` : ''}
${organizerBio ? `Organizer notes:\n${organizerBio}\n` : ''}

Questionnaire memories from family and friends (source material — paraphrase, never quote verbatim):
${memories}

Rules:
- Write warm, dignified prose like a life story: birth/early life, personality, relationships, career, hobbies, accomplishments, and what they meant to others
- Only include facts supported by the memories or organizer notes; do not invent dates or events
- Split into exactly ${slideCount} consecutive segments that read as ONE biography when read in order
- Each segment: 2–4 sentences, roughly 40–90 words
- Segment 1 should open the story (e.g. who they were, where life began if known)
- Middle segments cover their life chapters
- Final segment should land on legacy and what they leave behind
- Do NOT repeat the same sentence across segments

Return JSON only:
{
  "segments": ["segment 1", "segment 2", "... exactly ${slideCount} strings"]
}`,
      }],
    })

    const parsed = parseJson(completion.choices[0].message.content)
    const segments = (parsed.segments || [])
      .map((segment) => String(segment || '').trim())
      .filter(Boolean)

    if (segments.length >= slideCount) {
      return segments.slice(0, slideCount)
    }

    const padded = [...segments]
    while (padded.length < slideCount) {
      padded.push(padded[padded.length - 1] || '')
    }
    return padded
  } catch (err) {
    console.error('[Biography] error:', err.message)
    const source = memorial?.biography?.trim() || memories
    return splitTextIntoSegments(source, slideCount)
  }
}

async function analyzePhotoWithVision(storageUrl, subjectName) {
  if (!openai) {
    return {
      scene: 'unknown',
      emotion: 'neutral',
      people_count: 0,
      setting: 'unknown',
      tags: [],
      visual_mood: '',
      life_moment_type: 'unknown',
      life_stage: 'unknown',
      estimated_year: null,
      estimated_year_range: null,
      era_clues: [],
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: storageUrl, detail: 'high' },
          },
          {
            type: 'text',
            text: `This photo is part of a memorial for ${subjectName}. Describe what is literally visible — people, place, activity, objects. Avoid abstract or poetic language.

Return JSON only:
{
  "scene": "one factual sentence: who/what/where",
  "emotion": "dominant feeling in the image",
  "people_count": number,
  "setting": "indoor|outdoor|home|celebration|medical|nature|work|unknown",
  "tags": ["5-10 concrete tags: objects, places, activities, clothing, food, furniture — NOT abstract virtues"],
  "visual_mood": "e.g. tender, joyful, quiet, formal",
  "life_moment_type": "e.g. everyday_routine, celebration, caregiving, travel, childhood, gathering, portrait, meal, hobby",
  "life_stage": "childhood|youth|young_adult|middle_age|senior|unknown",
  "estimated_year": 1985 or null if unknowable,
  "estimated_year_range": "1970-1980 or null",
  "era_clues": ["brief clues: film grain, clothing style, hair, technology, setting age"]
}`,
          },
        ],
      }],
    })
    return parseJson(response.choices[0].message.content)
  } catch (err) {
    console.error('[Vision] error:', err.message)
    return {
      scene: 'unknown',
      emotion: 'unknown',
      people_count: 0,
      setting: 'unknown',
      tags: [],
      visual_mood: '',
      life_moment_type: 'unknown',
      life_stage: 'unknown',
      estimated_year: null,
      estimated_year_range: null,
      era_clues: [],
    }
  }
}

async function assignPhotosToThemes(analyzedPhotos, themes, memories, subjectName) {
  if (!themes.length) return analyzedPhotos

  const photoSummaries = analyzedPhotos.map((p) => ({
    photo_id: p.id,
    contributor_id: p.contributor_id,
    already_assigned_theme_ids: p.matched_theme_ids || [],
    scene: p.analysis?.scene || '',
    setting: p.analysis?.setting || '',
    emotion: p.analysis?.emotion || '',
    tags: p.analysis?.tags || [],
    visual_mood: p.analysis?.visual_mood || '',
    life_moment_type: p.analysis?.life_moment_type || '',
    life_stage: p.analysis?.life_stage || '',
  }))

  const unassignedPhotoIds = new Set(
    analyzedPhotos
      .filter((photo) => !(photo.matched_theme_ids || []).length)
      .map((photo) => photo.id),
  )

  if (!openai) {
    return analyzedPhotos.map((photo) => {
      if (photo.matched_theme_ids?.length) return photo
      return {
        ...photo,
        matched_theme_ids: fallbackMatchPhotoToThemes(photo.analysis, themes),
      }
    })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1400,
      messages: [{
        role: 'user',
        content: `Assign memorial photos to the best-matching visual theme for ${subjectName}.

Themes (plain visual chapters — match on what is literally in the image):
${JSON.stringify(themes.map((t) => ({
  id: t.id,
  label: t.label,
  summary: t.summary,
  visual_keywords: t.visual_keywords || t.matching_keywords,
  supporting_photo_ids: t.supporting_photo_ids || [],
})), null, 2)}

Photos:
${JSON.stringify(photoSummaries, null, 2)}

Rules:
- VISUAL match is required: scene, setting, activity, objects, life_moment_type must align with the theme
- Each photo gets exactly ONE theme id
- Keep already_assigned_theme_ids unless clearly wrong
- Do NOT match on abstract mood alone without shared setting/activity
- Do NOT assign all photos to one theme

Return JSON only:
{ "assignments": [{ "photo_id": "uuid", "theme_ids": ["theme_001"], "reason": "brief visual reason" }] }`,
      }],
    })

    const parsed = parseJson(completion.choices[0].message.content)
    const validPhotoIds = new Set(analyzedPhotos.map((photo) => photo.id))
    const themeIds = new Set(themes.map((theme) => theme.id))
    const byPhoto = Object.fromEntries(
      (parsed.assignments || [])
        .filter((assignment) => validPhotoIds.has(assignment.photo_id))
        .map((assignment) => [
          assignment.photo_id,
          (assignment.theme_ids || []).slice(0, 1).filter((themeId) => themeIds.has(themeId)),
        ]),
    )

    return analyzedPhotos.map((photo) => {
      const suggested = byPhoto[photo.id] || []
      if (photo.matched_theme_ids?.length && !unassignedPhotoIds.has(photo.id)) {
        return {
          ...photo,
          matched_theme_ids: photo.matched_theme_ids.filter((themeId) => themeIds.has(themeId)),
        }
      }
      let ids = suggested
      if (!ids.length) ids = fallbackMatchPhotoToThemes(photo.analysis, themes)
      return { ...photo, matched_theme_ids: ids.filter((themeId) => themeIds.has(themeId)) }
    })
  } catch (err) {
    console.error('[PhotoThemeAssign] error:', err.message)
    return analyzedPhotos.map((photo) => {
      if (photo.matched_theme_ids?.length) return photo
      return {
        ...photo,
        matched_theme_ids: fallbackMatchPhotoToThemes(photo.analysis, themes),
      }
    })
  }
}

function fallbackMatchPhotoToThemes(photoAnalysis, themes) {
  if (!photoAnalysis || !themes.length) return themes[0] ? [themes[0].id] : []
  const photoText = [
    photoAnalysis.scene,
    photoAnalysis.setting,
    photoAnalysis.life_moment_type,
    photoAnalysis.life_stage,
    ...(photoAnalysis.tags || []),
  ]
    .join(' ')
    .toLowerCase()

  const scored = themes.map((theme) => {
    const keywords = [
      theme.label,
      ...(theme.visual_keywords || []),
      ...(theme.matching_keywords || []),
      ...(theme.memory_anchors || []),
    ]
    const score = keywords.filter((kw) => {
      const word = String(kw).toLowerCase()
      return word.length > 2 && photoText.includes(word)
    }).length
    return { id: theme.id, score }
  })
  scored.sort((a, b) => b.score - a.score)
  if (scored[0]?.score > 0) return [scored[0].id]

  const momentMatch = themes.find((theme) =>
    String(theme.label || '').toLowerCase().includes(photoAnalysis.life_moment_type || ''),
  )
  if (momentMatch) return [momentMatch.id]

  return [themes[0].id]
}

function buildVoiceStorySlides(voiceMoments = []) {
  return voiceMoments
    .filter((v) => v.intro_line && v.storage_path)
    .map((v, i) => ({
      order_index: 500 + i,
      slide_type: 'voice_clip',
      photo_id: null,
      photo_url: null,
      quote: v.intro_line,
      narration: v.intro_line,
      matched_quote: v.key_quote || null,
      audio_url: v.storage_path,
      storage_bucket: v.storage_bucket || null,
      clip_start_seconds: Number(v.clip_start_seconds) || 0,
      clip_end_seconds: Number(v.clip_end_seconds) || null,
      contributor_name: v.contributor_name || 'A contributor',
      contributor_title: v.contributor_title || null,
      relationship_type: v.relationship_type || '',
      theme_label: v.ai_category || 'Voice',
    }))
}

function interleaveVoiceSlides(photoSlides, voiceSlides) {
  if (!voiceSlides.length) return photoSlides
  if (!photoSlides.length) return voiceSlides

  const result = []
  let voiceIndex = 0
  const interval = Math.max(2, Math.floor(photoSlides.length / (voiceSlides.length + 1)))

  photoSlides.forEach((slide, index) => {
    result.push(slide)
    if ((index + 1) % interval === 0 && voiceIndex < voiceSlides.length) {
      result.push(voiceSlides[voiceIndex])
      voiceIndex += 1
    }
  })

  while (voiceIndex < voiceSlides.length) {
    result.push(voiceSlides[voiceIndex])
    voiceIndex += 1
  }

  return result.map((slide, index) => ({ ...slide, order_index: index + 1 }))
}

async function composeStorySlideshow({
  subjectName,
  memorial,
  themes,
  analyzedPhotos,
  responses,
  contributors,
  voiceMoments = [],
}) {
  const voiceSlides = buildVoiceStorySlides(voiceMoments)

  if (!analyzedPhotos.length) {
    return interleaveVoiceSlides([], voiceSlides)
  }

  const orderedPhotos = await orderPhotosChronologically(
    analyzedPhotos,
    subjectName,
    memorial,
  )
  const biographySegments = await generatePhotoBiographySegments({
    subjectName,
    memorial,
    orderedPhotos,
    responses,
    contributors,
  })

  const photoSlides = orderedPhotos.map((photo, index) => {
    const theme = themes.find((t) => photo.matched_theme_ids?.includes(t.id))
    const lifeStage = photo.analysis?.life_stage
    const lifeStageLabel = lifeStage && lifeStage !== 'unknown'
      ? lifeStage.replace(/_/g, ' ')
      : null
    const contributor = contributors?.find((item) => item.id === photo.contributor_id)
    const segment = biographySegments[index] || {}

    return {
      order_index: index + 1,
      slide_type: 'photo',
      photo_id: photo.id,
      photo_url: photo.storage_path,
      quote: segment.text || '',
      matched_quote: null,
      contributor_name: segment.contributor_name || contributor?.name || '',
      contributor_id: segment.contributor_id || contributor?.id || null,
      relationship_type: segment.relationship_type || contributor?.relationship_type || '',
      theme_label: lifeStageLabel || theme?.label || null,
    }
  })

  return interleaveVoiceSlides(photoSlides, voiceSlides)
}

async function composeContributorRelationshipInsight({
  contributor,
  responses,
  subjectName,
}) {
  const contributorResponses = (responses || []).filter(
    (response) =>
      response.contributor_id === contributor.id && response.response_text?.trim(),
  )

  const relationshipType = contributor.relationship_type || 'other'
  const contributorName = contributor.name || 'A contributor'

  if (!contributorResponses.length) {
    return {
      relationship_type: relationshipType,
      contributor_id: contributor.id,
      contributor_name: contributorName,
      extracted_quote: null,
      summary: null,
    }
  }

  const responseCorpus = contributorResponses
    .map((response) => {
      const question = resolveQuestionPrompt(response)
      return `[Q: ${question}]\n${response.response_text.trim()}`
    })
    .join('\n\n')

  if (!openai) {
    const firstResponse = contributorResponses[0]?.response_text?.trim() || ''
    return {
      relationship_type: relationshipType,
      contributor_id: contributor.id,
      contributor_name: contributorName,
      extracted_quote: firstResponse.slice(0, 120) || null,
      summary: firstResponse.slice(0, 400) || null,
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: `You are preparing a memorial relationship panel for ${subjectName}.

Contributor: ${contributorName}
Their relationship to ${subjectName}: ${relationshipType}

Their questionnaire responses:
${responseCorpus}

Create two pieces of content:

1. extracted_quote — Pull ONE short quote directly from their responses above. It can be a snippet of a sentence. Keep their original words as much as possible. Max 30 words.

2. summary — Write ONE warm paragraph (3–5 sentences) summarizing what ${subjectName} meant to ${contributorName} and what their ${relationshipType} relationship was like, based on what they shared. Paraphrase into flowing prose — do not copy responses word-for-word except in extracted_quote.

Return JSON only:
{
  "extracted_quote": "...",
  "summary": "..."
}`,
      }],
    })

    const parsed = parseJson(completion.choices[0].message.content)
    return {
      relationship_type: relationshipType,
      contributor_id: contributor.id,
      contributor_name: contributorName,
      extracted_quote: parsed.extracted_quote?.trim() || null,
      summary: parsed.summary?.trim() || null,
    }
  } catch (err) {
    console.error('[ContributorRelationshipInsight] error:', err.message)
    const firstResponse = contributorResponses[0]?.response_text?.trim() || ''
    return {
      relationship_type: relationshipType,
      contributor_id: contributor.id,
      contributor_name: contributorName,
      extracted_quote: firstResponse.slice(0, 120) || null,
      summary: firstResponse.slice(0, 400) || null,
    }
  }
}

async function composeRelationshipTypeInsight({
  relationshipType,
  responses,
  contributors,
  subjectName,
}) {
  const matchingContributors = contributors || []
  const contributorIds = new Set(matchingContributors.map((contributor) => contributor.id))
  const relevantResponses = (responses || []).filter(
    (response) =>
      contributorIds.has(response.contributor_id) && response.response_text?.trim(),
  )

  if (!relevantResponses.length) {
    return {
      relationship_type: relationshipType,
      extracted_quote: null,
      summary: null,
    }
  }

  const responseCorpus = relevantResponses
    .map((response) => {
      const contributor = matchingContributors.find((item) => item.id === response.contributor_id)
      const question = resolveQuestionPrompt(response)
      return `[${contributor?.name || 'Contributor'} — Q: ${question}]\n${response.response_text.trim()}`
    })
    .join('\n\n')

  if (!openai) {
    const firstResponse = relevantResponses[0]?.response_text?.trim() || ''
    return {
      relationship_type: relationshipType,
      extracted_quote: firstResponse.slice(0, 120) || null,
      summary: firstResponse.slice(0, 400) || null,
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: `You are preparing a memorial relationship panel for ${subjectName}.

Relationship type: ${relationshipType}

Questionnaire responses from people who identified as ${relationshipType}:
${responseCorpus}

Create two pieces of content:

1. extracted_quote — Pull ONE short quote directly from the responses above. It can be a snippet of a sentence from any contributor. Keep their original words as much as possible. Max 30 words.

2. summary — Write ONE warm paragraph (3–5 sentences) summarizing what ${relationshipType} relationships meant with ${subjectName}, based on what these contributors shared. Paraphrase into flowing prose — do not copy responses word-for-word except in extracted_quote.

Return JSON only:
{
  "extracted_quote": "...",
  "summary": "..."
}`,
      }],
    })

    const parsed = parseJson(completion.choices[0].message.content)
    return {
      relationship_type: relationshipType,
      extracted_quote: parsed.extracted_quote?.trim() || null,
      summary: parsed.summary?.trim() || null,
    }
  } catch (err) {
    console.error('[RelationshipInsight] error:', err.message)
    const firstResponse = relevantResponses[0]?.response_text?.trim() || ''
    return {
      relationship_type: relationshipType,
      extracted_quote: firstResponse.slice(0, 120) || null,
      summary: firstResponse.slice(0, 400) || null,
    }
  }
}

async function buildContributorRelationshipInsights(responses, contributors, subjectName) {
  const TOP_LEVEL_LABELS = {
    family: 'Family',
    friend: 'Friend',
    colleague: 'Colleague',
    other: 'Other',
  }

  const FAMILY_TYPES = new Set([
    'parent', 'child', 'sibling', 'partner / spouse', 'partner', 'spouse',
    'grandparent', 'grandchild', 'extended family', 'cousin', 'aunt/uncle',
    'aunt', 'uncle', 'family',
  ])

  function getTopLevelBucket(relationshipType) {
    const value = String(relationshipType || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]/g, ' ')
    if (FAMILY_TYPES.has(value) || value.includes('family')) return 'family'
    if (value === 'friend') return 'friend'
    if (value === 'colleague') return 'colleague'
    return 'other'
  }

  const typeInsights = {}
  const buckets = ['family', 'friend', 'colleague', 'other']

  for (const bucket of buckets) {
    const matchingContributors = (contributors || []).filter(
      (contributor) => getTopLevelBucket(contributor.relationship_type) === bucket,
    )
    if (!matchingContributors.length) continue

    const insight = await composeRelationshipTypeInsight({
      relationshipType: TOP_LEVEL_LABELS[bucket],
      responses,
      contributors: matchingContributors,
      subjectName,
    })

    typeInsights[bucket] = {
      ...insight,
      id: bucket,
      label: TOP_LEVEL_LABELS[bucket],
      count: matchingContributors.length,
    }
  }

  const contributorInsights = {}
  for (const contributor of contributors || []) {
    contributorInsights[contributor.id] = await composeContributorRelationshipInsight({
      contributor,
      responses,
      subjectName,
    })
  }

  return { contributorInsights, typeInsights }
}

function ensurePhotoThemeCoverage(analyzedPhotos = [], themes = []) {
  if (!themes.length || !analyzedPhotos.length) return analyzedPhotos

  return analyzedPhotos.map((photo) => {
    if (photo.matched_theme_ids?.length) {
      return {
        ...photo,
        matched_theme_ids: photo.matched_theme_ids.slice(0, 1),
      }
    }
    return {
      ...photo,
      matched_theme_ids: fallbackMatchPhotoToThemes(photo.analysis, themes),
    }
  })
}

async function buildConstellationNodes({
  themes = [],
  analyzedPhotos = [],
  responses = [],
  contributors = [],
}) {
  const nodes = []

  for (const theme of themes) {
    const themePhotos = analyzedPhotos.filter((photo) =>
      photo.matched_theme_ids?.includes(theme.id),
    )
    const themeQuotes = await composeThemeQuotes(theme, responses, contributors)
    const photoIds = themePhotos.map((photo) => photo.id)
    const photoPaths = themePhotos
      .slice(0, 6)
      .map((photo) => photo.storage_path)
      .filter(Boolean)
    const contributorIds = [
      ...new Set(themePhotos.map((photo) => photo.contributor_id).filter(Boolean)),
    ]

    nodes.push({
      id: theme.id,
      label: theme.label,
      summary: theme.summary,
      discovery_angle: theme.discovery_angle || null,
      category: theme.category || null,
      prominence_score: theme.prominence_score,
      matching_keywords: theme.matching_keywords || [],
      memory_anchors: theme.memory_anchors || [],
      quotes: themeQuotes,
      photo_ids: photoIds,
      photo_urls: photoPaths,
      cover_photo_url: photoPaths[0] || null,
      photo_count: photoIds.length,
      contributor_ids: contributorIds,
    })
  }

  return nodes
}

function normalizeConstellationEdges(constellationEdges = [], themes = []) {
  const themeIds = new Set(themes.map((theme) => theme.id))
  const validEdges = constellationEdges.filter(
    (edge) => themeIds.has(edge.source) && themeIds.has(edge.target),
  )

  if (validEdges.length) return validEdges.slice(0, 8)
  if (themes.length <= 1) return []

  return themes.slice(0, -1).map((theme, index) => ({
    source: theme.id,
    target: themes[index + 1].id,
    relationship_type: 'community',
    weight: 0.6,
  }))
}

async function composeThemeQuotes(theme, responses, contributors) {
  const keywords = [
    ...(theme.matching_keywords || []),
    ...(theme.memory_anchors || []),
    theme.label,
  ]
    .filter(Boolean)
    .map((keyword) => String(keyword).toLowerCase())

  const relevant = (responses || []).filter((response) => {
    const text = (response.response_text || '').toLowerCase()
    if (!text) return false
    return keywords.some((keyword) => text.includes(keyword))
  })

  const sourceResponses = relevant.length
    ? relevant
    : (responses || []).filter((response) => response.response_text?.trim())

  if (!sourceResponses.length) {
    return []
  }

  if (!openai) {
    return sourceResponses.slice(0, 3).map((response) => {
      const contributor = contributors?.find((item) => item.id === response.contributor_id)
      return {
        text: response.response_text?.slice(0, 200),
        contributor_id: response.contributor_id,
        contributor_name: contributor?.name || 'A contributor',
        relationship_type: contributor?.relationship_type || 'unknown',
      }
    })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Theme label: "${theme.label}"
Visual keywords: ${(theme.visual_keywords || theme.matching_keywords || []).join(', ') || 'none'}
Summary: ${theme.summary || ''}

Source responses (only use if they match this visual theme):
${sourceResponses.map((response) => {
  const contributor = contributors?.find((item) => item.id === response.contributor_id)
  return `[${contributor?.name || 'Contributor'}]: ${response.response_text}`
}).join('\n\n')}

Write 1–2 short factual quotes (max 35 words each) for this memorial theme.
- Plain language, no poetry or abstract virtues
- Quote must relate to what this theme's photos show OR a concrete memory that matches the theme label
- Paraphrase in clear prose — same meaning, not verbatim

Return JSON: { "quotes": [{ "text": "...", "contributor_name": "...", "relationship_type": "..." }] }`,
      }],
    })
    const parsed = parseJson(completion.choices[0].message.content)
    return (parsed.quotes || []).slice(0, 3).map((quote, index) => ({
      text: quote.text,
      contributor_id: sourceResponses[index]?.contributor_id,
      contributor_name: quote.contributor_name || 'A contributor',
      relationship_type: quote.relationship_type || 'unknown',
    }))
  } catch {
    return sourceResponses.slice(0, 3).map((response) => {
      const contributor = contributors?.find((item) => item.id === response.contributor_id)
      return {
        text: response.response_text?.slice(0, 200),
        contributor_id: response.contributor_id,
        contributor_name: contributor?.name || 'A contributor',
        relationship_type: contributor?.relationship_type || 'unknown',
      }
    })
  }
}

module.exports = {
  buildMemoryCorpus,
  buildPhotoVisionCorpus,
  extractThemes,
  extractConstellationThemes,
  buildVisionPhotoAlbums,
  analyzePhotoWithVision,
  assignPhotosToThemes,
  seedPhotoThemeAssignments,
  filterThemesWithPhotoSupport,
  orderPhotosChronologically,
  generateBiographySegments,
  generatePhotoBiographySegments,
  composeStorySlideshow,
  composeThemeQuotes,
  composeContributorRelationshipInsight,
  buildContributorRelationshipInsights,
  buildConstellationNodes,
  ensurePhotoThemeCoverage,
  normalizeConstellationEdges,
  fallbackMatchPhotoToThemes,
  buildVoiceStorySlides,
  interleaveVoiceSlides,
}
