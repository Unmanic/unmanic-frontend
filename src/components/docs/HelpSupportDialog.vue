<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="$t('navigation.helpAndSupport')"
    @hide="onDialogHide"
  >
    <div class="q-pa-none">
      <div class="row">
        <div class="col q-ma-sm">
          <div class="row">
            <div class="col-sm-7 col-xs-12">
              <!--START CONFIGURATION-->
              <h5 class="q-mb-none q-mt-sm q-pl-sm">{{ $t('components.settings.support.configuration') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="debugging === null"
                  type="QToggle"/>
                <div class="q-pa-md" style="max-width: 560px">
                  <q-list
                    padding
                    class="rounded-borders">

                    <q-item>
                      <q-item-section avatar>
                        <q-img src="~assets/unmanic-logo-white.png"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.appVersion') }}:</q-item-label>
                        <q-item-label caption>{{ appVersion }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator spaced inset="item"/>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon color="primary" name="fab fa-python"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.pythonVersion') }}:</q-item-label>
                        <q-item-label caption>{{ pythonVersion }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator spaced inset="item"/>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon color="primary" name="computer"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.platform') }}:</q-item-label>
                        <q-item-label caption>{{ platform }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator spaced inset="item"/>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon color="primary" name="fas fa-folder"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.configPath') }}:</q-item-label>
                        <q-item-label caption>{{ configPath }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon color="primary" name="fas fa-folder"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.logsPath') }}:</q-item-label>
                        <q-item-label caption>{{ logsPath }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon color="primary" name="fas fa-folder"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.userdataPath') }}:</q-item-label>
                        <q-item-label caption>{{ userdataPath }}</q-item-label>
                      </q-item-section>
                    </q-item>

                  </q-list>
                </div>
              </div>
              <!--END CONFIGURATION-->
            </div>
            <div class="col-sm-5 col-xs-12">
              <!--START EXT DOC LINKS-->
              <h5 class="q-mb-none q-mt-sm">{{ $t('components.settings.support.docs') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="debugging === null"
                  type="QToggle"/>
                <div class="q-pa-md" style="max-width: 550px">
                  <q-list
                    dense
                    class="q-pl-sm">
                    <q-item clickable dense class="support-link-row rounded-borders"
                            @click="openExternalURL('/unmanic/swagger')">
                      <q-item-section avatar>
                        <q-icon color="primary" name="article" size="18px"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.apiSpec') }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon color="secondary" name="open_in_new" size="16px"/>
                      </q-item-section>
                    </q-item>
                    <q-item clickable dense class="support-link-row rounded-borders"
                            @click="openExternalURL('https://docs.unmanic.app/docs/')">
                      <q-item-section avatar>
                        <q-icon color="primary" name="article" size="18px"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.applicationDocumentation') }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon color="secondary" name="open_in_new" size="16px"/>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
              <!--END EXT DOC LINKS-->

              <!--START EXT SUPPORT LINKS-->
              <h5 class="q-mb-none q-mt-sm">{{ $t('components.settings.support.support') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="debugging === null"
                  type="QToggle"/>
                <div class="q-pa-md" style="max-width: 550px">
                  <q-list
                    dense
                    class="q-pl-sm">
                    <q-item clickable dense class="support-link-row rounded-borders"
                            @click="openExternalURL('https://github.com/Unmanic/unmanic/issues')">
                      <q-item-section avatar>
                        <q-icon color="primary" name="fab fa-github" size="18px"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.unmanicAppSourceRequests') }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon color="secondary" name="open_in_new" size="16px"/>
                      </q-item-section>
                    </q-item>
                    <q-item clickable dense class="support-link-row rounded-borders"
                            @click="openExternalURL('https://github.com/Unmanic/unmanic-frontend/issues')">
                      <q-item-section avatar>
                        <q-icon color="primary" name="fab fa-github" size="18px"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{
                            $t('components.settings.support.unmanicFrontendSourceRequests')
                          }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon color="secondary" name="open_in_new" size="16px"/>
                      </q-item-section>
                    </q-item>
                    <q-item clickable dense class="support-link-row rounded-borders"
                            @click="openExternalURL('https://github.com/Unmanic/unmanic-plugins/issues')">
                      <q-item-section avatar>
                        <q-icon color="primary" name="fab fa-github" size="18px"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{
                            $t('components.settings.support.unmanicOfficialPluginRequests')
                          }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon color="secondary" name="open_in_new" size="16px"/>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
              <!--END EXT DOC LINKS-->
            </div>
          </div>

          <q-separator/>

          <div class="q-pa-md">
            <h5 class="q-mb-none q-mt-sm">{{ $t('components.settings.support.fundingProposalsTitle') }}</h5>
            <div class="q-pl-sm">
              <div class="q-pt-sm q-pb-sm text-caption">
                {{ $t('components.settings.support.fundingProposalsBody') }}
              </div>
              <div class="q-mb-md">
                <q-btn
                  flat
                  dense
                  color="secondary"
                  icon-right="open_in_new"
                  :label="$t('components.settings.support.fundingProposalsPortalLinkLabel')"
                  @click="openExternalURL(getFundingPortalUrl(true))"
                />
              </div>

              <q-tabs
                v-model="selectedFundingStatus"
                dense
                indicator-color="secondary"
                active-color="secondary"
                class="text-secondary q-mb-md"
                align="left"
              >
                <q-tab name="active"
                       :label="$t('components.settings.support.fundingTabActive', { count: fundingTabCounts.active })"/>
                <q-tab name="funded"
                       :label="$t('components.settings.support.fundingTabFunded', { count: fundingTabCounts.funded })"/>
                <q-tab name="in_progress"
                       :label="$t('components.settings.support.fundingTabInProgress', { count: fundingTabCounts.in_progress })"/>
                <q-tab name="complete"
                       :label="$t('components.settings.support.fundingTabComplete', { count: fundingTabCounts.complete })"/>
              </q-tabs>

              <div v-if="loadingFundingProposals && filteredFundingProposals.length === 0" class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="i in 4" :key="i">
                  <q-card flat bordered class="funding-card">
                    <q-card-section>
                      <q-skeleton type="text" width="70%"/>
                      <q-skeleton type="text" class="q-mt-sm"/>
                      <q-skeleton type="text" class="q-mt-xs" width="55%"/>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <div v-else-if="fundingProposalsError" class="text-negative">
                {{ fundingProposalsError }}
              </div>

              <div v-else-if="displayedFundingProposals.length === 0">
                {{ fundingEmptyMessage }}
              </div>

              <div v-else class="row q-col-gutter-sm q-row-gutter-sm">
                <div
                  v-for="(proposal, index) in displayedFundingProposals"
                  :key="proposal.id || proposal.uuid || proposal.slug || index"
                  class="col-12 col-sm-6 col-md-4 col-lg-3"
                >
                  <q-card
                    flat
                    bordered
                    class="funding-card cursor-pointer"
                    @click="openExternalURL(getFundingPortalUrl(false))"
                  >
                    <q-card-section class="q-pa-sm">
                      <div class="text-subtitle2 ellipsis-2-lines">{{ proposalTitle(proposal, index) }}</div>
                      <div v-if="proposalDescription(proposal)"
                           class="text-caption text-secondary ellipsis-3-lines q-mt-xs">
                        {{ proposalDescription(proposal) }}
                      </div>
                      <div class="q-mt-sm">
                        <q-linear-progress
                          rounded
                          size="8px"
                          color="secondary"
                          track-color="grey-4"
                          :value="proposalProgressValue(proposal)"
                        />
                      </div>
                      <div class="row justify-between q-mt-xs">
                        <div class="text-caption">
                          {{
                            $t('components.settings.support.fundingCardFunded', { value: formatFundingCurrency(proposalCurrentCredits(proposal)) })
                          }}
                        </div>
                        <div class="text-caption text-secondary">
                          {{
                            $t('components.settings.support.fundingCardGoal', { value: formatFundingCurrency(proposalTargetCredits(proposal)) })
                          }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UnmanicDialogWindow>
</template>

<script>
import { ref } from "vue";
import { useQuasar } from 'quasar'
import { useI18n } from "vue-i18n";
import axios from "axios";
import unmanicGlobals, { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { openURL } from 'quasar'
import UnmanicDialogWindow from "components/ui/dialogs/UnmanicDialogWindow.vue";

export default {
  name: 'HelpSupportDialog',
  components: {
    UnmanicDialogWindow
  },
  emits: ['hide'],
  setup() {
    useQuasar()
    useI18n();
    const logsPath = ref('');

    const appVersion = ref(null);
    const pythonVersion = ref(null);
    const platform = ref(null);
    const configPath = ref(null);
    const userdataPath = ref(null);

    return {
      logsPath,
      appVersion,
      pythonVersion,
      platform,
      configPath,
      userdataPath,
    }
  },
  data() {
    return {
      debugging: ref(null),
      loadingFundingProposals: false,
      fundingProposals: [],
      fundingProposalsError: null,
      selectedFundingStatus: 'active',
    }
  },
  computed: {
    filteredFundingProposals() {
      return this.fundingProposals.filter((proposal) => this.isUnmanicProposal(proposal));
    },
    displayedFundingProposals() {
      return this.filteredFundingProposals.filter(
        (proposal) => this.proposalStatusGroup(proposal) === this.selectedFundingStatus
      );
    },
    fundingTabCounts() {
      const counts = {
        active: 0,
        funded: 0,
        in_progress: 0,
        complete: 0
      };
      this.filteredFundingProposals.forEach((proposal) => {
        const group = this.proposalStatusGroup(proposal);
        if (counts[group] !== undefined) {
          counts[group] += 1;
        }
      });
      return counts;
    },
    fundingEmptyMessage() {
      if (this.selectedFundingStatus === 'funded') {
        return this.$t('components.settings.support.fundingProposalsEmptyFunded');
      }
      if (this.selectedFundingStatus === 'in_progress') {
        return this.$t('components.settings.support.fundingProposalsEmptyInProgress');
      }
      if (this.selectedFundingStatus === 'complete') {
        return this.$t('components.settings.support.fundingProposalsEmptyComplete');
      }
      return this.$t('components.settings.support.fundingProposalsEmptyActive');
    }
  },
  methods: {
    show() {
      if (this.$refs.dialogRef) {
        this.$refs.dialogRef.show();
      }
    },
    hide() {
      if (this.$refs.dialogRef) {
        this.$refs.dialogRef.hide();
      }
    },
    onDialogHide() {
      this.$emit('hide');
    },
    openExternalURL: function (url) {
      openURL(url)
    },
    getFundingPortalUrl(openFaq = false) {
      const params = new URLSearchParams({ project: 'Unmanic' });
      if (openFaq) {
        params.set('open_faq', 'true');
      }
      return `https://api.unmanic.app/support-auth-api/portal?${params.toString()}`;
    },
    fetchSettings: function () {
      // Fetch current settings
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/read')
      }).then((response) => {
        this.debugging = response.data.settings.debugging

        // Set system configuration paths
        this.configPath = response.data.settings.config_path;
        this.logsPath = response.data.settings.log_path;
        this.userdataPath = response.data.settings.userdata_path;

      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    fetchSystemConfig: function () {
      // Fetch unmanic version
      unmanicGlobals.getUnmanicVersion().then((version) => {
        this.appVersion = version;
      })
      // Fetch system config
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/configuration')
      }).then((response) => {
        let configuration = response.data.configuration;

        // Set python versoin
        this.pythonVersion = configuration.python;

        // Set platform data
        if (typeof configuration.platform !== 'undefined' && configuration.platform.length > 0) {
          let platform = configuration.platform.join(' ');
          console.log(platform)
          this.platform = platform;
        }

      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchSystemConfig'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    fetchFundingProposals() {
      this.loadingFundingProposals = true;
      this.fundingProposalsError = null;
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'session/funding_proposals')
      }).then((response) => {
        const payload = response?.data?.data ?? response?.data ?? {};
        const proposals = payload.funding_proposals ?? payload.proposals ?? payload.items ?? payload;
        this.fundingProposals = Array.isArray(proposals) ? proposals : [];
      }).catch(() => {
        this.fundingProposals = [];
        this.fundingProposalsError = this.$t('components.settings.support.fundingProposalsLoadFailed');
      }).finally(() => {
        this.loadingFundingProposals = false;
      });
    },
    proposalValue(proposal, keys, fallback = null) {
      if (!proposal || typeof proposal !== 'object') {
        return fallback;
      }
      for (const key of keys) {
        if (proposal[key] !== undefined && proposal[key] !== null && proposal[key] !== '') {
          return proposal[key];
        }
      }
      return fallback;
    },
    proposalTitle(proposal, index) {
      return this.proposalValue(
        proposal,
        ['title', 'name', 'proposal_title', 'slug'],
        this.$t('components.settings.support.fundingProposalUntitled', { number: index + 1 })
      );
    },
    proposalDescription(proposal) {
      return this.proposalValue(
        proposal,
        ['summary', 'description', 'details', 'short_description'],
        ''
      );
    },
    proposalStatusRaw(proposal) {
      return String(this.proposalValue(proposal, ['status', 'state'], '')).trim().toLowerCase();
    },
    proposalStatusGroup(proposal) {
      const status = this.proposalStatusRaw(proposal);
      if (status === 'funded') {
        return 'funded';
      }
      if (status === 'in-progress' || status === 'in_progress' || status === 'in progress') {
        return 'in_progress';
      }
      if (status === 'complete' || status === 'completed') {
        return 'complete';
      }
      if (status === 'active' || status === 'funding' || status === '') {
        return 'active';
      }
      return 'active';
    },
    proposalCurrentCredits(proposal) {
      return this.proposalValue(
        proposal,
        ['funded', 'credits_applied', 'total_credits', 'credits', 'votes', 'current_votes'],
        0
      );
    },
    proposalTargetCredits(proposal) {
      return this.proposalValue(
        proposal,
        ['goal', 'credits_required', 'target_credits', 'goal_credits', 'required_credits'],
        0
      );
    },
    proposalProgressValue(proposal) {
      const current = Number(this.proposalCurrentCredits(proposal));
      const goal = Number(this.proposalTargetCredits(proposal));
      if (Number.isNaN(current) || Number.isNaN(goal) || goal <= 0) {
        return 0;
      }
      return Math.max(0, Math.min(current / goal, 1));
    },
    formatFundingNumber(value) {
      const num = Number(value);
      if (Number.isNaN(num)) {
        return value;
      }
      return new Intl.NumberFormat().format(num);
    },
    formatFundingCurrency(value) {
      const num = Number(value);
      if (Number.isNaN(num)) {
        return value;
      }
      return `$${new Intl.NumberFormat().format(num)}`;
    },
    isUnmanicProposal(proposal) {
      const keys = [
        'project', 'project_name', 'product', 'product_name', 'app', 'application',
        'repository', 'repo', 'namespace', 'owner', 'target', 'service'
      ];
      for (const key of keys) {
        const value = proposal?.[key];
        if (typeof value === 'string' && value.toLowerCase().includes('unmanic')) {
          return true;
        }
      }
      const title = this.proposalTitle(proposal, 0);
      return typeof title === 'string' && title.toLowerCase().includes('unmanic');
    },
  },
  created() {
    this.fetchSettings();
    this.fetchSystemConfig();
    this.fetchFundingProposals();
  }
}
</script>

<style lang="scss">
.support-link-row {
  min-height: 28px;
  padding: 2px 8px;
}

.funding-card {
  height: 100%;
}
</style>
