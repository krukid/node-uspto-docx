#!/bin/bash

#############################################################
IFS=$'\n' DETAILS=($(find /app/output/cache -name details-html))

for root in "${DETAILS[@]}"; do
  cd "$root"
  echo -n "Testing $root..."
  value=$(grep -l "value markText" * | wc -l)
  expect=$(ls -1 | wc -l)
  if [[ $value = $expect ]]; then
    echo "OK $value = $expect"
  else
    echo "FAIL $value != $expect"
  fi
done

#############################################################
IFS=$'\n' LOGOS=($(find /app/output/cache -name images-logo))

for root in "${LOGOS[@]}"; do
  cd "$root"
  echo -n "Testing $root..."
  value=$(find . -maxdepth 1 -type f -size +1 | xargs -I % sh -c 'identify % 1>/dev/null || echo %;')
  if [[ -z $value ]]; then
    echo "OK $value"
  else
    echo "FAIL $value"
  fi
done
