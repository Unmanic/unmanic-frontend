<template>
  <q-card style="width:100%">
    <q-card-section class="bg-grey-2">
      <div class="row items-center no-wrap">
        <div class="col-auto">
          <q-btn
            color="grey-7"
            dense
            round
            flat
            icon="arrow_back" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{ $t('tooltips.back') }}</q-tooltip>
          </q-btn>
        </div>
        <div class="col">
          <div class="text-h6 text-secondary">
            <q-icon name="extension"/>
            {{ $t('headers.pluginInstaller') }}
          </div>
        </div>
      </div>
    </q-card-section>

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
            <q-input
              outlined
              dense
              debounce="300"
              v-model="filter"
              placeholder="Search">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>

          <template v-slot:top-right>
            <q-select
              @update:model-value="loadInstallablePlugins"
              outlined
              dense
              :label="$t('components.plugins.tagFilter')"
              v-model="tagFilter"
              :options="tags"
              style="min-width: 300px">
              <template v-slot:append>
                <q-icon name="style"/>
              </template>
            </q-select>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-accent q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied"/>
              <q-item-label>{{ $t('components.plugins.listEmpty') }}</q-item-label>
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
                    <strong>{{ props.row.name }}</strong>
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
                      <q-avatar
                        rounded
                        size="100px">
                        <img :src="props.row.icon">
                      </q-avatar>
                    </div>
                    <div class="col-auto">
                      <div class="row q-col-gutter-md">
                        <div class="col-auto">{{ $t('components.plugins.author') }}</div>
                        <div class="col-auto">{{ props.row.author }}</div>
                      </div>
                      <div class="row q-col-gutter-md">
                        <div class="col-auto">{{ $t('components.plugins.version') }}</div>
                        <div class="col-auto">{{ props.row.version }}</div>
                      </div>
                      <div class="row q-col-gutter-md q-mt-sm">
                        <div class="col-auto">

                          <!--INSTALL BUTTON-->
                          <q-btn
                            v-if="props.row.update_available"
                            @click="installPlugin(props.row.plugin_id)"
                            color="accent"
                            dense
                            round
                            flat
                            icon="update">
                            <q-tooltip class="bg-white text-primary">{{ $t('tooltips.update') }}</q-tooltip>
                          </q-btn>
                          <q-btn
                            v-else-if="props.row.installed"
                            @click="installPlugin(props.row.plugin_id)"
                            color="accent"
                            dense
                            round
                            flat
                            icon="download_for_offline">
                            <q-tooltip class="bg-white text-primary">{{ $t('tooltips.reinstall') }}</q-tooltip>
                          </q-btn>
                          <q-btn
                            v-else
                            @click="installPlugin(props.row.plugin_id)"
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
                    </div>
                  </div>
                </q-card-section>

                <q-inner-loading :showing="pluginInstalling[props.row.plugin_id]">
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

  <PluginInfo v-bind:showPluginInfo="showPluginInfo" v-bind:viewingRemoteInfo="viewingRemoteInfo"
              v-on:hide="closePluginInfo"/>

</template>

<script>
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { computed, onMounted, ref } from "vue";
import PluginInfo from "components/PluginInfo";
import { useQuasar } from "quasar";

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
  name: 'PluginInstaller',
  components: { PluginInfo },
  setup() {
    const tags = ref([])
    const tagFilter = ref('All')

    const allPluginsList = ref([])

    const rows = ref([])
    const filter = ref('')
    const pagination = ref({
      page: 1,
      rowsPerPage: 12
    })

    const pluginInstalling = ref({})

    const loadInstallablePlugins = function () {
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'plugins/installable')
      }).then((response) => {
        allPluginsList.value = response.data.plugins;

        let plugin_list = []
        let all_tags_list = []

        for (let i = 0; i < allPluginsList.value.length; i++) {
          let plugin = allPluginsList.value[i];

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
          if (tagFilter.value !== 'All') {
            if (!plugin.tags.includes(tagFilter.value)) {
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
          }

        }

        // If a tag filter is applied, reset the pagination page
        if (tagFilter.value !== 'All') {
          pagination.value.page = 1
        }

        // Add tags to tags list
        tags.value = ['All'].concat(all_tags_list.sort());

        // Add plugins to rows
        rows.value = plugin_list;
      });
    }

    const showPluginInfo = ref('');

    function closePluginInfo() {
      showPluginInfo.value = '';
    }

    onMounted(() => {
      // get initial data from server (1st page)
      loadInstallablePlugins();
    })

    return {
      filter,
      columns,
      rows,
      pagination,
      pagesNumber: computed(() => Math.ceil(rows.value.length / pagination.value.rowsPerPage)),
      tags,
      tagFilter,
      loadInstallablePlugins,
      showPluginInfo,
      viewingRemoteInfo: true,
      closePluginInfo,
      pluginInstalling
    }
  },
  methods: {
    installPlugin: function (plugin_id) {
      console.debug('Installing plugin by Plugin ID: ' + plugin_id)

      let data = {
        plugin_id: plugin_id,
      }

      this.pluginInstalling[plugin_id] = true;

      axios({
        method: 'put',
        url: getUnmanicApiUrl('v2', 'plugins/install'),
        data: data
      }).then((response) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('notifications.installed'),
          icon: 'report_problem'
        })

        // Mark it as installed
        for (let i = 0; i < this.rows.length; i++) {
          let plugin = this.rows[i];
          if (plugin.plugin_id === plugin_id) {
            plugin.installed = true
            plugin.update_available = false
          }
        }

        this.pluginInstalling[plugin_id] = false
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToInstallPlugin'),
          icon: 'report_problem'
        })

        this.pluginInstalling[plugin_id] = false
      })
    }
  }
}
</script>
