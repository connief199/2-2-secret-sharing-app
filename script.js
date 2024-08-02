// Function to XOR two byte arrays
function xorBytes(a, b) {
    if (a.length !== b.length) {
        showError("Byte arrays must be of the same length for XOR operation.");
        return null;
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
        showError("Hexadecimal string must have an even length.");
        return null;
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
    let secretString = document.getElementById('secret').value.trim();

    if (!/^[0-5]{62}$/.test(secretString)) {
        showError("The secret must be a continuous string of 62 integers, each between 0 and 5.");
        return;
    }

    let secretBytes = new Uint8Array(secretString.split('').map(Number));
    let hashBytes = await crypto.subtle.digest('SHA-512', secretBytes);
    hashBytes = new Uint8Array(hashBytes).slice(0, 31);

    let share1 = bytesToHex(hashBytes);
    let share2Bytes = xorBytes(secretBytes, hashBytes);
    if (share2Bytes === null) return;
    let share2 = bytesToHex(share2Bytes);

    document.getElementById('share1').value = share1;
    document.getElementById('share2').value = share2;
}

// Reconstruct the secret from Share 1 and Share 2
function reconstructSecret() {
    let share1Hex = document.getElementById('share1Input').value.trim();
    let share2Hex = document.getElementById('share2Input').value.trim();

    if (share1Hex.length !== 62 || share2Hex.length !== 62) {
        showError("Both shares must be 31 bytes long in hexadecimal format.");
        return;
    }

    let share1Bytes = hexToBytes(share1Hex);
    let share2Bytes = hexToBytes(share2Hex);
    let secretBytes = xorBytes(share1Bytes, share2Bytes);
    if (secretBytes === null) return;

    let secret = bytesToHex(secretBytes);
    document.getElementById('result').value = secret;
}

// Show error message
function showError(message) {
    document.getElementById('error-message').textContent = message;
}
