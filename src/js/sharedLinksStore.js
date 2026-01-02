import { reactive } from 'vue'
import axios from 'axios'
import { getUnmanicApiUrl } from './unmanicGlobals'

export const sharedLinksStore = reactive({
  target: localStorage.getItem('unmanic-installation-target') || 'local',
  availableLinks: [],
  localName: '',

  async fetchLinks() {
    try {
      const response = await axios.get(getUnmanicApiUrl('v2', 'settings/read'), { skipProxy: true })
      this.availableLinks = response.data.settings.remote_installations || []
      this.localName = response.data.settings.installation_name || ''
    } catch (e) {
      console.error("Failed to fetch shared links", e)
      this.availableLinks = []
    }
  },

  setTarget(newTarget) {
    this.target = newTarget
    localStorage.setItem('unmanic-installation-target', newTarget)

    location.reload()
  }
})
