<template>
  <UnmanicDialogPopup
    ref="dialogRef"
    :title="$t('headers.releaseNotes')"
    width="1000px"
    @hide="onDialogHide"
  >
    <div class="q-pa-md release-notes-dialog-content">
      <span v-html="releaseNotes"></span>
    </div>
  </UnmanicDialogPopup>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import unmanicGlobals, { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import { markdownToHTML } from 'src/js/markupParser'
import UnmanicDialogPopup from 'components/ui/dialogs/UnmanicDialogPopup.vue'

const { t } = useI18n()
const $q = useQuasar()

const dialogRef = ref(null)
const releaseNotes = ref(null)
const symVer = ref('')

const show = () => {
  dialogRef.value.show()
}

const hide = () => {
  dialogRef.value.hide()
}

const markAsViewed = () => {
  // Configure settings to mark these release notes as viewed
  const data = {
    settings: {
      release_notes_viewed: symVer.value,
    }
  }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'settings/write'),
    data: data
  }).then((response) => {
    // Save success, Don't show feedback, just close
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.failedToSaveSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const onDialogHide = () => {
  markAsViewed()
}

const displayReleaseNotes = () => {
  // Fetch current settings
  axios({
    method: 'get',
    url: getUnmanicApiUrl('v2', 'settings/read')
  }).then((response) => {
    const releaseNotesViewed = response.data.settings.release_notes_viewed
    unmanicGlobals.getUnmanicVersion().then((version) => {
      if (version === 'UNKNOWN') {
        return
      }
      symVer.value = version.replace(/(~|\+).*/, '')

      if (releaseNotesViewed === symVer.value) {
        // This release notation was the last one viewed
        return
      }

      // Fetch release data from GitHub
      const url = "https://api.github.com/repos/Unmanic/unmanic/releases/tags/" + symVer.value
      axios({
        method: 'get',
        url: url,
      }).then((response) => {
        const publishDate = response.data.published_at
        const responseBody = response.data.body
        // Convert Markdown to HTML
        let releaseNotesHtml = markdownToHTML(responseBody)

        // Replace list heads with shields
        const newShield = '<img class="shield" src="https://shields.io/badge/-NEW-green" alt="NEW">'
        const imprShield = '<img class="shield" src="https://shields.io/badge/-IMPR-blue" alt="IMPR">'
        const fixShield = '<img class="shield" src="https://shields.io/badge/-FIX%20-grey" alt="FIX">'
        const noteShield = '<img class="shield" src="https://shields.io/badge/-NOTE-yellow" alt="NOTE">'
        releaseNotesHtml = releaseNotesHtml.replace(/(<li>)\[NEW\]([\S\s]*?)((<ul>)|(<\/li>))/g, '$1' + newShield + '<p>$2</p>$3')
        releaseNotesHtml = releaseNotesHtml.replace(/(<li>)\[IMPR\]([\S\s]*?)((<ul>)|(<\/li>))/g, '$1' + imprShield + '<p>$2</p>$3')
        releaseNotesHtml = releaseNotesHtml.replace(/(<li>)\[FIX\]([\S\s]*?)((<ul>)|(<\/li>))/g, '$1' + fixShield + '<p>$2</p>$3')
        releaseNotesHtml = releaseNotesHtml.replace(/(<li>)\[NOTE\]([\S\s]*?)((<ul>)|(<\/li>))/g, '$1' + noteShield + '<p>$2</p>$3')
        // Ensure that even if the above regex failed, we still replace the shield
        releaseNotesHtml = releaseNotesHtml.replace(/\[NEW\]/g, newShield)
        releaseNotesHtml = releaseNotesHtml.replace(/\[IMPR\]/g, imprShield)
        releaseNotesHtml = releaseNotesHtml.replace(/\[FIX\]/g, fixShield)
        releaseNotesHtml = releaseNotesHtml.replace(/\[NOTE\]/g, noteShield)

        // Generate Template from release notes
        const template = document.createElement('template')
        template.innerHTML = releaseNotesHtml
        // Add horizontal rule
        const hr = document.createElement('hr')
        template.content.prepend(hr)
        // Add header
        const headerDivContainer = document.createElement('div')
        headerDivContainer.className = 'row'

        const headerDiv1 = document.createElement('div')
        headerDiv1.className = 'col'
        const headerVersion = document.createElement('h1')
        headerVersion.appendChild(document.createTextNode('v' + symVer.value))
        headerDiv1.appendChild(headerVersion)

        const headerDiv2 = document.createElement('div')
        headerDiv2.className = 'col text-right text-primary'
        const headerDate = document.createElement('h4')
        const d = new Date(publishDate)
        headerDate.appendChild(document.createTextNode('Published: ' + d))
        headerDiv2.appendChild(headerDate)

        headerDivContainer.appendChild(headerDiv1)
        headerDivContainer.appendChild(headerDiv2)

        template.content.prepend(headerDivContainer)

        // Display release notes
        releaseNotes.value = template.innerHTML

        // Display dialog
        show()

      }).catch((error) => {
      })
    })
  })
}

onMounted(() => {
  displayReleaseNotes()
})

defineExpose({
  show,
  hide
})
</script>

<style>
.release-notes-dialog-content span > ul {
  padding-left: 10px;
}

.release-notes-dialog-content span > ul > li {
  list-style-type: none;
}

.release-notes-dialog-content span > ul > li > img {
  vertical-align: middle;
  margin-right: 10px;
  float: left;
  height: 20px;
  width: 40px;
}

.release-notes-dialog-content span > ul > li > p {
  overflow: hidden;
}

.release-notes-dialog-content span > ul > li > ul {
  padding-left: 63px;
}


.release-notes-dialog-content h1 {
  font-size: 2.125rem;
  line-height: 2.125rem;
  color: var(--q-primary);
  font-weight: 600;
}

.release-notes-dialog-content h2 {
  font-size: 1.75rem;
  line-height: 1.75rem;
}

.release-notes-dialog-content h3 {
  font-size: 1.5rem;
  line-height: 1.5rem;
}

.release-notes-dialog-content h4 {
  font-size: 1.25rem;
  line-height: 1.5rem;
}

.release-notes-dialog-content h5 {
  font-size: 1rem;
  line-height: 1.5rem;
}

.release-notes-dialog-content h6 {
  font-size: 1rem;
  line-height: 1.5rem;
}
</style>