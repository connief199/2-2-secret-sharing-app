function xorBytes(a, b) {
    let result = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}

function hexToBytes(hex) {
    let bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
}

function bytesToHex(bytes) {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
}

function generateShares() {
    let secret = document.getElementById('secret').value;
    // Validate the secret input to ensure it contains 62 digits each between 0-5
    if (!/^[0-5]{62}$/.test(secret)) {
        alert("The secret must be exactly 62 digits long, with each digit between 0 and 5.");
        return;
    }

    // Create a 31-byte array from the 62-digit secret
    let secretBytes = new Uint8Array(31);

    // Fill the byte array with the secret digits
    for (let i = 0; i < 31; i++) {
        secretBytes[i] = parseInt(secret.substr(i * 2, 2), 10);
    }

    // Use SHA-512 and truncate to 31 bytes for share1
    crypto.subtle.digest('SHA-512', secretBytes).then(digest => {
        let hashBytes = new Uint8Array(digest).slice(0, 31);
        document.getElementById('share1').value = bytesToHex(hashBytes);

        // XOR the secret with share 1 to create share 2
        let share2 = xorBytes(secretBytes, hashBytes);
        document.getElementById('share2').value = bytesToHex(share2);
    });
}

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

    let secretBytes = xorBytes(share1, share2);

    // Convert bytes back to the original secret format
    let secret = '';
    for (let i = 0; i < secretBytes.length; i++) {
        secret += secretBytes[i].toString().padStart(2, '0'); // Convert byte back to digit
    }

    document.getElementById('result').value = secret;
}
