#!/bin/bash -ex
export PC_TEST_ROOT="$(mktemp -d /tmp/sirius-eco-system-clean.XXXXXX)"
export PC_HOME="$PC_TEST_ROOT/home"
export PC_CACHE="$PC_TEST_ROOT/npm-cache"
export PC_DATA="$PC_TEST_ROOT/sirius-eco-system-data"
mkdir -p "$PC_HOME" "$PC_CACHE" "$PC_DATA"
echo "PC_TEST_ROOT: $PC_TEST_ROOT"
echo "PC_HOME: $PC_HOME"
cd $PC_TEST_ROOT
git clone https://github.com/sirius-eco-system/sirius-eco-system.git repo
cd repo
pnpm install
env HOME="$PC_HOME" npm_config_cache="$PC_CACHE" npm_config_userconfig="$PC_HOME/.npmrc" \
  pnpm sirius-eco-system onboard --yes --data-dir "$PC_DATA"