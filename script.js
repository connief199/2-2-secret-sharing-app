// Convert a hexadecimal string to a bit array
function hexToBits(hex) {
    let bits = [];
    for (let i = 0; i < hex.length; i += 2) {
        let byte = parseInt(hex.substr(i, 2), 16);
        for (let j = 7; j >= 0; j--) {
            bits.push((byte >> j) & 1);
        }
    }
    return bits;
}

// Convert a bit array to a hexadecimal string
function bitsToHex(bits) {
    let hex = '';
    for (let i = 0; i < bits.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            byte = (byte << 1) | bits[i + j];
        }
        hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
}

// XOR two bit arrays
function xorBits(a, b) {
    if (a.length !== b.length) {
        throw new Error("Bit arrays must be of the same length for XOR operation.");
    }
    let result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}

// Generate Share 1 and Share 2
async function generateShares() {
    let secret = document.getElementById('secret').value;

    // Validate the secret input
    if (!/^[0-5]{62}$/.test(secret)) {
        alert("The secret must be exactly 62 digits long, with each digit between 0 and 5.");
        return;
    }

    // Convert the secret into a 31-byte bit array
    let secretBits = [];
    for (let i = 0; i < 31; i++) {
        let byte = parseInt(secret.substr(i * 2, 2), 10);
        for (let j = 7; j >= 0; j--) {
            secretBits.push((byte >> j) & 1);
        }
    }

    // Generate SHA-512 hash and truncate to 31 bytes for Share 1
    let secretBytes = new Uint8Array(secretBits.length / 8);
    for (let i = 0; i < secretBytes.length; i++) {
        secretBytes[i] = parseInt(secretBits.slice(i * 8, (i + 1) * 8).join(''), 2);
    }
    let hashBytes = await crypto.subtle.digest('SHA-512', secretBytes);
    let hashBits = Array.from(new Uint8Array(hashBytes)).slice(0, 31).flatMap(byte => 
        Array.from({ length: 8 }, (_, i) => (byte >> (7 - i)) & 1)
    );
    document.getElementById('share1').value = bitsToHex(hashBits);

    // XOR secret bits with hash bits to create Share 2
    let share2Bits = xorBits(secretBits, hashBits);
    document.getElementById('share2').value = bitsToHex(share2Bits);
}

// Reconstruct the secret from Share 1 and Share 2
function reconstructSecret() {
    let share1Hex = document.getElementById('share1Input').value;
    let share2Hex = document.getElementById('share2Input').value;

    // Ensure both shares are provided and have correct length
    if (share1Hex.length !== 62 || share2Hex.length !== 62) {
        alert("Both shares must be 62 hexadecimal characters long.");
        return;
    }

    let share1Bits = hexToBits(share1Hex);
    let share2Bits = hexToBits(share2Hex);

    // XOR Share 1 and Share 2 to reconstruct the original secret bits
    let secretBits = xorBits(share1Bits, share2Bits);

    // Convert bits back to the original secret format
    let secret = '';
    for (let i = 0; i < secretBits.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            byte = (byte << 1) | secretBits[i + j];
        }
        secret += byte.toString().padStart(2, '0'); // Convert byte back to digit
    }

    document.getElementById('result').value = secret;
}
