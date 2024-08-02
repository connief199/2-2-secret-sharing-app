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
    if (secret.length !== 62) {
        alert("The secret must be exactly 62 digits long.");
        return;
    }

    let secretBytes = new Uint8Array(32);

    // Fill the first 32 bytes of secretBytes from the input secret
    for (let i = 0; i < 32 && i < secret.length; i++) {
        secretBytes[i] = parseInt(secret[i], 10);
    }

    // Create Share 1
    crypto.subtle.digest('SHA-512', secretBytes).then(digest => {
        let hashBytes = new Uint8Array(digest).slice(0, 32);
        document.getElementById('share1').value = bytesToHex(hashBytes);

        let share2 = xorBytes(secretBytes, hashBytes);
        document.getElementById('share2').value = bytesToHex(share2);
    });
}

function reconstructSecret() {
    let share1Hex = document.getElementById('share1Input').value;
    let share2Hex = document.getElementById('share2Input').value;

    let share1 = hexToBytes(share1Hex);
    let share2 = hexToBytes(share2Hex);

    let secretBytes = xorBytes(share1, share2);

    // Convert bytes back to the original format
    let secret = '';
    for (let i = 0; i < secretBytes.length; i++) {
        secret += secretBytes[i].toString(); // Convert byte back to digit
    }
    document.getElementById('result').value = secret;
}
