const { execSync } = require('child_process');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const { overrideMoveVersion } = require('../move.config.js');

function parseYaml(filePath) {
  const yamlContent = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(yamlContent);
}

function getConfigAndPlatform(networkArg) {
  let configPath, platform;
  
  // Default to Aptos if no network specified or if explicitly set to something other than 'movement'
  if (!networkArg || networkArg.toLowerCase() !== 'movement') {
    platform = 'aptos';
    configPath = path.join(__dirname, '../.aptos/config.yaml');
  } else {
    platform = 'movement';
    configPath = path.join(__dirname, '../.movement/config.yaml');
  }

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const config = parseYaml(configPath);
  return { config, platform };
}

async function main() {
  // Parse command line arguments
  const argv = minimist(process.argv.slice(2));
  const networkArg = argv.network;

  // Get config and determine platform based on network argument
  const { config, platform } = getConfigAndPlatform(networkArg);
  const network = config.profiles.default.network;

  // Determine if network is custom (localhost or custom URL)
  const isCustomNetwork = network.includes('Custom');

  // Build deploy command based on platform
  let deployCommand = platform === 'aptos' ? 'aptos move publish' : 'movement move publish';
  
  if (isCustomNetwork) {
    // Default to move-1 and bytecode-version 6 for custom networks
    deployCommand += ' --bytecode-version 6';
  } else if (overrideMoveVersion) {
    if (overrideMoveVersion === 'move-1') {
      deployCommand += ' --move-1';
    } else if (overrideMoveVersion === 'move-2') {
      deployCommand += ' --move-2';
    } else {
      throw new Error(`Invalid move version: ${overrideMoveVersion}`);
    }
  }

  // Add assume-yes flag
  deployCommand += ' --assume-yes';

  try {
    // Execute deploy command
    console.log(`Executing (${platform}): ${deployCommand}`);
    execSync(deployCommand, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Deployment failed (${platform}):`, error.message);
    process.exit(1);
  }
}

main().catch(console.error);