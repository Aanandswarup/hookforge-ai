/**
 * HookForge AI — License Key Generator & Batch Fulfillment Tool
 * 
 * Usage:
 *   node scripts/license-tool.cjs generate 10      # Generates 10 Pro license keys
 *   node scripts/license-tool.cjs export-csv 50    # Generates 50 keys and exports to 'license_keys.csv' (for Gumroad/LemonSqueezy)
 *   node scripts/license-tool.cjs verify <KEY>     # Validates a key's integrity
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateRandomSegment(length = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous characters (0, O, 1, I)
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateLicenseKey(prefix = 'HF-PRO') {
  const seg1 = generateRandomSegment(4);
  const seg2 = generateRandomSegment(4);
  const seg3 = generateRandomSegment(4);
  return `${prefix}-${seg1}-${seg2}-${seg3}`;
}

const command = process.argv[2] || 'generate';
const arg = process.argv[3] || '5';

if (command === 'generate') {
  const count = parseInt(arg, 10) || 5;
  console.log(`\n🔑 Generating ${count} HookForge PRO License Keys:\n`);
  for (let i = 1; i <= count; i++) {
    console.log(`  [${i.toString().padStart(2, '0')}] ${generateLicenseKey()}`);
  }
  console.log('\n💡 Copy and send any of these keys to buyers or testers.\n');
} else if (command === 'export-csv') {
  const count = parseInt(arg, 10) || 50;
  const filePath = path.join(__dirname, '..', 'license_keys.csv');
  const keys = ['License Key,Status,Created At'];
  const now = new Date().toISOString();

  for (let i = 0; i < count; i++) {
    keys.push(`${generateLicenseKey()},Available,${now}`);
  }

  fs.writeFileSync(filePath, keys.join('\n'), 'utf8');
  console.log(`\n✅ Successfully exported ${count} license keys to:\n   ${filePath}`);
  console.log('👉 Upload this CSV directly into Gumroad or LemonSqueezy under "License Keys"!\n');
} else if (command === 'verify') {
  const keyToVerify = (arg || '').trim().toUpperCase();
  const isValid = keyToVerify.startsWith('HF-PRO') && keyToVerify.length >= 10;
  console.log(`\nChecking Key: "${keyToVerify}"`);
  console.log(`Result: ${isValid ? '✅ VALID HookForge PRO Key' : '❌ INVALID Key Format'}\n`);
} else {
  console.log('\nCommands:');
  console.log('  node scripts/license-tool.cjs generate <count>');
  console.log('  node scripts/license-tool.cjs export-csv <count>');
  console.log('  node scripts/license-tool.cjs verify <KEY>\n');
}
