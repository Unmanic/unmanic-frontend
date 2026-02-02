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
import { ref } from 'vue'
import axios from 'axios'
import { date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import UnmanicDialogMenu from 'components/ui/dialogs/UnmanicDialogMenu.vue'

const emit = defineEmits(['hide', 'add-repo'])

const { t } = useI18n()

const dialogRef = ref(null)
const loading = ref(false)
const error = ref(null)
const repos = ref([])

const fetchForks = async () => {
  loading.value = true
  error.value = null
  repos.value = []

  try {
    const response = await axios.get(getUnmanicApiUrl('v2', 'plugins/repos/community'))
    const items = response.data.repos || []
    repos.value = items.map((repo) => {
      const pushedDate = repo.pushed_at ? new Date(repo.pushed_at) : null
      const formattedDate = pushedDate ? date.formatDate(pushedDate, 'MMM D, YYYY') : ''
      return {
        id: repo.repo_id,
        name: repo.repo_name,
        author: repo.repo_author,
        owner_avatar: repo.repo_icon,
        icon: repo.repo_icon,
        description: repo.repo_description || t('status.noDescription'),
        stars: repo.repo_stars || 0,
        pushed_at: repo.repo_pushed_at,
        pushed_at_formatted: formattedDate,
        html_url: repo.repo_html_url,
        repo_token: repo.repo_token,
        repo_json_url: repo.repo_json_url || repo.repo_url
      }
    })
  } catch (err) {
    console.error(err)
    if (err.response && err.response.status === 429) {
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
  emit('add-repo', repo.repo_token || repo.repo_json_url)
  hide()
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
</style>
