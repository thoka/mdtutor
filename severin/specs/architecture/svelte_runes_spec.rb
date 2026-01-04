RSpec.describe "Svelte 5 Runes Architecture" do
  it "ensures all .svelte files use runes (no legacy stores)" do
    svelte_files = Dir.glob("**/*.svelte")
    svelte_files.each do |file|
      content = File.read(file)
      if content.include?("<script")
        expect(content).not_to include("writable("), "Legacy store 'writable' found in #{file}"
        expect(content).not_to include("readable("), "Legacy store 'readable' found in #{file}"
      end
    end
  end
end
