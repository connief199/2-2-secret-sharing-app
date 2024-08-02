// Function to XOR two byte arrays
function xorBytes(a, b) {
    if (a.length !== b.length) {
        throw new Error("Byte arrays must be of the same length for XOR operation.");
    }
    let result = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}

// Convert a hexadecimal string to a byte array
function hexToBytes(hex) {
    if (hex.length % 2 !== 0) {
        throw new Error("Hexadecimal string must have an even length.");
    }
    let bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
}

// Convert a byte array to a hexadecimal string
function bytesToHex(bytes) {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
}

// Generate Share 1 and Share 2
async function generateShares() {
    let secret = document.getElementById('secret').value;

    // Validate the secret input
    if (!/^[0-5]{62}$/.test(secret)) {
        alert("The secret must be exactly 62 digits long, with each digit between 0 and 5.");
        return;
    }

    // Convert the secret into a 31-byte array
    let secretBytes = new Uint8Array(31);
    for (let i = 0; i < 31; i++) {
        secretBytes[i] = parseInt(secret.substr(i * 2, 2), 10);
    }

    // Generate SHA-512 hash and truncate to 31 bytes for Share 1
    let hashBytes = await crypto.subtle.digest('SHA-512', secretBytes);
    hashBytes = new Uint8Array(hashBytes).slice(0, 31);
    document.getElementById('share1').value = bytesToHex(hashBytes);

    // XOR secret bytes with hash bytes to create Share 2
    let share2Bytes = xorBytes(secretBytes, hashBytes);
    document.getElementById('share2').value = bytesToHex(share2Bytes);
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

    let share1 = hexToBytes(share1Hex);
    let share2 = hexToBytes(share2Hex);

    // XOR Share 1 and Share 2 to reconstruct the original secret bytes
    let secretBytes = xorBytes(share1, share2);

    // Convert bytes back to the original secret format
    let secret = '';
    for (let i = 0; i < secretBytes.length; i++) {
        secret += secretBytes[i].toString().padStart(2, '0'); // Convert byte back to digit
    }

    document.getElementById('result').value = secret;
}
