# Implementation Plan: Switch Severin Engine from Symlink to Submodule

## Goal
Replace the current symbolic link at `severin/engine` with a git submodule pointing to the official Severin repository.

## Steps
1. **Remove Symlink**: Remove `severin/engine` from the git index and delete the physical symlink.
2. **Add Submodule**: Add `git@github.com:thoka/severin.git` as a submodule at `severin/engine`.
3. **Update Integrity Rules**: Modify `severin/rules/1-setup/engine.rb` to accept both symlinks and directories for `severin/engine`.
4. **Verification**: Run `sv check` to ensure all rules pass.

## Rationale
Using a submodule allows for better version control and portability across different development environments compared to a hardcoded local path symlink.


