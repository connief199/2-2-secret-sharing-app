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

    // Convert a string of digits (0-5) into a byte array
    function digitsToByteArray(digits) {
        return digits.split('').map(char => parseInt(char, 10));
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

    // XOR two byte arrays
    function xorByteArrays(a, b) {
        return a.map((byte, index) => byte ^ b[index]);
    }

    // Generate Shares event
    generateButton.addEventListener('click', () => {
        const secret = secretInput.value.trim();

        // Validate the input to ensure it is exactly 62 digits between 0-5
        if (!/^[0-5]{62}$/.test(secret)) {
            alert('Please enter a valid SECRET: a string of 62 digits (0-5).');
            return;
        }

        // Convert the secret to a byte array (as integers between 0 and 5)
        const secretBytes = digitsToByteArray(secret);

        // Calculate SHA512 of the secret and truncate it to 256 bits to get SHARE 1
        const sha512Hash = CryptoJS.SHA512(CryptoJS.enc.Hex.parse(secret));
        const share1 = truncate256(sha512Hash);

        // Convert SHARE 1 to a byte array
        const share1Bytes = hexToBytes(share1);

        // Ensure that the secretBytes are padded to the same length as share1Bytes
        const paddedSecretBytes = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
            paddedSecretBytes[i] = i < secretBytes.length ? secretBytes[i] : 0;
        }

        // XOR the padded secret byte array with SHARE 1 byte array to get SHARE 2
        const share2Bytes = xorByteArrays(paddedSecretBytes, share1Bytes);

        // Convert share2Bytes back to a hex string
        const share2 = bytesToHex(share2Bytes);

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
        const secret = secretBytes.map(byte => byte.toString()).join('').slice(0, 62);

        // Display the reconstructed secret
        rebuiltSecretOutput.textContent = secret;
    });
});
