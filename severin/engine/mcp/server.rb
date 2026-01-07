#!/usr/bin/env ruby

require 'json'
require 'fileutils'

# Severin Bootstrap Launcher
# This script decides whether to load a local version of the Severin Engine
# (if present in the current project) or the global fallback version.

cwd = Dir.pwd
local_server_path = File.join(cwd, 'severin/engine/mcp/server.rb')
global_server_path = File.expand_path(__FILE__)

# Check if a local engine exists and is NOT the same as this global one
is_local_available = File.exist?(local_server_path) &&
                     File.expand_path(local_server_path) != global_server_path

# Store the launcher paths for info/restart tools
$SEVERIN_GLOBAL_LAUNCHER = global_server_path
$SEVERIN_LOCAL_LAUNCHER = is_local_available ? File.expand_path(local_server_path) : nil
$SEVERIN_ACTIVE_LAUNCHER = is_local_available ? $SEVERIN_LOCAL_LAUNCHER : $SEVERIN_GLOBAL_LAUNCHER

if is_local_available
  # Set a flag so the loaded server knows it's being bootstrapped
  $SEVERIN_BOOTSTRAPPED = true

  # Ensure the local lib directory is in the load path so 'require_relative' works correctly
  local_lib_path = File.join(cwd, 'severin/engine/lib')
  $LOAD_PATH.unshift(local_lib_path)

  begin
    # Inform via STDERR so it doesn't break JSON-RPC on STDOUT
    STDERR.puts "🐺 Severin: Bootstrapping local engine from #{local_server_path}"
    load local_server_path
  rescue => e
    STDERR.puts "❌ Error loading local Severin engine: #{e.message}. Falling back to global."
    require_relative 'server_impl'
    SeverinMCPServer.new.run
  end
else
  # Use global engine
  require_relative 'server_impl'
  SeverinMCPServer.new.run
end
