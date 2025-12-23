<template>
  <UnmanicDialogMenu
    ref="dialogRef"
    :title="$t('headers.configureRemoteInstallationLink')"
    :action="saveAction"
    @save="save"
    @hide="onDialogHide"
  >
    <div class="q-pa-md">
      <q-card flat>
        <q-card-section>
          <div class="row">
            <div class="col-4 text-h6">{{ $t('components.settings.link.name') }}:</div>
            <div class="col-4">{{ name }}</div>
          </div>
          <div class="row">
            <div class="col-4 text-h6">{{ $t('components.settings.link.address') }}:</div>
            <div class="col-4">{{ address }}</div>
          </div>
          <div class="row">
            <div class="col-4 text-h6">{{ $t('components.settings.link.version') }}:</div>
            <div class="col-4">{{ version }}</div>
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section :class="isMobile ? 'q-px-none' : ''">
          <div class="row items-center no-wrap q-mb-md">
            <div class="col">
              <div class="text-h6">
                {{ $t('components.settings.link.connection') }}
              </div>
            </div>
          </div>

          <div class="q-gutter-sm">
            <q-input
              outlined
              color="primary"
              v-model="address"
              :label="$t('components.settings.link.address')"
              :placeholder="address"/>
          </div>

          <div class="q-gutter-sm q-mt-sm">
            <q-select
              outlined
              v-model="authType"
              :options="authOptions"
              :label="$t('components.settings.link.authentication')"
            />
          </div>

          <div v-if="authType !== 'None'" class="sub-setting q-pt-none q-mt-sm">
            <q-input
              outlined
              color="primary"
              v-model="username"
              :label="$t('components.settings.link.username')"
            />
          </div>

          <div v-if="authType !== 'None'" class="sub-setting q-pt-none q-pb-sm">
            <q-input
              outlined
              color="primary"
              v-model="password"
              :type="showPassword ? 'password' : 'text'"
              :label="$t('components.settings.link.password')"
            >
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section :class="isMobile ? 'q-px-none' : ''">
          <div class="row items-center no-wrap q-mb-md">
            <div class="col">
              <div class="text-h6">
                {{ $t('components.settings.link.remoteTaskProcessing') }}
              </div>
            </div>
          </div>

          <div class="q-gutter-sm">
            <q-skeleton v-if="enableReceivingTasks === null" type="QToggle"/>
            <q-toggle
              v-else
              v-model="enableReceivingTasks"
              :label="$t('components.settings.link.allowReceivingTasks')"
            />
          </div>

          <div class="q-gutter-sm">
            <q-skeleton v-if="enableSendingTasks === null" type="QToggle"/>
            <q-toggle
              v-else
              v-model="enableSendingTasks"
              :label="$t('components.settings.link.allowSendingTasks')"
              :disable="address === '???'"
            />
          </div>

          <div v-if="enableSendingTasks" class="sub-setting">
            <div class="q-gutter-sm">
              <q-skeleton v-if="enableTaskPreloading === null" type="QToggle"/>
              <q-toggle
                v-else
                v-model="enableTaskPreloading"
                :label="$t('components.settings.link.enableTaskPreloading')"
              />
            </div>
            <div v-if="enableTaskPreloading" class="sub-setting">
              <div class="q-gutter-sm">
                <q-skeleton v-if="preloadingCount === null" type="QInput"/>
                <q-input
                  v-if="preloadingCount !== null"
                  readonly
                  outlined
                  color="primary"
                  v-model="preloadingCount"
                  :label="$t('components.settings.link.preloadingCount')"
                  :placeholder="preloadingCount"
                />
                <q-skeleton v-if="preloadingCount === null" type="QSlider"/>
                <q-slider
                  v-if="preloadingCount !== null"
                  v-model="preloadingCount"
                  :min="0"
                  :max="10"
                  color="primary"
                />
              </div>
            </div>
          </div>

          <div v-if="enableSendingTasks" class="sub-setting">
            <div class="q-gutter-sm">
              <q-skeleton v-if="enableChecksumValidation === null" type="QToggle"/>
              <q-toggle
                v-else
                v-model="enableChecksumValidation"
                :label="$t('components.settings.link.enableChecksumValidation')"
              />
            </div>
          </div>

          <div v-if="enableSendingTasks" class="sub-setting">
            <div class="q-gutter-sm">
              <q-skeleton v-if="enableConfigMissingLibraries === null" type="QToggle"/>
              <q-toggle
                v-else
                v-model="enableConfigMissingLibraries"
                :label="$t('components.settings.link.enableConfigMissingLibraries')"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section :class="isMobile ? 'q-px-none' : ''">
          <div class="row items-center no-wrap q-mb-md">
            <div class="col">
              <div class="text-h6">
                {{ $t('components.settings.link.collectiveManagement') }}
              </div>
            </div>
          </div>

          <div class="q-gutter-sm">
            <q-skeleton v-if="enableDistributedWorkerCount === null" type="QToggle"/>
            <q-toggle
              v-else
              v-model="enableDistributedWorkerCount"
              :label="$t('components.settings.link.enableDistributedWorkerCount')"
            />
          </div>

          <div v-if="enableDistributedWorkerCount" class="sub-setting">
            <div class="q-gutter-sm">
              <q-skeleton v-if="distributedWorkerCountTarget === null" type="QSlider"/>
              <div class="q-pl-lg" style="width: 80%">
                <q-slider
                  v-if="distributedWorkerCountTarget !== null"
                  v-model="distributedWorkerCountTarget"
                  :min="0"
                  :max="12"
                  label
                  :label-value="$t('components.settings.link.workerTarget') + ': ' + distributedWorkerCountTarget"
                  label-always
                  color="primary"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </UnmanicDialogMenu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import { useMobile } from 'src/composables/useMobile'
import UnmanicDialogMenu from 'components/dialogs/standard/UnmanicDialogMenu.vue'

const props = defineProps({
  uuid: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['hide', 'saved'])

const $q = useQuasar()
const { t } = useI18n()
const { isMobile } = useMobile()

const dialogRef = ref(null)
const isOpen = ref(false)

const currentUuid = ref(null)
const address = ref('')
const authType = ref('None')
const authOptions = ref(['None', 'Basic'])
const username = ref(null)
const password = ref(null)
const showPassword = ref(true)
const available = ref(false)
const name = ref('')
const version = ref('')
const enableReceivingTasks = ref(null)
const enableSendingTasks = ref(null)
const enableTaskPreloading = ref(null)
const preloadingCount = ref(null)
const enableChecksumValidation = ref(null)
const enableConfigMissingLibraries = ref(null)
const enableDistributedWorkerCount = ref(null)
const distributedWorkerCountTarget = ref(null)

const saveAction = computed(() => ({
  label: t('navigation.save'),
  icon: 'save',
  emit: 'save'
}))

const resetState = () => {
  currentUuid.value = null
  address.value = ''
  authType.value = 'None'
  username.value = null
  password.value = null
  showPassword.value = true
  available.value = false
  name.value = ''
  version.value = ''
  enableReceivingTasks.value = null
  enableSendingTasks.value = null
  enableTaskPreloading.value = null
  preloadingCount.value = null
  enableChecksumValidation.value = null
  enableConfigMissingLibraries.value = null
  enableDistributedWorkerCount.value = null
  distributedWorkerCountTarget.value = null
}

const fetchInstallationLinkConfig = (uuid) => {
  const data = { uuid: uuid }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'settings/link/read'),
    data: data
  }).then((response) => {
    const linkConfig = response.data.link_config
    currentUuid.value = uuid
    address.value = linkConfig.address
    authType.value = linkConfig.auth
    username.value = linkConfig.username
    password.value = linkConfig.password
    available.value = linkConfig.available
    name.value = linkConfig.name
    version.value = linkConfig.version
    enableReceivingTasks.value = linkConfig.enable_receiving_tasks
    enableSendingTasks.value = linkConfig.enable_sending_tasks
    enableTaskPreloading.value = linkConfig.enable_task_preloading
    preloadingCount.value = linkConfig.preloading_count
    enableChecksumValidation.value = linkConfig.enable_checksum_validation
    enableConfigMissingLibraries.value = linkConfig.enable_config_missing_libraries
    enableDistributedWorkerCount.value = linkConfig.enable_distributed_worker_count
    distributedWorkerCountTarget.value = response.data.distributed_worker_count_target
  })
}

const saveInstallationLinkConfig = async () => {
  const data = {
    link_config: {
      uuid: currentUuid.value,
      address: address.value,
      auth: authType.value,
      username: username.value,
      password: password.value,
      enable_receiving_tasks: enableReceivingTasks.value,
      enable_sending_tasks: enableSendingTasks.value,
      enable_task_preloading: enableTaskPreloading.value,
      preloading_count: preloadingCount.value,
      enable_checksum_validation: enableChecksumValidation.value,
      enable_config_missing_libraries: enableConfigMissingLibraries.value,
      enable_distributed_worker_count: enableDistributedWorkerCount.value,
    },
    distributed_worker_count_target: distributedWorkerCountTarget.value,
  }
  try {
    await axios({
      method: 'post',
      url: getUnmanicApiUrl('v2', 'settings/link/write'),
      data: data
    })
    $q.notify({
      color: 'positive',
      position: 'top',
      icon: 'cloud_done',
      message: t('notifications.saved'),
      timeout: 200
    })
    return true
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.failedToSaveSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
    return false
  }
}

const save = async () => {
  const saved = await saveInstallationLinkConfig()
  if (saved) {
    emit('saved')
    hide()
  }
}

const show = () => {
  if (!dialogRef.value) {
    return
  }
  isOpen.value = true
  dialogRef.value.show()
  if (props.uuid) {
    resetState()
    fetchInstallationLinkConfig(props.uuid)
  }
}

const hide = () => {
  if (dialogRef.value) {
    dialogRef.value.hide()
  }
}

const onDialogHide = () => {
  isOpen.value = false
  emit('hide')
}

watch(() => props.uuid, (value) => {
  if (!value) {
    return
  }
  if (isOpen.value) {
    resetState()
    fetchInstallationLinkConfig(value)
  }
})

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.sub-setting {
  margin-left: 30px;
  padding-top: 8px;
  padding-left: 8px;
  border-left: solid thin var(--q-primary);
}
</style>
