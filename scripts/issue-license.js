import { generateLicenseKey } from '../server/services/licenseService.js';

const args = process.argv.slice(2);
const clientName = args[0] || 'مطعم الأصيل - المعادي';
const hardwareId = args[1] || 'ANY'; // 'ANY' for universal or specific machine code e.g. EGY-POS-XXXX-XXXX
const daysValid = parseInt(args[2] || '365', 10);
const maxTables = parseInt(args[3] || '50', 10);

console.log('====================================================');
console.log('🔑 QRMate Egypt - Cryptographic License Generator');
console.log('====================================================');
console.log(`👤 Client / Venue:   ${clientName}`);
console.log(`💻 Machine ID:       ${hardwareId}`);
console.log(`⏳ Validity:         ${daysValid} Days (Yearly Subscription)`);
console.log(`🍽️ Max Tables:       ${maxTables}`);
console.log('----------------------------------------------------');

const licenseKey = generateLicenseKey(clientName, hardwareId, daysValid, maxTables);

console.log(`\n🎉 Generated Offline License Key:\n`);
console.log(licenseKey);
console.log(`\n----------------------------------------------------`);
console.log('💡 Give this key to the client to paste in Admin > License Tab.');
console.log('====================================================\n');
