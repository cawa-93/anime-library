#!/bin/bash

staged=$(git diff --name-only --cached | grep -E "(tsconfig.json|.ts|.vue)$")

args=()

if [[ "$staged" == *"packages/main"* ]]; then
  args=("${args[@]}" "npm:typecheck:main")
fi

if [[ "$staged" == *"packages/preload"* ]]; then
  args=("${args[@]}" "npm:typecheck:preload")

fi

if [[ "$staged" == *"packages/renderer"* ]]; then
  args=("${args[@]}" "npm:typecheck:renderer")
fi

# shellcheck disable=SC2128
if [ -z "$args" ]; then
  echo "No type sensitivity files staged"
else
  npx concurrently --raw "${args[@]}"
fi
