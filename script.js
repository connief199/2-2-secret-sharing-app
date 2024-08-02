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
    let secretHex = document.getElementById('secret').value;

    // Validate the secret input
    if (!/^[0-9a-fA-F]{62}$/.test(secretHex)) {
        alert("The secret must be exactly 31 bytes long in hexadecimal format.");
        return;
    }

    // Convert the secret into a byte array
    let secretBytes = hexToBytes(secretHex);

    // Generate SHA-512 hash and truncate to 31 bytes for Share 1
    let hashBytes = await crypto.subtle.digest('SHA-512', secretBytes);
    hashBytes = new Uint8Array(hashBytes).slice(0, 31);

    // Generate Share 1 and Share 2
    let share1 = bytesToHex(hashBytes);
    let share2Bytes = xorBytes(secretBytes, hashBytes);
    let share2 = bytesToHex(share2Bytes);

    document.getElementById('share1').value = share1;
    document.getElementById('share2').value = share2;
}

// Reconstruct the secret from Share 1 and Share 2
function reconstructSecret() {
    let share1Hex = document.getElementById('share1Input').value;
    let share2Hex = document.getElementById('share2Input').value;

    // Ensure both shares are provided and have correct length
    if (share1Hex.length !== 62 || share2Hex.length !== 62) {
        alert("Both shares must be 31 bytes long in hexadecimal format.");
        return;
    }

    let share1Bytes = hexToBytes(share1Hex);
    let share2Bytes = hexToBytes(share2Hex);

    // XOR Share 1 and Share 2 to reconstruct the original secret bytes
    let secretBytes = xorBytes(share1Bytes, share2Bytes);

    // Convert bytes back to the original secret format
    let secret = bytesToHex(secretBytes);

    document.getElementById('result').value = secret;
}
