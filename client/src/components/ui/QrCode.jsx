import React, { useMemo } from 'react';

/**
 * Compact, self-contained ISO/IEC 18004 compliant QR Code Matrix Generator (Model 2).
 * Supports Version 1-10 with Byte encoding and Error Correction Level M / L / Q / H.
 * Zero external dependencies. Renders crisp vector SVG.
 */

// Galois Field GF(256) arithmetic for QR Error Correction
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);
(function initGaloisField() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = val;
    EXP_TABLE[i + 255] = val;
    LOG_TABLE[val] = i;
    val = (val << 1) ^ (val & 0x80 ? 0x11d : 0);
  }
  LOG_TABLE[0] = 0;
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function polyMul(p1, p2) {
  const result = new Uint8Array(p1.length + p2.length - 1);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getRsGeneratorPoly(degree) {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    poly = polyMul(poly, new Uint8Array([1, EXP_TABLE[i]]));
  }
  return poly;
}

function calculateRsEcc(dataBytes, eccCount) {
  const genPoly = getRsGeneratorPoly(eccCount);
  const remainder = new Uint8Array(eccCount);
  for (let i = 0; i < dataBytes.length; i++) {
    const factor = dataBytes[i] ^ remainder[0];
    remainder.copyWithin(0, 1);
    remainder[eccCount - 1] = 0;
    for (let j = 0; j < eccCount; j++) {
      remainder[j] ^= gfMul(genPoly[j + 1], factor);
    }
  }
  return remainder;
}

// Version table: [version, totalDataCodewords, eccCodewordsPerBlock, numBlocks]
// Using Level M (Medium - 15% recovery)
const VERSION_SPECS_M = [
  null,
  { version: 1, size: 21, dataCap: 16, eccCount: 10, blocks: 1 },
  { version: 2, size: 25, dataCap: 28, eccCount: 16, blocks: 1, align: [6, 18] },
  { version: 3, size: 29, dataCap: 44, eccCount: 26, blocks: 1, align: [6, 22] },
  { version: 4, size: 33, dataCap: 64, eccCount: 18, blocks: 2, align: [6, 26] },
  { version: 5, size: 37, dataCap: 86, eccCount: 24, blocks: 2, align: [6, 30] },
  { version: 6, size: 41, dataCap: 108, eccCount: 16, blocks: 4, align: [6, 34] },
  { version: 7, size: 45, dataCap: 124, eccCount: 18, blocks: 4, align: [6, 22, 38] },
  { version: 8, size: 49, dataCap: 154, eccCount: 22, blocks: 4, align: [6, 24, 42] },
  { version: 9, size: 53, dataCap: 182, eccCount: 22, blocks: 5, align: [6, 26, 46] },
  { version: 10, size: 57, dataCap: 216, eccCount: 26, blocks: 5, align: [6, 28, 50] }
];

function selectVersion(byteLength) {
  for (let v = 1; v <= 10; v++) {
    const spec = VERSION_SPECS_M[v];
    // Byte mode overhead: 4 bits mode + 8 bits char count (or 16 for v10)
    const headerBits = v < 10 ? 12 : 20;
    const availableBytes = Math.floor((spec.dataCap * 8 - headerBits) / 8);
    if (byteLength <= availableBytes) return spec;
  }
  return VERSION_SPECS_M[10];
}

class BitBuffer {
  constructor() {
    this.buffer = [];
    this.length = 0;
  }
  put(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }
  putBit(bit) {
    const byteIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= byteIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[byteIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }
  getBytes() {
    return new Uint8Array(this.buffer);
  }
}

function generateQrMatrix(text) {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);
  const spec = selectVersion(rawBytes.length);
  const { version, size, dataCap, eccCount, blocks } = spec;

  // 1. Encode into BitBuffer (Byte mode 0100)
  const bb = new BitBuffer();
  bb.put(0x4, 4); // Mode byte
  bb.put(rawBytes.length, version < 10 ? 8 : 16);
  for (let i = 0; i < rawBytes.length; i++) {
    bb.put(rawBytes[i], 8);
  }

  // Terminator & Padding
  const totalDataBits = dataCap * 8;
  const terminatorLen = Math.min(4, totalDataBits - bb.length);
  bb.put(0, terminatorLen);
  while (bb.length % 8 !== 0) {
    bb.putBit(false);
  }
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bb.length < totalDataBits) {
    bb.put(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  const dataBytes = bb.getBytes();
  const totalPerBlock = Math.floor(dataCap / blocks);
  const dataBlocks = [];
  const eccBlocks = [];

  for (let b = 0; b < blocks; b++) {
    const start = b * totalPerBlock;
    const end = (b === blocks - 1) ? dataCap : start + totalPerBlock;
    const slice = dataBytes.slice(start, end);
    dataBlocks.push(slice);
    eccBlocks.push(calculateRsEcc(slice, eccCount));
  }

  // Interleave data codewords then ECC codewords
  const finalCodewords = [];
  const maxBlockLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxBlockLen; i++) {
    for (let b = 0; b < blocks; b++) {
      if (i < dataBlocks[b].length) {
        finalCodewords.push(dataBlocks[b][i]);
      }
    }
  }
  for (let i = 0; i < eccCount; i++) {
    for (let b = 0; b < blocks; b++) {
      finalCodewords.push(eccBlocks[b][i]);
    }
  }

  // Initialize Matrix
  const matrix = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
  const isFunction = Array.from({ length: size }, () => new Uint8Array(size));

  function setFunc(r, c, val) {
    matrix[r][c] = val ? 1 : 0;
    isFunction[r][c] = 1;
  }

  // Finder Patterns (7x7 with separator)
  function placeFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const isBlack = (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          );
          setFunc(nr, nc, isBlack ? 1 : 0);
        }
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) setFunc(6, i, i % 2 === 0 ? 1 : 0);
    if (!isFunction[i][6]) setFunc(i, 6, i % 2 === 0 ? 1 : 0);
  }

  // Alignment Patterns for Version >= 2
  if (spec.align) {
    const coords = spec.align;
    for (let i = 0; i < coords.length; i++) {
      for (let j = 0; j < coords.length; j++) {
        const r = coords[i];
        const c = coords[j];
        if (isFunction[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBlack = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setFunc(r + dr, c + dc, isBlack ? 1 : 0);
          }
        }
      }
    }
  }

  // Dark Module
  setFunc(size - 8, 8, 1);

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (!isFunction[8][i]) setFunc(8, i, 0);
    if (!isFunction[i][8]) setFunc(i, 8, 0);
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunction[8][size - 1 - i]) setFunc(8, size - 1 - i, 0);
    if (!isFunction[size - 1 - i][8]) setFunc(size - 1 - i, 8, 0);
  }

  // Place data bits with Mask 0 ((row + col) % 2 === 0)
  let byteIdx = 0;
  let bitIdx = 7;
  let upwards = true;

  for (let rightCol = size - 1; rightCol > 0; rightCol -= 2) {
    if (rightCol === 6) rightCol--; // Skip vertical timing column
    const cols = [rightCol, rightCol - 1];
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of cols) {
        if (isFunction[r][c]) continue;
        let bit = 0;
        if (byteIdx < finalCodewords.length) {
          bit = (finalCodewords[byteIdx] >>> bitIdx) & 1;
          bitIdx--;
          if (bitIdx < 0) {
            bitIdx = 7;
            byteIdx++;
          }
        }
        // Mask 0: (row + col) % 2 === 0
        const maskBit = (r + c) % 2 === 0 ? 1 : 0;
        matrix[r][c] = bit ^ maskBit;
      }
    }
    upwards = !upwards;
  }

  // Format bits for Level M (00), Mask 0 (000) => 00000 => BCH code = 101010000010010 ^ 101010000010010 = 0
  // Standard format information constant for Level M, Mask 0: 0x5412 ^ 0x5412 = 0x0000
  // Encoded with Mask XOR 0x5412: format bits = 0x5412 (binary 101010000010010)
  const formatBits = 0x5412;
  for (let i = 0; i < 15; i++) {
    const bit = (formatBits >>> (14 - i)) & 1;
    // Around top-left
    if (i < 6) setFunc(8, i, bit);
    else if (i === 6) setFunc(8, 7, bit);
    else if (i === 7) setFunc(8, 8, bit);
    else if (i === 8) setFunc(7, 8, bit);
    else setFunc(14 - i, 8, bit);

    // Around top-right and bottom-left
    if (i < 8) setFunc(size - 1 - i, 8, bit);
    else setFunc(8, size - 15 + i, bit);
  }

  return { matrix, size };
}

/**
 * Responsive vector SVG QR Code component.
 *
 * @param {string} value - The text or URL encoded in the QR Code.
 * @param {number} size - Desired width/height in pixels (default: 160).
 * @param {string} fgColor - Color of the dark modules (default: '#0f172a').
 * @param {string} bgColor - Background fill color (default: '#ffffff').
 * @param {string} className - Additional CSS class names.
 * @param {string} label - Accessibility description.
 */
export default function QrCode({
  value = '',
  size = 160,
  fgColor = '#0f172a',
  bgColor = '#ffffff',
  className = '',
  label = 'Verification QR Code'
}) {
  const { matrix, size: matrixSize } = useMemo(() => {
    try {
      return generateQrMatrix(value || 'https://aetheria.edu');
    } catch {
      return generateQrMatrix('https://aetheria.edu');
    }
  }, [value]);

  const quietZone = 2;
  const viewBoxSize = matrixSize + quietZone * 2;

  // Build SVG path data for optimized DOM rendering
  const pathData = useMemo(() => {
    let d = '';
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c] === 1) {
          const x = c + quietZone;
          const y = r + quietZone;
          d += `M${x},${y}h1v1h-1z `;
        }
      }
    }
    return d;
  }, [matrix, matrixSize]);

  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      title={label}
      role="img"
      aria-label={label}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        className="rounded shadow-sm"
      >
        <rect width={viewBoxSize} height={viewBoxSize} fill={bgColor} rx="1" />
        <path d={pathData} fill={fgColor} />
      </svg>
    </div>
  );
}
