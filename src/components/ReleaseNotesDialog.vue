<template>
  <q-dialog
    v-model="displayDialog"
    :maximized="$q.platform.is.mobile"
    :transition-show="$q.platform.is.mobile?'jump-left':'scale'"
    :transition-hide="$q.platform.is.mobile?'jump-right':'scale'"
    full-height
    @hide="markAsViewed">

    <q-card
      v-touch-swipe.touch.right="hide"
      class="markdown-dialog"
      style="max-width:1000px;">

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
              {{ $t('headers.releaseNotes') }}
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
              icon="close_fullscreen"
              v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">

        <div class="q-pa-md release-notes-dialog-content">
          <span v-html="releaseNotes"></span>
        </div>
      </q-card-section>

    </q-card>

  </q-dialog>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import unmanicGlobals, { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { markdownToHTML } from "src/js/markupParser";

export default {
  props: {},
  emits: [],
  methods: {

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.displayDialog = false;
    },

    markAsViewed() {
      // Configure settings to mark these release notes as viewed
      let data = {
        settings: {
          release_notes_viewed: this.symVer,
        }
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/write'),
        data: data
      }).then((response) => {
        // Save success, Don't show feedback, just close
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSaveSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },

    displayReleaseNotes() {
      // Fetch current settings
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/read')
      }).then((response) => {
        const releaseNotesViewed = response.data.settings.release_notes_viewed
        unmanicGlobals.getUnmanicVersion().then((version) => {
          if (version === 'UNKNOWN') {
            return;
          }
          this.symVer = version.replace(/(~|\+).*/, '');

          if (releaseNotesViewed === this.symVer) {
            // This release notation was the last one viewed
            return;
          }

          const stringToElement = function (htmlString) {
            let template = document.createElement('template');
            template.innerHTML = htmlString;
            return template.content;
          }

          const templateRender = function (templateId, data) {
            const template = document.getElementById(templateId).innerHTML;
            const pattern = /{\s*(\w+?)\s*}/g;
            return template.replace(pattern, (_, token) => data[token] || '');
          }

          // Fetch release data from GitHub
          let url = "https://api.github.com/repos/Unmanic/unmanic/releases/tags/" + this.symVer
          axios({
            method: 'get',
            url: url,
          }).then((response) => {
            let publishDate = response.data.published_at;
            let responseBody = response.data.body;
            // Convert Markdown to HTML
            let releaseNotesHtml = markdownToHTML(responseBody);

            // Replace list heads with shields
            let newShield = '<img class="shield" src="https://shields.io/badge/-NEW-green" alt="NEW">'
            let imprShield = '<img class="shield" src="https://shields.io/badge/-IMPR-blue" alt="IMPR">'
            let fixShield = '<img class="shield" src="https://shields.io/badge/-FIX%20-grey" alt="FIX">'
            let noteShield = '<img class="shield" src="https://shields.io/badge/-NOTE-yellow" alt="NOTE">'
            releaseNotesHtml = releaseNotesHtml.replace(/(<li>)\[NEW\]([\S\s]*?)((<ul>)|(<\/li>))/g, '$1' + newShield + '<p>$2</p>$3');
            releaseNotesHtml = releaseNotesHtml.replace(/(<li>)\[IMPR\]([\S\s]*?)((<ul>)|(<\/li>))/g, '$1' + imprShield + '<p>$2</p>$3');
            releaseNotesHtml = releaseNotesHtml.replace(/(<li>)\[FIX\]([\S\s]*?)((<ul>)|(<\/li>))/g, '$1' + fixShield + '<p>$2</p>$3');
            releaseNotesHtml = releaseNotesHtml.replace(/(<li>)\[NOTE\]([\S\s]*?)((<ul>)|(<\/li>))/g, '$1' + noteShield + '<p>$2</p>$3');
            // Ensure that even if the above regex failed, we still replace the shield
            releaseNotesHtml = releaseNotesHtml.replace(/\[NEW\]/g, newShield);
            releaseNotesHtml = releaseNotesHtml.replace(/\[IMPR\]/g, imprShield);
            releaseNotesHtml = releaseNotesHtml.replace(/\[FIX\]/g, fixShield);
            releaseNotesHtml = releaseNotesHtml.replace(/\[NOTE\]/g, noteShield);

            // Generate Template from release notes
            let template = document.createElement('template');
            template.innerHTML = releaseNotesHtml;
            // Add horizontal rule
            let hr = document.createElement('hr');
            template.content.prepend(hr);
            // Add header
            let headerDivContainer = document.createElement('div');
            headerDivContainer.className = 'row';

            let headerDiv1 = document.createElement('div');
            headerDiv1.className = 'col';
            let headerVersion = document.createElement('h1');
            headerVersion.appendChild(document.createTextNode('v' + this.symVer));
            headerDiv1.appendChild(headerVersion);

            let headerDiv2 = document.createElement('div');
            headerDiv2.className = 'col text-right text-primary';
            let headerDate = document.createElement('h4');
            let d = new Date(publishDate)
            headerDate.appendChild(document.createTextNode('Published: ' + d));
            headerDiv2.appendChild(headerDate);

            headerDivContainer.appendChild(headerDiv1);
            headerDivContainer.appendChild(headerDiv2);

            template.content.prepend(headerDivContainer);

            // Display dialog
            this.displayDialog = true;

            // Display release notes
            this.releaseNotes = template.innerHTML;

          }).catch((error) => {
          })
        })
      });
    }
  },
  created() {
    this.displayReleaseNotes();
  },
  data: function () {
    const releaseNotes = ref(null);
    return {
      displayDialog: ref(false),
      symVer: ref(''),
      releaseNotes
    }
  }
}
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
