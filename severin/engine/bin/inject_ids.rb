#!/usr/bin/env ruby
# 🔹 Inject unique IDs (suffix) into Severin rules

require 'fileutils'

CHARSET = ('a'..'z').to_a + ('A'..'Z').to_a + ('0'..'9').to_a

def generate_id
  "🔹" + (0...5).map { CHARSET.sample }.join
end

# Improved pattern to match strings correctly, avoiding internal quotes
# It matches the keyword, space, then a quoted string.
# We handle both "..." and '...'
PATTERN_DQ = /(check|rule|define_skill|define_suite)(\s+)(")(.*?)(?<!\\)(")/m
PATTERN_SQ = /(check|rule|define_skill|define_suite)(\s+)(')(.*?)(?<!\\)(')/m

def process_text(text)
  modified = false
  new_text = text.dup
  current_id = nil

  # 1. Migrate old format: 📜xxxxx Text -> Text 🔹xxxxx
  if new_text.start_with?("📜")
    current_id = new_text[0..5].gsub("📜", "🔹")
    new_text = new_text[7..-1] || ""
    modified = true
  end

  # 2. Check for existing diamond ID anywhere
  if new_text =~ /🔹([a-zA-Z0-9]{5})/
    found_id = $1
    if current_id
      # We moved it, so we replace any existing diamond with the migrated one
      new_text.gsub!(/🔹[a-zA-Z0-9]{5}/, "")
      new_text = "#{new_text.strip} #{current_id}"
    else
      # Keep existing diamond ID but move to end if it's not there
      current_id = "🔹#{found_id}"
      temp_text = new_text.gsub(/🔹[a-zA-Z0-9]{5}/, "").strip
      if new_text.strip != "#{temp_text} #{current_id}"
        new_text = "#{temp_text} #{current_id}"
        modified = true
      end
    end
  else
    # No diamond ID found, add a new one or the migrated one
    modified = true
    current_id ||= generate_id
    new_text = "#{new_text.strip} #{current_id}"
  end

  [new_text, modified, current_id]
end

def process_file(path)
  content = File.read(path)
  file_modified = false

  # Handle Double Quoted strings
  content.gsub!(PATTERN_DQ) do |match|
    type, space, quote, text, end_quote = $1, $2, $3, $4, $5
    new_text, modified, id = process_text(text)
    if modified
      file_modified = true
      $stdout.puts "  [#{id}] Updating #{type}: #{new_text[0..30]}..." # SEVERIN_ALLOW_PUTS
      "#{type}#{space}#{quote}#{new_text}#{end_quote}"
    else
      match
    end
  end

  # Handle Single Quoted strings
  content.gsub!(PATTERN_SQ) do |match|
    type, space, quote, text, end_quote = $1, $2, $3, $4, $5
    new_text, modified, id = process_text(text)
    if modified
      file_modified = true
      $stdout.puts "  [#{id}] Updating #{type}: #{new_text[0..30]}..." # SEVERIN_ALLOW_PUTS
      "#{type}#{space}#{quote}#{new_text}#{end_quote}"
    else
      match
    end
  end

  # 3. Handle heredocs
  content.gsub!(/(rule\s+<<~([A-Z]+)\n)(.*?)\n(\s*\2)/m) do |match|
    header, marker, body, footer = $1, $2, $3, $4
    new_body, modified, id = process_text(body)
    if modified
      file_modified = true
      $stdout.puts "  [#{id}] Updating heredoc rule..." # SEVERIN_ALLOW_PUTS
      "#{header}#{new_body}\n#{footer}"
    else
      match
    end
  end

  if file_modified
    File.write(path, content)
    true
  else
    false
  end
end

rules_dir = File.expand_path("../../rules", __dir__)
$stdout.puts "Scanning rules in #{rules_dir}..." # SEVERIN_ALLOW_PUTS

count = 0
Dir.glob(File.join(rules_dir, "**/*.rb")).each do |file|
  if process_file(file)
    count += 1
  end
end

$stdout.puts "\nFinished. Modified #{count} files." # SEVERIN_ALLOW_PUTS
