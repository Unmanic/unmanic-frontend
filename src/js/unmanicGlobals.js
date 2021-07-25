import {api} from "boot/axios";

export default {
  unmanicApiUrl: '',
  getUnmanicApiUrl(api_version, api_endpoint) {
    if (this.unmanicApiUrl === '') {
      let parser = document.createElement('a');
      parser.href = window.location.href;

      this.unmanicApiUrl = parser.protocol + '//' + parser.host + '/api';
    }
    return this.unmanicApiUrl + '/' + api_version + '/' + api_endpoint;
  },
  unmanicVersion: '',
  setUnmanicVersion(setVar) {
    if (this.unmanicVersion === '') {
      api.get(this.getUnmanicApiUrl('v2', 'version/read'))
        .then((response) => {
          this.unmanicVersion = response.data.version;
          setVar = this.unmanicVersion
        })
        .catch(() => {})
    } else {
      setVar = this.unmanicVersion;
    }
  }
}
