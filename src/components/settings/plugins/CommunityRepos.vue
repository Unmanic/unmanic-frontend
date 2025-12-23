<template>
  <UnmanicDialogMenu
    ref="dialogRef"
    :title="$t('components.plugins.communityRepos')"
    @hide="onDialogHide"
  >
    <!-- CONTENT -->
    <div class="column full-height">

      <!-- LOADING SKELETON -->
      <div v-if="loading" class="q-pa-md">
        <div v-for="n in 5" :key="n" class="q-mb-md">
          <q-item class="shadow-1 rounded-borders">
            <q-item-section avatar>
              <q-skeleton type="QAvatar"/>
            </q-item-section>
            <q-item-section>
              <q-skeleton type="text" width="40%"/>
              <q-skeleton type="text" class="text-caption"/>
            </q-item-section>
          </q-item>
        </div>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="error" class="q-pa-md text-center text-negative">
        <q-icon name="error_outline" size="4em" class="q-mb-sm"/>
        <div>{{ error }}</div>
        <q-btn
          color="secondary"
          class="q-mt-md"
          :label="$t('buttons.retry')"
          @click="fetchForks"
        />
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="repos.length === 0" class="q-pa-md text-center text-grey-7">
        <q-icon name="search_off" size="4em" class="q-mb-sm"/>
        <div>{{ $t('components.plugins.noCommunityReposFound') }}</div>
      </div>

      <!-- REPO LIST -->
      <q-list v-else class="q-pa-sm">
        <q-item
          v-for="repo in repos"
          :key="repo.id"
          class="shadow-1 rounded-borders q-mb-sm"
        >
          <!-- ICON -->
          <q-item-section avatar top class="q-mt-sm">
            <q-avatar rounded size="50px">
              <img :src="repo.icon || repo.owner_avatar">
            </q-avatar>
          </q-item-section>

          <!-- INFO -->
          <q-item-section>
            <q-item-label class="text-weight-bold">
              {{ repo.name }}
              <q-badge v-if="repo.stars > 0" color="orange" text-color="white" align="top" class="q-ml-xs">
                <q-icon name="star" size="12px" class="q-mr-xs"/>
                {{ repo.stars }}
              </q-badge>
            </q-item-label>

            <q-item-label caption lines="2" class="text-grey-8">
              {{ repo.description }}
            </q-item-label>

            <q-item-label caption class="q-mt-xs text-grey-6" style="font-size: 0.75rem;">
              By {{ repo.author }} • {{ $t('components.settings.common.updated') }} {{ repo.pushed_at_formatted }}
            </q-item-label>
          </q-item-section>

          <!-- ACTIONS -->
          <q-item-section side top class="q-mt-sm">
            <q-btn
              round
              flat
              dense
              color="secondary"
              icon="add_circle"
              @click="addRepo(repo)"
            >
              <q-tooltip>{{ $t('tooltips.addRepository') }}</q-tooltip>
            </q-btn>
            <q-btn
              round
              flat
              dense
              color="grey"
              icon="open_in_new"
              type="a"
              :href="repo.html_url"
              target="_blank"
            >
              <q-tooltip>{{ $t('tooltips.viewOnGithub') }}</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

    </div>
  </UnmanicDialogMenu>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { date } from 'quasar'
import { useI18n } from 'vue-i18n'
import UnmanicDialogMenu from 'components/dialogs/standard/UnmanicDialogMenu.vue'

const emit = defineEmits(['hide', 'add-repo'])

const { t } = useI18n()

const dialogRef = ref(null)
const loading = ref(false)
const error = ref(null)
const repos = ref([])

// Initialize cache from localStorage
let repoCache = new Map()
try {
  const stored = localStorage.getItem('community_repo_cache')
  if (stored) {
    repoCache = new Map(JSON.parse(stored))
  }
} catch (e) {
  console.warn('Failed to load community repo cache', e)
}

const saveCacheToStorage = () => {
  try {
    const cacheArray = Array.from(repoCache.entries())
    localStorage.setItem('community_repo_cache', JSON.stringify(cacheArray))
  } catch (e) {
    console.warn('Failed to save community repo cache', e)
  }
}

const fetchForks = async () => {
  loading.value = true
  error.value = null
  repos.value = []

  try {
    let forks = []
    const now = Date.now()
    const forksCacheDuration = 10 * 60 * 1000 // 10 minutes
    const repoCacheDuration = 60 * 60 * 1000 // 1 hour

    const cachedForks = localStorage.getItem('community_forks_list_cache')
    let useCache = false
    if (cachedForks) {
      try {
        const cacheEntry = JSON.parse(cachedForks)
        if (now - cacheEntry.timestamp < forksCacheDuration) {
          forks = cacheEntry.data
          useCache = true
        }
      } catch (e) {
        console.warn('Failed to parse cached forks list', e)
      }
    }

    if (!useCache) {
      const response = await axios.get('https://api.github.com/repos/Unmanic/unmanic-plugins/forks', {
        params: {
          sort: 'stargazers',
          per_page: 100
        }
      })
      forks = response.data
      localStorage.setItem('community_forks_list_cache', JSON.stringify({
        data: forks,
        timestamp: now
      }))
    }

    forks.sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count
      }
      return new Date(b.pushed_at) - new Date(a.pushed_at)
    })

    const topForks = forks.slice(0, 50)

    const promises = topForks.map(async (fork) => {
      if (fork.full_name === 'Unmanic/unmanic-plugins') return null

      const rawBaseUrl = `https://raw.githubusercontent.com/${fork.owner.login}/${fork.name}/repo`
      const repoJsonUrl = `${rawBaseUrl}/repo.json`

      let repoData = {}
      const cacheKey = repoJsonUrl
      const cachedEntry = repoCache.get(cacheKey)

      if (cachedEntry && (now - cachedEntry.timestamp < repoCacheDuration)) {
        repoData = cachedEntry.data
      } else {
        try {
          const repoResponse = await axios.get(repoJsonUrl, { timeout: 5000 })
          repoData = repoResponse.data
          repoCache.set(cacheKey, {
            data: repoData,
            timestamp: now
          })
          saveCacheToStorage()
        } catch (e) {
          repoCache.set(cacheKey, {
            data: null,
            timestamp: now
          })
          saveCacheToStorage()
          return null
        }
      }

      if (!repoData) return null

      const config = repoData.repo || {}
      const pushedDate = new Date(fork.pushed_at)
      const formattedDate = date.formatDate(pushedDate, 'MMM D, YYYY')

      let description = config.description || fork.description || t('status.noDescription')
      if (description.trim() === 'Official plugins for the Unmanic application') {
        description = fork.description !== 'Official plugins for the Unmanic application' && fork.description
          ? fork.description
          : 'Community fork of unmanic-plugins'
      }

      return {
        id: config.id || fork.id,
        name: config.name || fork.full_name,
        author: fork.owner.login,
        owner_avatar: fork.owner.avatar_url,
        icon: config.icon,
        description: description,
        stars: fork.stargazers_count,
        pushed_at: fork.pushed_at,
        pushed_at_formatted: formattedDate,
        html_url: fork.html_url,
        repo_json_url: repoJsonUrl
      }
    })

    const results = await Promise.all(promises)
    repos.value = results.filter(r => r !== null)

  } catch (err) {
    console.error(err)
    if (err.response && err.response.status === 403) {
      error.value = t('components.plugins.rateLimitExceeded')
    } else {
      error.value = t('components.plugins.failedToLoadCommunityRepos')
    }
  } finally {
    loading.value = false
  }
}

const show = () => {
  dialogRef.value.show()
  fetchForks()
}

const hide = () => {
  dialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
}

const addRepo = (repo) => {
  emit('add-repo', repo.repo_json_url)
  hide()
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
</style>
