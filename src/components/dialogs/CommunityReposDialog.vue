<template>
  <q-dialog
    ref="dialogRef"
    :maximized="$q.platform.is.mobile"
    :transition-show="$q.platform.is.mobile ? 'jump-right' : 'slide-left'"
    :transition-hide="$q.platform.is.mobile ? 'jump-left' : 'slide-right'"
    full-height
    position="right"
    @hide="onDialogHide"
  >
    <q-card
      v-touch-swipe.touch.right="hide"
      class="column no-wrap"
      :style="$q.platform.is.mobile ? 'width: 100vw; max-width: 100vw;' : 'width: 700px; max-width: 95vw;'"
    >
      <!-- HEADER -->
      <q-card-section class="bg-card-head dialog-sticky-header">
        <div class="row items-center no-wrap">
          <div v-if="$q.platform.is.mobile" class="col">
            <q-btn flat round dense color="grey-7" icon="arrow_back" @click="hide"/>
          </div>
          <div class="col">
            <div class="text-h6 text-blue-10">
              {{ $t('components.plugins.communityRepos') }}
            </div>
          </div>
          <div v-if="!$q.platform.is.mobile" class="col-auto">
            <q-btn flat round dense color="grey-7" icon="close" @click="hide">
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <!-- CONTENT -->
      <q-card-section class="col scroll q-pa-none">

        <!-- LOADING SKELETON -->
        <div v-if="loading" class="q-pa-md">
          <div v-for="n in 5" :key="n" class="q-mb-md">
            <q-item class="bg-white shadow-1 rounded-borders">
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
            class="bg-white shadow-1 rounded-borders q-mb-sm"
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
                color="secondary"
                icon="add_circle"
                @click="addRepo(repo)"
              >
                <q-tooltip>{{ $t('tooltips.addRepository') }}</q-tooltip>
              </q-btn>
              <q-btn
                round
                flat
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

      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import axios from 'axios'
import { date } from 'quasar'

export default {
  name: 'CommunityReposDialog',
  emits: ['ok', 'hide', 'add-repo'],
  data() {
    // Initialize cache from localStorage if available
    let initialCache = new Map()
    try {
      const stored = localStorage.getItem('community_repo_cache')
      if (stored) {
        initialCache = new Map(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('Failed to load community repo cache', e)
    }

    return {
      loading: false,
      error: null,
      repos: [],
      repoCache: initialCache
    }
  },
  methods: {
    show() {
      this.$refs.dialogRef.show()
      this.fetchForks()
    },
    hide() {
      this.$refs.dialogRef.hide()
    },
    onDialogHide() {
      this.$emit('hide')
    },

    async fetchForks() {
      this.loading = true
      this.error = null
      this.repos = []

      try {
        let forks = []
        const now = Date.now()
        const forksCacheDuration = 10 * 60 * 1000 // 10 minutes
        const repoCacheDuration = 60 * 60 * 1000 // 1 hour

        // 1. Check if we have a cached list of forks
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
          // Fetch Forks from GitHub
          const response = await axios.get('https://api.github.com/repos/Unmanic/unmanic-plugins/forks', {
            params: {
              sort: 'stargazers',
              per_page: 100
            }
          })
          forks = response.data
          // Save to cache
          localStorage.setItem('community_forks_list_cache', JSON.stringify({
            data: forks,
            timestamp: now
          }))
        }

        // 2. Client-side Sort: Stars (desc) -> Pushed At (desc)
        forks.sort((a, b) => {
          if (b.stargazers_count !== a.stargazers_count) {
            return b.stargazers_count - a.stargazers_count
          }
          return new Date(b.pushed_at) - new Date(a.pushed_at)
        })

        // 3. Process each fork
        const topForks = forks.slice(0, 50)

        const promises = topForks.map(async (fork) => {
          // Skip upstream if returned (unlikely for forks endpoint but good practice)
          if (fork.full_name === 'Unmanic/unmanic-plugins') return null

          // We assume the standard structure uses the 'repo' branch for the build output
          // URL Pattern: https://raw.githubusercontent.com/{owner}/{repo}/repo/repo.json
          const rawBaseUrl = `https://raw.githubusercontent.com/${fork.owner.login}/${fork.name}/repo`
          const repoJsonUrl = `${rawBaseUrl}/repo.json`

          let repoData = {}

          // Check cache
          const cacheKey = repoJsonUrl
          const cachedEntry = this.repoCache.get(cacheKey)

          if (cachedEntry && (now - cachedEntry.timestamp < repoCacheDuration)) {
            repoData = cachedEntry.data
          } else {
            try {
              const repoResponse = await axios.get(repoJsonUrl, { timeout: 5000 })
              repoData = repoResponse.data
              // Update cache with success
              this.repoCache.set(cacheKey, {
                data: repoData,
                timestamp: now
              })
              this.saveCacheToStorage()
            } catch (e) {
              // If repo.json missing, it's not a valid distribution repo or uses a non-standard format.
              // Cache the failure (null data) to avoid repeated 404s
              this.repoCache.set(cacheKey, {
                data: null,
                timestamp: now
              })
              this.saveCacheToStorage()
              return null
            }
          }

          // If retrieved data is null (from cache or fresh failure), skip
          if (!repoData) return null

          // Extract metadata from repo.json structure: { "repo": { ... }, "plugins": [...] }
          // Fallback to GitHub data if fields are missing in repo.json
          const config = repoData.repo || {}

          // Format Date
          const pushedDate = new Date(fork.pushed_at)
          const formattedDate = date.formatDate(pushedDate, 'MMM D, YYYY')

          // Determine Description
          let description = config.description || fork.description || this.$t('status.noDescription')
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
            icon: config.icon, // Can be empty, template handles fallback
            description: description,
            stars: fork.stargazers_count,
            pushed_at: fork.pushed_at,
            pushed_at_formatted: formattedDate,
            html_url: fork.html_url,
            repo_json_url: repoJsonUrl
          }
        })

        const results = await Promise.all(promises)
        this.repos = results.filter(r => r !== null)

      } catch (err) {
        console.error(err)
        if (err.response && err.response.status === 403) {
          this.error = this.$t('components.plugins.rateLimitExceeded')
        } else {
          this.error = this.$t('components.plugins.failedToLoadCommunityRepos')
        }
      } finally {
        this.loading = false
      }
    },

    addRepo(repo) {
      this.$emit('add-repo', repo.repo_json_url)
      this.hide()
    },

    saveCacheToStorage() {
      try {
        // Convert Map to Array for JSON serialization
        const cacheArray = Array.from(this.repoCache.entries())
        localStorage.setItem('community_repo_cache', JSON.stringify(cacheArray))
      } catch (e) {
        console.warn('Failed to save community repo cache', e)
      }
    }
  }
}
</script>
<style scoped>
.dialog-sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>
