#!/usr/bin/env bash
set -euo pipefail

set_env() {
  local key="$1"
  local val="$2"
  local file="${3:-.env}"

  touch "$file"

  local escaped_val
  escaped_val=$(printf '%s\n' "$val" | sed -e 's/[\\/&|]/\\&/g')

  if grep -q "^${key}=" "$file" 2>/dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^${key}=.*|${key}=${escaped_val}|" "$file"
    else
      sed -i "s|^${key}=.*|${key}=${escaped_val}|" "$file"
    fi
  else
    echo "${key}=${val}" >> "$file"
  fi
}

# Run function if arguments provided
if [[ $# -ge 2 ]]; then
  set_env "$1" "$2" "${3:-.env}"
fi
