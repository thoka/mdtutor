require_relative '../lib/severin/identifier'

describe Severin::Identifier do
  it "generates a valid 5-char alphanumeric ID with diamond prefix" do
    id = Severin::Identifier.generate
    expect(id).to match(/🔹[a-zA-Z0-9]{5}/)
  end

  it "extracts IDs from text" do
    text = "Dies ist eine Regel 🔹aB3c4 und noch eine 🔹12345."
    expect(Severin::Identifier.extract(text)).to eq(["aB3c4", "12345"])
  end

  it "detects presence of IDs" do
    expect(Severin::Identifier.present?("Test 🔹abc12")).to be true
    expect(Severin::Identifier.present?("Test ohne ID")).to be false
  end
end
