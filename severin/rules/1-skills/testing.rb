define_skill "Severin Test Engineer 🔹TstEng" do
  description <<~TEXT
    Expertise in unified testing, RSpec integration, and state management.

    CORE CONCEPTS:
    - Rules are both instructions and executable tests (severin/rules/*.rb).
    - Validation uses RSpec files in 'severin/specs/'.
    - Use 'rspec "path/to/spec"' within checks.

    WORKFLOW:
    1. Define rule in Severin suite.
    2. Write RSpec spec in 'severin/specs/'.
    3. Link spec via 'rspec' helper.
    4. Run 'sv gen' to sync instructions (minimal headers).

    DEBUGGING & FIXING:
    - Severin captures the last 5 lines of RSpec failures.
    - Use the suggested `fix_command` to re-run only the failed specs.
    - Always verify that required services are responding before assuming code bugs.
  TEXT

  rule "Befolge den Unified Testing Workflow für alle Architektur- und Logik-Prüfungen. 🔹v3R9t"

  check "RSpec Extension Active" do
    condition { Severin::CheckContext.instance_methods.include?(:rspec) }
    on_fail "Die RSpec-Erweiterung in der Engine ist nicht aktiv."
  end
end
