#!/bin/bash
#
# Run program, retry with timeout on fail
#

run_count=0
max_runs=10
run_timeout=120
should_run=true

#
# Main retry loop
#

while $should_run; do
  run_count=$(($run_count+1))
  ########################### MAIN COMMAND
  node -r dotenv/config index.js
  ########################### END
  run_code=$?
  if [[ $run_code -ne 0 && $run_count -lt $max_runs ]]; then
    echo "Bad exit code, will retry in $run_timeout seconds..."
    sleep $run_timeout
    should_run=true
  else
    should_run=false
  fi
done

#
# Print program run status
#

if [[ $run_code -eq 0 ]]; then
  echo "Successfully completed."
else
  echo "Failed to complete."
fi
echo "Total runs: $run_count"
