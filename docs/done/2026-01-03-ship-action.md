# Ship Action Implementation

Implement a robust `ship` action for Severin to automate the release process to `main`.

## Goals
- Automate engine submodule push.
- Automate project sync (integrity check + commit).
- Automate merging to `main` and pushing to remote.
- Ensure safety by stopping on any failure.

## Steps
1. Create `severin/actions/ship.rb`.
2. Update `severin/actions/commit.rb` to return success/failure status.
3. Handle submodule logic to push engine changes if clean.
4. Merge `main` with rebase to ensure clean history.

