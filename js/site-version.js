const ASSET_VERSION = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\.\d{3}Z$/, '')
  .replace('T', '-');

window.ASSET_VERSION = ASSET_VERSION;
