# severin_state.rb
# Use this file to dynamically activate tags and skills for Cursor.
# This file is intended for use in feature branches and should not be merged to main.

Severin.set_focus(
  tags: [:workflow, :architect],
  skills: ["Agenten-Verhalten", "Strict Integrity Enforcement"],
  # List checks here that should only be warnings in this sprint.
  # Use the base name of the check (without the 🔹ID).
  allow_warnings: [
    # :example_check
  ]
)
