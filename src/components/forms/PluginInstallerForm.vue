<template>

  <div class="row q-col-gutter-none q-ma-none plugin-table-actions-bar">
    <div class="col self-start">
      <div class="row q-col-gutter-xs q-ma-xs">
        <div
          v-if="$q.platform.is.mobile"
          class="col-auto">
          <PluginInstallerManageRepos/>
        </div>
        <div class="col-auto">
          <q-input
            filled
            class="shadow-1"
            dense
            debounce="300"
            v-model="filter"
            :placeholder="$t('navigation.search')">
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-select
            filled
            class="shadow-1"
            @update:model-value="loadInstallablePlugins"
            dense
            :label="$t('components.plugins.categoryFilter')"
            v-model="tagFilter"
            :options="tags"
            style="min-width: 300px">
            <template v-slot:append>
              <q-icon name="style"/>
            </template>
          </q-select>
        </div>
      </div>
    </div>
    <div class="col self-end">
      <div class="row q-col-gutter-xs q-ma-xs float-right">
        <div class="col-auto">
          <PluginInstallerManageRepos v-on:repoReloaded="reloadPluginsPostRepoReloaded"/>
        </div>
      </div>
    </div>
  </div>

  <div :class="$q.platform.is.mobile ? 'q-px-none' : ''">

    <q-table
      grid
      card-class="bg-primary text-white"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :filter="filter"
      hide-header
      v-model:pagination="pagination"
      hide-pagination
      class="plugin-table"
    >

      <template v-slot:no-data>
        <div class="full-width row flex-center text-accent q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied"/>
          <q-item-label>{{ $t('headers.listEmpty') }}</q-item-label>
          <q-icon size="2em" name="priority_high"/>
        </div>
      </template>

      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
          <q-card
            style="min-height: 220px;">
            <q-card-section
              style="min-height: 50px">
              <div class="row">
                      <span style="overflow: hidden;white-space: nowrap;">
                        <strong>{{ props.row.name }}</strong>
                      </span>
              </div>
            </q-card-section>

            <q-separator
              v-if="props.row.update_available"
              color="warning"
            />

            <q-separator
              v-else-if="props.row.installed"
              color="positive"
            />

            <q-separator
              v-else
            />

            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-auto">
                  <q-skeleton v-if="!props.row.icon" width="100px" height="100px"/>
                  <q-avatar
                    v-else
                    rounded
                    size="100px">
                    <q-img :src="props.row.icon" style="height:100%; max-width: 100px;">
                      <template v-slot:error>
                        <div class="absolute-full flex flex-center bg-negative text-white text-caption">
                          {{ $t('status.cannotLoadImage') }}
                        </div>
                        <!--                            <img :src="props.row.icon">-->
                      </template>
                    </q-img>
                  </q-avatar>
                </div>
                <div class="col">
                  <div class="row q-col-gutter-md">
                    <div class="col-4 self-start">{{ $t('components.plugins.author') }}</div>
                    <div class="col self-end">{{ props.row.author }}</div>
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-4 self-start">{{ $t('components.plugins.version') }}</div>
                    <div class="col self-end">{{ props.row.version }}</div>
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-4 self-start">{{ $t('components.plugins.repo') }}</div>
                    <div class="col self-end">{{ props.row.repo_name }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row">
                <div class="col self-start items-end">
                  <!--INSTALL BUTTON-->
                  <q-btn
                    v-if="props.row.update_available"
                    @click="installPlugin(props.row.plugin_id, props.row.repo_id)"
                    color="accent"
                    dense
                    round
                    flat
                    icon="update">
                    <q-tooltip class="bg-white text-primary">{{ $t('tooltips.update') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-else-if="props.row.installed"
                    @click="installPlugin(props.row.plugin_id, props.row.repo_id)"
                    color="accent"
                    dense
                    round
                    flat
                    icon="download_for_offline">
                    <q-tooltip class="bg-white text-primary">{{ $t('tooltips.reinstall') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-else
                    @click="installPlugin(props.row.plugin_id, props.row.repo_id)"
                    color="accent"
                    dense
                    round
                    flat
                    icon="download_for_offline">
                    <q-tooltip class="bg-white text-primary">{{ $t('tooltips.install') }}</q-tooltip>
                  </q-btn>

                  <!--DISPLAY INFORMATION BUTTON-->
                  <q-btn
                    @click="openPluginInfo(props.row.plugin_id, 'info')"
                    color="secondary"
                    dense
                    round
                    flat
                    icon="info">
                    <q-tooltip class="bg-white text-primary">{{ $t('tooltips.pluginInfo') }}</q-tooltip>
                  </q-btn>
                </div>
                <div class="col self-end">
                  <!--INSTALLED STATUS-->
                  <q-btn
                    v-if="props.row.update_available"
                    color="warning"
                    dense
                    round
                    flat
                    class="float-right"
                    icon="check_circle"> Update Available
                  </q-btn>
                  <q-btn
                    v-else-if="props.row.installed"
                    color="positive"
                    dense
                    round
                    flat
                    class="float-right"
                    icon="check_circle"> Installed
                  </q-btn>
                </div>
              </div>
            </q-card-section>

            <q-inner-loading :showing="pluginInstalling[props.row.repo_id + props.row.plugin_id]">
              <q-spinner size="100px" color="secondary"/>
            </q-inner-loading>

          </q-card>
        </div>
      </template>

    </q-table>

  </div>

</template>

<script>
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { computed, ref } from "vue";
import PluginInfoDialog from "components/dialogs/PluginInfoDialog";
import PluginInstallerManageRepos from "components/PluginInstallerManageRepos";


export default {
  name: 'PluginInstallerForm',
  components: { PluginInstallerManageRepos },
  props: {},
  data: function () {
    const filter = ref('')
    const columns = ref([
      {
        name: 'icon',
        required: true,
        label: '',
        align: 'left',
        field: 'icon',
        sortable: true
      },
      {
        name: 'name',
        required: true,
        label: 'Name',
        align: 'left',
        field: 'name',
        sortable: true
      },
      {
        name: 'author',
        align: 'center',
        label: 'Author',
        field: 'author',
        sortable: false
      },
      {
        name: 'version',
        align: 'center',
        label: 'Version',
        field: 'version',
        sortable: false
      }
    ])
    const rows = ref([])
    const pagination = ref({
      page: 1,
      rowsPerPage: 0
    })
    const tags = ref([])
    const tagFilter = ref('All')

    return {
      /*
      Required data:
        - isLoading
        - isSaved
      */
      isLoading: false,
      isSaved: true,

      pluginInstalling: ref({}),

      filter,
      columns,
      rows,
      pagination,
      tags,
      tagFilter,
    }
  },
  mounted() {
    this.loadInstallablePlugins();
  },
  methods: {
    /*
    Required methods:
      - hide()
      - save()
      - cancel()
    */
    hide() {
      return true;
    },
    save() {
      return true;
    },
    cancel() {
      return true;
    },

    installPlugin: function (plugin_id, repo_id) {
      console.debug('Installing plugin by Plugin ID: ' + plugin_id + 'from Repo ID - ' + repo_id)

      let data = {
        plugin_id: plugin_id,
        repo_id: repo_id,
      }

      this.pluginInstalling[repo_id + plugin_id] = true;

      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/install'),
        data: data
      }).then((response) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('notifications.installed'),
          icon: 'check_circle',
          actions: [{ icon: 'close', color: 'white' }]
        })

        // Mark it as installed
        for (let i = 0; i < this.rows.length; i++) {
          let plugin = this.rows[i];
          if (plugin.plugin_id === plugin_id) {
            plugin.installed = true
            plugin.update_available = false
          }
        }

        this.pluginInstalling[repo_id + plugin_id] = false
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToInstallPlugin'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })

        this.pluginInstalling[repo_id + plugin_id] = false
      })
    },
    loadInstallablePlugins: function () {
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'plugins/installable')
      }).then((response) => {
        let allPluginsList = response.data.plugins;

        let plugin_list = []
        let all_tags_list = []

        for (let i = 0; i < allPluginsList.length; i++) {
          let plugin = allPluginsList[i];

          // Extract plugin tags
          let plugin_tags = plugin.tags.split(',')
          for (let x = 0; x < plugin_tags.length; x++) {
            let tag = plugin_tags[x];
            if (all_tags_list.includes(tag)) {
              continue;
            }
            all_tags_list[all_tags_list.length] = tag.trim();
          }

          // Filter only items that match the selected tag
          if (this.tagFilter !== 'All') {
            if (!plugin.tags.includes(this.tagFilter)) {
              continue;
            }
          }

          plugin_list[plugin_list.length] = {
            plugin_id: plugin.plugin_id,
            name: plugin.name,
            author: plugin.author,
            description: plugin.description,
            version: plugin.version,
            icon: plugin.icon,
            tags: plugin.tags,
            installed: plugin.status.installed,
            update_available: plugin.status.update_available,
            package_url: plugin.package_url,
            changelog_url: plugin.changelog_url,
            repo_name: plugin.repo_name,
            repo_id: plugin.repo_id,
          }

        }

        // If a tag filter is applied, reset the pagination page
        if (this.tagFilter !== 'All') {
          this.pagination.page = 1
        }

        // Add tags to tags list
        this.tags = ['All'].concat(all_tags_list.sort());

        // Add plugins to rows
        this.rows = plugin_list;
      });
    },
    reloadPluginsPostRepoReloaded: function () {
      // A repo refresh will reset a bunch of things.
      // This can mess up pagination. Best solution is to force us back to page one...
      this.pagination.page = 1;

      // Now trigger a reload of the installable plugins
      this.loadInstallablePlugins();
    },
    openPluginInfo: function (pluginId, tab) {
      // Ensure we have the info for the plugin to be displayed
      if (pluginId === '') {
        // Display error notification
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'An error was encountered while attempting to open plugin info',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
        return
      }
      // Display the dialog
      this.$q.dialog({
        component: PluginInfoDialog,
        componentProps: {
          pluginId: pluginId,
          startTab: (tab === 'settings') ? 'settings' : 'info',
          libraryId: this.currentID,
          viewingRemoteInfo: true,
        },
      }).onOk((payload) => {
      }).onDismiss(() => {
      })
    }
  },
  watch: {
    libraryId(value) {
      if (value.length > 0) {
        this.currentID = this.libraryId;
      }
    }
  }
}
</script>

<style scoped>
.plugin-table-actions-bar {
  position: sticky;
  top: 65px;
  z-index: 90;
  background: #fff;
}

.q-dark .plugin-table-actions-bar {
  background: var(--q-dark) !important
}

.plugin-table {
  margin-bottom: 220px;
}
</style>
