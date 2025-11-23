/**
 * Performance Detection System
 * Detects device capabilities and network conditions to determine optimal quality level
 */

export const QUALITY_LEVELS = {
  LOW: {
    shadowQuality: 128,
    pieceComplexity: 'simple', // Geometric shapes
    reflections: false,
    particles: false,
    postProcessing: false,
    drawDistance: 20,
    antialias: false,
    maxPieces: 32
  },
  MEDIUM: {
    shadowQuality: 512,
    pieceComplexity: 'medium', // Low-poly models
    reflections: true,
    particles: false,
    postProcessing: false,
    drawDistance: 50,
    antialias: true,
    maxPieces: 32
  },
  HIGH: {
    shadowQuality: 1024,
    pieceComplexity: 'high', // Detailed Staunton models
    reflections: true,
    particles: true,
    postProcessing: true,
    drawDistance: 100,
    antialias: true,
    maxPieces: 32
  }
};

/**
 * Detect WebGL support and capabilities
 */
function detectGPU() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) {
    return { supported: false, tier: 0 };
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
  
  // Get max texture size
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  
  // Determine GPU tier based on capabilities
  let tier = 1;
  if (maxTextureSize >= 8192) tier = 2;
  if (maxTextureSize >= 16384) tier = 3;
  
  return {
    supported: true,
    tier,
    renderer,
    maxTextureSize
  };
}

/**
 * Detect CPU capabilities
 */
function detectCPU() {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = navigator.deviceMemory || 4; // GB
  
  return {
    cores,
    memory,
    tier: cores >= 8 && memory >= 8 ? 3 : cores >= 4 ? 2 : 1
  };
}

/**
 * Detect network speed
 */
function detectNetwork() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return { tier: 2, type: '4g' }; // Assume mid-range
  }
  
  const effectiveType = connection.effectiveType;
  const downlink = connection.downlink; // Mbps
  
  let tier = 2;
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    tier = 1;
  } else if (effectiveType === '4g' && downlink > 5) {
    tier = 3;
  }
  
  return {
    tier,
    type: effectiveType,
    downlink
  };
}

/**
 * Detect if mobile device
 */
function detectDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenWidth,
    screenHeight,
    pixelRatio: window.devicePixelRatio || 1
  };
}

/**
 * Main performance detection function
 * Returns recommended quality level: 'LOW', 'MEDIUM', or 'HIGH'
 */
export function detectPerformanceLevel() {
  const gpu = detectGPU();
  const cpu = detectCPU();
  const network = detectNetwork();
  const device = detectDevice();
  
  // Log detection results (for debugging)
  console.log('🔍 Performance Detection:', {
    GPU: gpu,
    CPU: cpu,
    Network: network,
    Device: device
  });
  
  // Decision logic - Let device capabilities determine quality, not device type
  let qualityLevel = 'MEDIUM'; // Default
  
  // Force LOW if no WebGL
  if (!gpu.supported) {
    qualityLevel = 'LOW';
  }
  // Force LOW for very weak devices (regardless of mobile/desktop)
  else if (cpu.cores < 2 || cpu.memory < 2) {
    qualityLevel = 'LOW';
  }
  // HIGH for powerful devices (desktop OR mobile with good specs)
  else if (
    gpu.tier >= 2 &&
    cpu.tier >= 2 &&
    network.tier >= 2
  ) {
    qualityLevel = 'HIGH';
  }
  // MEDIUM for decent devices (tablets, modern phones, mid-range desktops)
  else if (cpu.cores >= 4 && gpu.tier >= 1) {
    qualityLevel = 'MEDIUM';
  }
  
  // Cache the result in sessionStorage
  try {
    sessionStorage.setItem('chessQualityLevel', qualityLevel);
    sessionStorage.setItem('chessPerformanceData', JSON.stringify({
      gpu, cpu, network, device, timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Could not cache performance data:', e);
  }
  
  console.log(`✅ Selected Quality Level: ${qualityLevel}`);
  
  return qualityLevel;
}

/**
 * Get cached performance level or detect new one
 */
export function getQualityLevel() {
  try {
    const cached = sessionStorage.getItem('chessQualityLevel');
    if (cached && ['LOW', 'MEDIUM', 'HIGH'].includes(cached)) {
      console.log(`♻️ Using cached quality level: ${cached}`);
      return cached;
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  return detectPerformanceLevel();
}

/**
 * Get quality settings for the detected level
 */
export function getQualitySettings() {
  const level = getQualityLevel();
  return {
    level,
    settings: QUALITY_LEVELS[level]
  };
}
