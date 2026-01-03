define_environment "PROJECT_RULES.md" do
  format :human
  doc_language "English"
  description "Central documentation of project rules for humans."
end

define_environment ".cursorrules" do
  format :ai
  chat_language "Deutsch"
  doc_language  "English"
  description "Direct instructions for AI agents in Cursor."
end

define_environment "severin/engine/README.md" do
  format :human
  doc_language "English"
  description "Documentation of the global Severin engine."
end
