<template>

  <!-- START DIALOG CONFIG
  Right fullscreen pop-up
  Note: Update template q-dialog ref="" value

  All Platforms:
   - Swipe right to dismiss
  Desktop:
   - Width 2000px
   - Minimise button top-right
  Mobile:
   - Full screen
   - Back button top-left
  -->
  <q-dialog
    ref="dialogRef"
    :maximized="$q.platform.is.mobile"
    :transition-show="$q.platform.is.mobile ? 'jump-left' : 'slide-left'"
    :transition-hide="$q.platform.is.mobile ? 'jump-right' : 'slide-right'"
    full-height
    position="right"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.left="hide"
      :style="$q.platform.is.mobile ? 'max-width: 100vw;' : 'max-width: 95vw;'"
      style="width:2000px;">

      <q-card-section class="bg-card-head">
        <div class="row items-center no-wrap">
          <div
            v-if="$q.platform.is.mobile"
            class="col">
            <q-btn
              color="grey-7"
              dense
              round
              flat
              icon="arrow_back"
              v-close-popup>
            </q-btn>
          </div>

          <div class="col">
            <div class="text-h6 text-blue-10">
              {{ $t('headers.pluginInstaller') }}
            </div>
          </div>

          <div
            v-if="!$q.platform.is.mobile"
            class="col-auto">
            <q-btn
              color="grey-7"
              dense
              round
              flat
              icon="arrow_forward"
              v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <!-- END DIALOG CONFIG -->

      <q-card-section class="q-pa-none">
        <div class="q-pa-md">

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
          >
            <template v-slot:top-left>
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
            </template>

            <template
              v-if="!$q.platform.is.mobile"
              v-slot:top-right>
              <div class="row q-col-gutter-xs q-ma-xs">
                <div class="col-auto">
                  <PluginInstallerManageRepos v-on:repoReloaded="reloadPluginsPostRepoReloaded"/>
                </div>
              </div>
            </template>

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
                    style="min-height: 80px">
                    <div class="row">
                      <span style="overflow: hidden;white-space: nowrap;">
                        <strong>{{ props.row.name }}</strong>
                      </span>
                    </div>
                    <div class="row float-right">
                      <!--INSTALLED STATUS-->
                      <q-btn
                        v-if="props.row.update_available"
                        color="warning"
                        dense
                        round
                        flat
                        icon="check_circle"> Update Available
                      </q-btn>
                      <q-btn
                        v-else-if="props.row.installed"
                        color="positive"
                        dense
                        round
                        flat
                        icon="check_circle"> Installed
                      </q-btn>
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

                  <q-card-section>
                    <div class="row">
                      <div class="col-auto items-end">
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
                          @click="showPluginInfo = props.row.plugin_id"
                          color="secondary"
                          dense
                          round
                          flat
                          icon="info">
                          <q-tooltip class="bg-white text-primary">{{ $t('tooltips.pluginInfo') }}</q-tooltip>
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

          <div class="row justify-center q-mt-md">
            <q-pagination
              v-model="pagination.page"
              color="secondary"
              :max="pagesNumber"
              size="md"
              direction-links
              boundary-links
            />
          </div>

        </div>
      </q-card-section>
    </q-card>

    <PluginInfo v-bind:showPluginInfo="showPluginInfo"
                v-bind:viewingRemoteInfo="viewingRemoteInfo"
                v-on:hide="closePluginInfo"/>

  </q-dialog>
</template>

<script>
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { computed, onMounted, ref } from "vue";
import PluginInfo from "components/PluginInfo";
import PluginInstallerManageRepos from "components/PluginInstallerManageRepos";

const columns = [
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
]


export default {
  name: 'PluginInstallerDialog',
  props: {},
  emits: [
    // REQUIRED
    'ok', 'hide', 'path'
  ],
  components: { PluginInstallerManageRepos, PluginInfo },
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialogRef.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
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
    closePluginInfo: function () {
      this.showPluginInfo = '';
    }
  },
  created() {
    this.loadInstallablePlugins();
  },
  data: function () {
    const tags = ref([])
    const tagFilter = ref('All')

    const rows = ref([])
    const filter = ref('')
    const pagination = ref({
      page: 1,
      rowsPerPage: 12
    })

    return {
      filter,
      columns,
      rows,
      pagination,
      pagesNumber: computed(() => Math.ceil(rows.value.length / pagination.value.rowsPerPage)),
      tags,
      tagFilter,

      viewingRemoteInfo: ref(true),
      showPluginInfo: ref(''),
      pluginInstalling: ref({}),
    }
  }
}
</script>
