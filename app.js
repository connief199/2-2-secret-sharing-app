document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const secretInput = document.getElementById('secret-input');
    const generateButton = document.getElementById('generate-button');
    const share1Output = document.getElementById('share1');
    const share2Output = document.getElementById('share2');
    const share1Input = document.getElementById('share1-input');
    const share2Input = document.getElementById('share2-input');
    const rebuildButton = document.getElementById('rebuild-button');
    const rebuiltSecretOutput = document.getElementById('rebuilt-secret');

    // Function to truncate a hash to 256 bits (64 hex characters)
    function truncate256(hash) {
        return hash.toString(CryptoJS.enc.Hex).slice(0, 64);
    }

    // Function to XOR two byte arrays
    function xorByteArrays(a, b) {
        return a.map((byte, index) => byte ^ b[index]);
    }

    // Convert a byte array to a hex string
    function bytesToHex(bytes) {
        return bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Convert a hex string to a byte array
    function hexToBytes(hex) {
        const bytes = [];
        for (let i = 0; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.substr(i, 2), 16));
        }
        return bytes;
    }

    // Generate Shares event
    generateButton.addEventListener('click', () => {
        const secret = secretInput.value.trim();

        // Validate the input to ensure it is exactly 62 digits between 0-5
        if (!/^[0-5]{62}$/.test(secret)) {
            alert('Please enter a valid SECRET: a string of 62 digits (0-5).');
            return;
        }

        // Calculate SHA512 of the secret
        const sha512Hash = CryptoJS.SHA512(secret);

        // Debug: Log the full SHA512 hash
        console.log('Full SHA512 hash:', sha512Hash.toString(CryptoJS.enc.Hex));

        // Truncate the SHA512 hash to 256 bits (64 hex characters) to get SHARE 1
        const share1 = truncate256(sha512Hash);

        // Debug: Log SHARE 1
        console.log('Truncated SHA512 to SHARE 1:', share1);

        // Convert SHARE 1 to a byte array
        const share1Bytes = hexToBytes(share1);

        // Ensure that the secret is converted to a byte array that matches the length of SHARE 1
        const secretBytes = Array.from(secret).map(char => parseInt(char, 10));

        // Pad or truncate the secretBytes array to ensure it is exactly 32 bytes long
        const paddedSecretBytes = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
            paddedSecretBytes[i] = i < secretBytes.length ? secretBytes[i] : 0;
        }

        // Debug: Log padded secret bytes
        console.log('Padded Secret Bytes:', paddedSecretBytes);

        // XOR the secret byte array with SHARE 1 byte array to get SHARE 2
        const share2Bytes = xorByteArrays(paddedSecretBytes, share1Bytes);

        // Convert share2Bytes back to a hex string
        const share2 = bytesToHex(share2Bytes);

        // Debug: Log SHARE 2
        console.log('SHARE 2:', share2);

        // Display the shares
        share1Output.textContent = share1;
        share2Output.textContent = share2;
    });

    // Rebuild Secret event
    rebuildButton.addEventListener('click', () => {
        const share1 = share1Input.value.trim();
        const share2 = share2Input.value.trim();

        // Validate the inputs to ensure they are each 64 hex characters
        if (share1.length !== 64 || share2.length !== 64 || !/^[a-fA-F0-9]{64}$/.test(share1) || !/^[a-fA-F0-9]{64}$/.test(share2)) {
            alert('Please enter valid shares: 256 bits long (64 hex characters).');
            return;
        }

        // Convert the hex strings back to byte arrays
        const share1Bytes = hexToBytes(share1);
        const share2Bytes = hexToBytes(share2);

        // XOR the two byte arrays to reconstruct the original secret bytes
        const secretBytes = xorByteArrays(share1Bytes, share2Bytes);

        // Convert the byte array back to the original secret (digits 0-5)
        const secret = secretBytes.slice(0, 62).map(byte => (byte % 6).toString()).join('');

        // Debug: Log the reconstructed secret
        console.log('Reconstructed Secret:', secret);

        // Display the reconstructed secret
        rebuiltSecretOutput.textContent = secret;
    });
});
