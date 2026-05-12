export const generateDeviceId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let deviceId = '';
  for (let i = 0; i < 15; i++) {
    deviceId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return deviceId;
};

export const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};
