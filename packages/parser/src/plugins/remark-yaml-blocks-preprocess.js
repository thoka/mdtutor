/**
 * Remark plugin to preprocess YAML blocks in markdown text
 * 
 * This plugin runs BEFORE remark-parse, so it works on the raw markdown text.
 * It converts YAML blocks to a format that remark-parse can handle correctly.
 * 
 * Syntax:
 * ---
 * title: value
 * ---
 * 
 * Rules:
 * - Three dashes (`---`) on a line by itself (without text before or after)
 * - YAML content between the dashes
 * - Closing `---` on a line by itself
 */

/**
 * Preprocess markdown to convert YAML blocks
 */
export default function remarkYamlBlocksPreprocess() {
  return (tree, file) => {
    if (!file || !file.value) return;
    
    const markdown = file.value;
    const lines = markdown.split('\n');
    const processed = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Check if this line is exactly "---" (YAML delimiter)
      // Must not have text before or after (to distinguish from block delimiters like "--- collapse ---")
      if (line.trim() === '---' && line === '---') {
        // Look ahead for YAML content and closing delimiter
        let yamlLines = [];
        let foundClosing = false;
        let j = i + 1;
        
        while (j < lines.length) {
          const nextLine = lines[j];
          
          // Check if this is the closing delimiter
          if (nextLine.trim() === '---' && nextLine === '---') {
            foundClosing = true;
            break;
          }
          
          // Collect YAML content
          yamlLines.push(nextLine);
          j++;
        }
        
        if (foundClosing && yamlLines.length > 0) {
          // Found a YAML block - replace with HTML comment markers that we can recognize later
          // We'll use a special format that won't interfere with parsing
          const yamlContent = yamlLines.join('\n');
          processed.push('<!-- YAML_START -->');
          processed.push(yamlContent);
          processed.push('<!-- YAML_END -->');
          i = j + 1; // Skip the closing ---
          continue;
        } else if (foundClosing && yamlLines.length === 0) {
          // Empty YAML block
          processed.push('<!-- YAML_START -->');
          processed.push('<!-- YAML_END -->');
          i = j + 1;
          continue;
        }
      }
      
      processed.push(line);
      i++;
    }
    
    // Update the file value
    file.value = processed.join('\n');
  };
}

