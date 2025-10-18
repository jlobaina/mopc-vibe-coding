#!/usr/bin/env node

/**
 * Port Configuration Check Script
 *
 * This script validates that environment variables match the expected port
 * configuration to prevent logout redirect issues.
 */

const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
const APP_URL = process.env.APP_URL;
const NODE_ENV = process.env.NODE_ENV;

// Default port for development
const DEFAULT_PORT = 3000;

function extractPort(url) {
  if (!url) return null;
  const match = url.match(/:(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function checkPortConfig() {
  console.log('🔍 Checking port configuration...\n');

  const nextauthPort = extractPort(NEXTAUTH_URL);
  const appPort = extractPort(APP_URL);

  console.log(`📋 Configuration:`);
  console.log(`   NEXTAUTH_URL: ${NEXTAUTH_URL}`);
  console.log(`   APP_URL: ${APP_URL}`);
  console.log(`   NODE_ENV: ${NODE_ENV}`);
  console.log(`   Default Port: ${DEFAULT_PORT}\n`);

  // Check if URLs are properly configured
  if (!NEXTAUTH_URL) {
    console.log('❌ NEXTAUTH_URL is not set');
    return false;
  }

  if (!APP_URL) {
    console.log('❌ APP_URL is not set');
    return false;
  }

  // Check port consistency
  if (nextauthPort !== DEFAULT_PORT) {
    console.log(`⚠️  NEXTAUTH_URL port (${nextauthPort}) doesn't match default port (${DEFAULT_PORT})`);

    if (NODE_ENV === 'development') {
      console.log('💡 Suggestion: Update NEXTAUTH_URL to use port 3000 for development');
      console.log('   Example: NEXTAUTH_URL="http://localhost:3000"');
    }
  }

  if (appPort !== DEFAULT_PORT) {
    console.log(`⚠️  APP_URL port (${appPort}) doesn't match default port (${DEFAULT_PORT})`);

    if (NODE_ENV === 'development') {
      console.log('💡 Suggestion: Update APP_URL to use port 3000 for development');
      console.log('   Example: APP_URL="http://localhost:3000"');
    }
  }

  // Check port consistency between URLs
  if (nextauthPort !== appPort) {
    console.log(`❌ Port mismatch: NEXTAUTH_URL uses port ${nextauthPort}, APP_URL uses port ${appPort}`);
    console.log('💡 Both URLs should use the same port');
    return false;
  }

  // Check if everything is properly configured
  if (nextauthPort === DEFAULT_PORT && appPort === DEFAULT_PORT) {
    console.log('✅ Port configuration is correct!');
    console.log(`   All URLs are using port ${DEFAULT_PORT}`);
    return true;
  }

  return false;
}

function checkEnvFile() {
  const envLocalPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envLocalPath)) {
    console.log('❌ .env.local file not found');
    console.log('💡 Create .env.local from .env.example');
    return false;
  }

  console.log('✅ .env.local file exists');
  return true;
}

function main() {
  console.log('🚀 Port Configuration Validator\n');
  console.log('=====================================\n');

  const envFileExists = checkEnvFile();
  const portConfigOk = checkPortConfig();

  console.log('\n=====================================\n');

  if (envFileExists && portConfigOk) {
    console.log('✅ All checks passed! Your port configuration is ready for development.');
    process.exit(0);
  } else {
    console.log('❌ Configuration issues detected. Please fix them before starting the development server.');
    console.log('\n📚 For more information, see: LOGOUT_REDIRECT_FIX.md');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkPortConfig, checkEnvFile };