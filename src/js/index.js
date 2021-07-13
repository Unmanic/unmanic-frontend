let $scope = {};

/* Import Bootstrap */
import 'bootstrap';

/* Import fontawesome */
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

/* Import simple line icons */
import 'simple-line-icons';

/* Import Socicon */
import 'socicon';

/* Import jQuery Uniform */
import 'jquery.uniform';

/* Import project styling */
import '../scss/index.scss';
import '../scss/custom.scss';

// Import Unmanic API
import { UnmanicApi } from './api';

// Import DashboardData WS
import { DashboardData } from './dashboard_data';

import compiledTemplate from '../templates/page-template.hbs';

const renderPage = function () {
  /* Generate page */
  let parser = document.createElement('a');
  parser.href = window.location.href;

  // Decide which page to draw
  let pageName;
  switch (true) {
    case /^\/settings(?:[/]|$)/.test(parser.pathname):
      pageName = 'Settings';
      break;
    case /^\/plugins(?:[/]|$)/.test(parser.pathname):
      pageName = 'Plugins';
      break;
    default:
      pageName = 'Dashboard';
      DashboardData.init();
      break;
  }

  // Set the page title
  $(document).prop('title', pageName + ' | Unmanic');

  // Create a new div element
  let div = document.createElement('div');

  // Populate template data
  let templateData = {
    unmanic_version: $scope.version,
    page_name: pageName,
    session: $scope.session,
  };

  // Insert generated template into created div element
  div.innerHTML = compiledTemplate(templateData);

  // Append that div element to the body
  document.body.appendChild(div);
};

const setVersionScope = function () {
  // Fetch session data
  if (typeof $scope.version !== 'undefined') {
    return true;
  }
  return UnmanicApi.get('v2', 'version/read').then(function (data) {
    $scope.version = data.version;
  });
};

const setSessionScope = function () {
  // Fetch session data
  return UnmanicApi.get('v2', 'session/state').then(function (data) {
    $scope.session = data;
  });
};

const loadPageContent = function () {
  $.when(setSessionScope(), setVersionScope()).done(function () {
    renderPage();
  });
};

document.addEventListener('DOMContentLoaded', function () {
  loadPageContent();
});
