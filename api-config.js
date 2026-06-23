const DEFAULT_SERVER = 'http://localhost:3001';
const IS_SERVED = location.protocol === 'http:' || location.protocol === 'https:';

const API_ORIGIN = IS_SERVED ? location.origin : DEFAULT_SERVER;
const API_BASE_URL = IS_SERVED ? '/api' : `${DEFAULT_SERVER}/api`;
