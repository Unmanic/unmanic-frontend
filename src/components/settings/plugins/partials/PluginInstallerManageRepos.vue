<template>
  <component
    :is="$q.platform.is.mobile ? 'div' : 'q-btn-group'"
    :class="$q.platform.is.mobile ? 'column q-gutter-xs full-width' : ''"
  >
    <UnmanicStandardButton
      @click="reloadAllReposData()"
      v-if="$q.platform.is.mobile"
      class="full-width"
      :label="$t('components.plugins.refreshRepositories')"/>

    <UnmanicStandardButton
      @click="reloadAllReposData()"
      v-if="!$q.platform.is.mobile"
      :label="$t('components.plugins.refreshRepositories')"/>

    <UnmanicStandardButtonDropdown
      :label="$t('components.plugins.addRepository')"
      :class="$q.platform.is.mobile ? 'full-width' : ''">

      <div>
        <!--REPO DATA-->
        <div class="row no-wrap q-pa-md">
          <div class="column" :style="$q.platform.is.mobile ? 'width: 100%' : 'min-width:400px'">

            <q-btn
              color="secondary"
              icon="travel_explore"
              :label="$t('components.plugins.browseCommunityRepos')"
              class="q-mb-md"
              @click="openCommunityDialog"
            />

            <q-separator class="q-mb-md"/>

            <q-input
              filled
              type="textarea"
              v-model="newRepo"
              :label="$t('components.plugins.newRepository')"/>

            <q-btn
              color="secondary"
              @click="saveNewRepo()"
              :label="$t('navigation.save')"/>


          </div>
        </div>
      </div>
    </UnmanicStandardButtonDropdown>

    <UnmanicStandardButtonDropdown
      auto-close
      :label="$t('components.plugins.repoList')"
      :class="$q.platform.is.mobile ? 'full-width' : ''"
      :fit="$q.platform.is.mobile"
    >

      <div
        v-for="repo in repoList"
        :key="repo.id">

        <!-- Mobile View (lt-md) -->
        <div class="lt-md q-pa-sm">
          <q-item class="q-pa-none">
            <q-item-section avatar>
              <q-skeleton v-if="!repo.icon" type="QAvatar"/>
              <q-avatar v-else rounded>
                <img :src="repo.icon">
              </q-avatar>
            </q-item-section>

            <q-item-section style="overflow: hidden;">
              <q-item-label class="text-weight-bold">{{ repo.name }}</q-item-label>
              <q-item-label caption class="ellipsis" style="max-width: 200px;">
                 <span
                   class="cursor-pointer clickable"
                   @click="goToRepoSource(getRepoDisplayUrl(repo))">
                    {{ getRepoDisplayUrl(repo) }}
                 </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn
                color="negative"
                icon="delete"
                outline
                round
                dense
                @click="removeRepo(repo.path)"
              >
                <q-tooltip>{{ $t('tooltips.remove') }}</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
          <q-separator class="q-mt-sm"/>
        </div>

        <!-- Desktop View (gt-sm) -->
        <div class="gt-sm row no-wrap q-pa-md">
          <div class="column repo-info">
            <div class="text-h6 q-mb-md">{{ $t('headers.information') }}:</div>

            <q-list>

              <q-item>
                <q-item-section>
                  <q-item-label>{{ $t('components.plugins.repoName') }}</q-item-label>
                  <q-item-label caption>{{ repo.name }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ $t('components.plugins.repoSource') }}</q-item-label>
                  <q-item-label caption>
                    <span
                      class="cursor-pointer clickable"
                      @click="goToRepoSource(getRepoDisplayUrl(repo))">
                      {{ getRepoDisplayUrl(repo) }}
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>

            </q-list>

          </div>

          <q-separator vertical inset class="q-mx-lg"/>

          <div class="column items-center">
            <q-skeleton v-if="!repo.icon" width="72px" height="72px"/>
            <q-avatar v-else rounded size="72px">
              <img :src="repo.icon">
            </q-avatar>

            <q-btn
              outline
              icon="delete"
              class="q-ma-xs"
              color="negative"
              :label="$t('tooltips.remove')"
              size="sm"
              @click="removeRepo(repo.path)"
            />
          </div>
        </div>

      </div>

    </UnmanicStandardButtonDropdown>

    <CommunityRepos
      ref="communityRepos"
      @add-repo="saveNewRepo"
    />
  </component>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { openURL, useQuasar } from "quasar";
import CommunityRepos from "components/settings/plugins/CommunityRepos";
import UnmanicStandardButton from "components/ui/buttons/UnmanicStandardButton.vue";
import UnmanicStandardButtonDropdown from "components/ui/buttons/UnmanicStandardButtonDropdown.vue";

export default {
  components: { CommunityRepos, UnmanicStandardButton, UnmanicStandardButtonDropdown },
  data() {
    return {
      repoList: [],
      newRepo: ''
    }
  },
  methods: {
    goToRepoSource: function (url) {
      openURL(
        url,
        null
      )
    },
    getRepoInfo: function () {
      // Fetch from server
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'plugins/repos/list'),
      }).then((response) => {
        // Set returned data from server results
        let repos = [];
        for (let i = 0; i < response.data.repos.length; i++) {
          let repo = response.data.repos[i];
          repos[repos.length] = {
            id: repo.id,
            name: repo.name,
            icon: repo.icon,
            path: repo.path,
            repo_html_url: repo.repo_html_url,
          }
        }

        // Clear out existing data and add new
        this.repoList = repos
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Failed to fetch the list of plugin repos.',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    },
    updateRepoList: function (updatedReposList) {
      // POST that list to the API
      let data = {
        repos_list: updatedReposList,
      }
      return axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/repos/update'),
        data: data
      })
    },
    reloadAllReposData: function () {
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/repos/reload'),
      }).then((response) => {
        // Notify success
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('notifications.reposRefreshSuccess'),
          icon: 'check_circle',
          actions: [{ icon: 'close', color: 'white' }]
        })

        // Reload the listed plugins
        this.getRepoInfo();

        // Emit a reload event due to repo update
        this.$emit('repoReloaded')
      }).catch(() => {
        this.$q.notify({
          color: 'warning',
          position: 'top',
          message: this.$t('notifications.reposRefreshFailure'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    },
    saveNewRepo: function (repoUrl = null) {
      const urlToAdd = (typeof repoUrl === 'string') ? repoUrl : this.newRepo;

      if (urlToAdd.length > 0) {
        let updatedReposList = []

        // Check if urlToAdd already exists in repo list
        for (let i = 0; i < this.repoList.length; i++) {
          let repoPath = this.repoList[i].path;
          if (urlToAdd.trim() === repoPath) {
            this.$q.notify({
              color: 'negative',
              position: 'top',
              message: this.$t('notifications.repoAlreadyExists') + ' "' + urlToAdd.trim() + '"',
              icon: 'report_problem',
              actions: [{ icon: 'close', color: 'white' }]
            })
            return
          } else {
            // Add this current repo path to new list
            updatedReposList[updatedReposList.length] = repoPath;
          }
        }
        // Repo does not yet exist...
        // Add new repo to current repo list
        updatedReposList[updatedReposList.length] = urlToAdd.trim()

        // POST that list to the API
        this.updateRepoList(updatedReposList)
          .then((response) => {
            // Notify save
            this.$q.notify({
              color: 'positive',
              position: 'top',
              message: this.$t('notifications.saved'),
              icon: 'cloud_done',
              actions: [{ icon: 'close', color: 'white' }]
            })

            // Remove value from input field if it was used
            if (!repoUrl) {
              this.newRepo = '';
            }

            // Reload all repos
            this.reloadAllReposData()

            // Emit a reload event due to repo update
            this.$emit('repoReloaded', true)
          })
          .catch(() => {
            this.$q.notify({
              color: 'negative',
              position: 'top',
              message: this.$t('notifications.newRepoAddFailed'),
              icon: 'report_problem',
              actions: [{ icon: 'close', color: 'white' }]
            })
          })
      }
    },
    getRepoDisplayUrl: function (repo) {
      if (repo.repo_html_url) {
        return repo.repo_html_url;
      }
      if (repo.path && repo.path.startsWith('http')) {
        return repo.path;
      }
      return '';
    },
    removeRepo: function (repoPath) {
      let updatedReposList = []

      // Check if repoPath actually exists in repo list
      // Create updatedReposList from all other paths but the one we want removed
      for (let i = 0; i < this.repoList.length; i++) {
        let repo = this.repoList[i]
        if (repoPath.trim() !== repo.path) {
          updatedReposList[updatedReposList.length] = repo.path;
        }
      }

      // POST the updated repo list to the API
      this.updateRepoList(updatedReposList)
        .then((response) => {
          // Notify save
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.$t('notifications.repoRemovedSuccess') + ' "' + repoPath.trim() + '"',
            icon: 'check_circle',
            actions: [{ icon: 'close', color: 'white' }]
          })

          // Reload all repos
          this.reloadAllReposData()

          // Emit a reload event due to repo update
          this.$emit('repoReloaded')
        })
        .catch(() => {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: this.$t('notifications.repoRemovedFailed'),
            icon: 'report_problem',
            actions: [{ icon: 'close', color: 'white' }]
          })
        })
    },
    openCommunityDialog() {
      this.$refs.communityRepos.show()
    }
  },
  created() {
    this.getRepoInfo();
  },
  emits: ['repoReloaded']
}
</script>

<style scoped>
.repo-info {
  flex: 1;
  min-width: 0;
}
</style>
