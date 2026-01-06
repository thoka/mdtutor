# Fix Fail-Fast Behavior in `sv check` 🔹ZSVv7
Status: in-progress

## Problem
`sv check` executes all tests even if a critical error occurs, or at least it doesn't clearly stop and show the errors of the failed stage before continuing or exiting. The current implementation in `cli.rb` attempts a fail-fast but it seems to be ineffective or confusing in its output.

## Goals
- [ ] Ensure `sv check` stops immediately after a stage with critical errors.
- [ ] Ensure that only the results of the already executed suites are displayed upon failure.
- [ ] Improve error visibility for the user.

## Plan
1.  Analyze `run_stages` in `severin/engine/lib/severin/cli.rb`.
2.  Modify the loop to properly interrupt and display errors.
3.  Test with a failing rule.

