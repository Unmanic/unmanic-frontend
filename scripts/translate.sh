#!/bin/bash
# -
# File: translate.sh
# Project: unmanic-frontend
# File Created: Saturday, 28th August 2021 2:04:46 pm
# Author: Josh.5 (jsunnex@gmail.com)
# -----
# Last Modified: Friday, 3rd September 2021 11:49:47 pm
# Modified By: Josh.5 (jsunnex@gmail.com)
# -


project_root="$(readlink -e $(dirname $(readlink -e ${BASH_SOURCE[0]}))/../)"

languages_to_support="mi,zh,nl,fr,de,it,ja,ru,es,sv,pt-br,pl"

if [[ -z ${GOOGLE_TRANSLATE_API_KEY} ]]; then
    echo " Set the Google Translate API key in your bash variables before running. Exit!"
    exit 1
fi


pushd "${project_root}" &> /dev/null

i18n-translate-json ${GOOGLE_TRANSLATE_API_KEY} ./src/language/ en "${languages_to_support}"

popd &. /dev/null
