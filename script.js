// Function to XOR two byte arrays
function xorBytes(a, b) {
    if (a.length !== b.length) {
        showError("Byte arrays must be of the same length for XOR operation.", "generate-error-message");
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
        showError("Hexadecimal string must have an even length.", "reconstruct-error-message");
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

    // Validate the secret input
    if (!/^[0-5]{62}$/.test(secretString)) {
        showError("The secret must be a continuous string of 62 integers, each between 0 and 5.", "generate-error-message");
        return;
    }

    // Convert the secret to a byte array
    let secretBytes = new Uint8Array(secretString.split('').map(Number));

    try {
        // Compute SHA-512 hash and truncate to 31 bytes
        let hashBuffer = await crypto.subtle.digest('SHA-512', secretBytes.buffer);
        let hashBytes = new Uint8Array(hashBuffer).slice(0, 31);

        // Ensure that secretBytes and hashBytes are the same length
        if (secretBytes.length !== hashBytes.length) {
            showError("Secret and Share 1 (hash) must be the same length.", "generate-error-message");
            return;
        }

        // Generate Share 1 and Share 2
        let share1 = bytesToHex(hashBytes);
        let share2Bytes = xorBytes(secretBytes, hashBytes);
        
        if (share2Bytes === null) return;

        let share2 = bytesToHex(share2Bytes);

        // Display the shares
        document.getElementById('share1').value = share1;
        document.getElementById('share2').value = share2;
        document.getElementById('generate-error-message').textContent = ''; // Clear any previous error
    } catch (error) {
        showError("Error generating shares: " + error.message, "generate-error-message");
    }
}

// Reconstruct the secret from Share 1 and Share 2
function reconstructSecret() {
    let share1Hex = document.getElementById('share1Input').value.trim();
    let share2Hex = document.getElementById('share2Input').value.trim();

    // Validate the shares
    if (!/^[0-9a-fA-F]{62}$/.test(share1Hex) || !/^[0-9a-fA-F]{62}$/.test(share2Hex)) {
        showError("Both shares must be 31 bytes long in hexadecimal format.", "reconstruct-error-message");
        return;
    }

    // Convert shares to byte arrays
    let share1Bytes = hexToBytes(share1Hex);
    let share2Bytes = hexToBytes(share2Hex);

    if (share1Bytes === null || share2Bytes === null) return;

    // Ensure that share1Bytes and share2Bytes are the same length
    if (share1Bytes.length !== share2Bytes.length) {
        showError("Share 1 and Share 2 must be of the same length.", "reconstruct-error-message");
        return;
    }

    // Reconstruct the secret
    let secretBytes = xorBytes(share1Bytes, share2Bytes);

    if (secretBytes === null) return;

    let secret = bytesToHex(secretBytes);
    document.getElementById('result').value = secret;
    document.getElementById('reconstruct-error-message').textContent = ''; // Clear any previous error
}

// Show error message
function showError(message, elementId) {
    let errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block'; // Make sure the error message is visible
}
