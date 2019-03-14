#!/bin/bash
#
# Run program, retry with timeout on fail
#

#
# Main retry loop
#
main() {
  local run_count=0
  local max_runs=100000
  local run_timeout=60
  local should_run=true

  # https://stackoverflow.com/questions/6871859/piping-command-output-to-tee-but-also-save-exit-code-of-command
  set +o pipefail

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
}

# truncate --size=0 ./output.log
main 2>&1 | tee -a ./output.log
