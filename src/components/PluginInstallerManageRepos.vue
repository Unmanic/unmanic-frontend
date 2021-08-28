<template>
  <q-btn
    @click="reloadAllReposData()"
    v-if="$q.platform.is.mobile"
    class="q-mb-xs"
    color="secondary"
    :label="$t('components.plugins.refreshRepositories')"/>
  <q-btn-group>
    <q-btn
      @click="reloadAllReposData()"
      v-if="!$q.platform.is.mobile"
      color="secondary"
      :label="$t('components.plugins.refreshRepositories')"/>

    <q-btn-dropdown
      color="secondary"
      :label="$t('components.plugins.addRepository')">

      <div>
        <!--REPO DATA-->
        <div class="row no-wrap q-pa-md">
          <div class="column">

            <q-input
              style="min-width:400px"
              filled
              type="textarea"
              v-model="newRepo"
              :label="$t('components.plugins.newRepository')"/>

            <q-btn
              @click="saveNewRepo()"
              color="secondary"
              :label="$t('navigation.save')"/>


          </div>
        </div>
      </div>
    </q-btn-dropdown>

    <q-btn-dropdown
      auto-close
      color="secondary"
      :label="$t('components.plugins.repoList')">

      <div
        v-for="repo in repoList"
        :key="repo.id"
        v-bind="repo">

        <!--REPO DATA-->
        <div class="row no-wrap q-pa-md">
          <div class="column">
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
                      @click="goToRepoSource(repo.path)">
                      {{ repo.path }}
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
              class="q-ma-xs"
              color="negative"
              label="Remove"
              push
              size="sm"
              @click="removeRepo(repo.path)"
            />
          </div>
        </div>

      </div>

    </q-btn-dropdown>
  </q-btn-group>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { openURL, useQuasar } from "quasar";

export default {
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
    saveNewRepo: function () {
      if (this.newRepo.length > 0) {
        let updatedReposList = []

        // Check if this.newRepo already exists in repo list
        for (let i = 0; i < this.repoList.length; i++) {
          let repoPath = this.repoList[i].path;
          if (this.newRepo.trim() === repoPath) {
            this.$q.notify({
              color: 'negative',
              position: 'top',
              message: this.$t('notifications.repoAlreadyExists') + ' "' + this.newRepo.trim() + '"',
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
        updatedReposList[updatedReposList.length] = this.newRepo.trim()

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

            // Remove value from input field
            this.newRepo = '';

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
    }
  },
  created() {
    this.getRepoInfo();
  },
  emits: ['repoReloaded']
}
</script>
