import crypto from 'crypto';
import os from 'os';

// Master secret used by vendor for cryptographic license signing
const VENDOR_SECRET = 'EGYPT_RESTAURANT_POS_SECURE_KEY_2026_AGY_MASTER_SALT';

/**
 * Generate a deterministic Hardware Machine Fingerprint for the server PC
 */
export function getMachineFingerprint() {
  try {
    const netInterfaces = os.networkInterfaces();
    let macAddress = '00:00:00:00:00:00';
    for (const name of Object.keys(netInterfaces)) {
      for (const net of netInterfaces[name]) {
        if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') {
          macAddress = net.mac;
          break;
        }
      }
      if (macAddress !== '00:00:00:00:00:00') break;
    }

    const rawId = `${os.hostname()}-${os.platform()}-${os.arch()}-${macAddress}`;
    const hash = crypto.createHash('sha256').update(rawId).digest('hex').substring(0, 16).toUpperCase();
    return `EGY-POS-${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`;
  } catch (err) {
    return 'EGY-POS-DEV-LOCAL-NODE-2026';
  }
}

/**
 * Generate a cryptographically signed offline license token (Used by Support/Vendor)
 */
export function generateLicenseKey(clientName, hardwareId, daysValid = 365, maxTables = 50) {
  const issueDate = new Date().toISOString().split('T')[0];
  const validUntil = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const payload = {
    client: clientName,
    hid: hardwareId,
    tables: maxTables,
    issued: issueDate,
    expiry: validUntil,
    features: ['nfc_qr_menu', 'captain_alerts', 'kds_kitchen', 'kds_barista', 'pos_billing', 'reports_analytics', 'offline_resilience']
  };

  const payloadStr = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', VENDOR_SECRET).update(payloadStr).digest('hex').substring(0, 24).toUpperCase();
  
  const encodedPayload = Buffer.from(payloadStr).toString('base64');
  return `LIC-${encodedPayload}.${signature}`;
}

/**
 * Verify and parse an offline license key against the current machine
 */
export function verifyLicenseKey(licenseKey) {
  const currentHardwareId = getMachineFingerprint();

  if (!licenseKey || typeof licenseKey !== 'string') {
    return {
      isValid: false,
      status: 'MISSING',
      message: 'لم يتم تفعيل الترخيص بعد. يرجى إدخال مفتاح الترخيص السنوي.',
      messageEn: 'No license key activated. Please enter your yearly license key.',
      hardwareId: currentHardwareId,
      daysRemaining: 0
    };
  }

  // Built-in Demo / Evaluation Mode Support
  if (licenseKey === 'DEMO-EVALUATION-2026-KEY' || licenseKey.startsWith('DEMO-')) {
    return {
      isValid: true,
      status: 'DEMO',
      clientName: 'نسخة تجريبية / Demo Evaluation',
      hardwareId: currentHardwareId,
      issued: '2026-01-01',
      expiry: '2027-12-31',
      daysRemaining: 365,
      maxTables: 30,
      features: ['nfc_qr_menu', 'captain_alerts', 'kds_kitchen', 'kds_barista', 'pos_billing', 'reports_analytics', 'offline_resilience'],
      message: 'الترخيص التجريبي مفعّل بنجاح.',
      messageEn: 'Evaluation license active.'
    };
  }

  try {
    const parts = licenseKey.replace(/^LIC-/, '').split('.');
    if (parts.length !== 2) {
      return { isValid: false, status: 'INVALID_FORMAT', message: 'صيغة مفتاح الترخيص غير صحيحة.', hardwareId: currentHardwareId };
    }

    const [encodedPayload, signature] = parts;
    const payloadStr = Buffer.from(encodedPayload, 'base64').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', VENDOR_SECRET).update(payloadStr).digest('hex').substring(0, 24).toUpperCase();

    if (signature !== expectedSig) {
      return { isValid: false, status: 'INVALID_SIGNATURE', message: 'مفتاح الترخيص غير صالح أو تم التلاعب به.', hardwareId: currentHardwareId };
    }

    const data = JSON.parse(payloadStr);
    
    // Check hardware binding (or wildcard 'ANY')
    if (data.hid !== 'ANY' && data.hid !== currentHardwareId) {
      return { 
        isValid: false, 
        status: 'HARDWARE_MISMATCH', 
        message: `هذا الترخيص مخصص لجهاز آخر (${data.hid}). معرّف هذا الجهاز هو (${currentHardwareId})`, 
        hardwareId: currentHardwareId 
      };
    }

    const expiryDate = new Date(data.expiry);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return {
        isValid: false,
        status: 'EXPIRED',
        clientName: data.client,
        hardwareId: currentHardwareId,
        expiry: data.expiry,
        daysRemaining: 0,
        message: `انتهت صلاحية الترخيص السنوي بتاريخ ${data.expiry}. يرجى تجديد الاشتراك مع الدعم الفني.`,
        messageEn: `License expired on ${data.expiry}. Please renew your subscription with technical support.`
      };
    }

    return {
      isValid: true,
      status: daysRemaining <= 15 ? 'EXPIRING_SOON' : 'ACTIVE',
      clientName: data.client,
      hardwareId: currentHardwareId,
      issued: data.issued,
      expiry: data.expiry,
      daysRemaining,
      maxTables: data.tables || 50,
      features: data.features || [],
      message: daysRemaining <= 15 ? `تحذير: سينتهي الاشتراك خلال ${daysRemaining} يوم!` : 'الترخيص السنوي مفعّل وساري.',
      messageEn: daysRemaining <= 15 ? `Warning: Subscription expires in ${daysRemaining} days!` : 'Yearly license active.'
    };
  } catch (err) {
    return { isValid: false, status: 'ERROR', message: 'حدث خطأ أثناء فحص الترخيص: ' + err.message, hardwareId: currentHardwareId };
  }
}
