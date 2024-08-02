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

    // Function to XOR two hex strings of equal length
    function xorHexStrings(a, b) {
        let result = '';
        for (let i = 0; i < a.length; i += 2) {
            const byteA = parseInt(a.substr(i, 2), 16);
            const byteB = parseInt(b.substr(i, 2), 16);
            const xorByte = byteA ^ byteB;
            result += xorByte.toString(16).padStart(2, '0');
        }
        return result;
    }

    // Generate Shares event
    generateButton.addEventListener('click', () => {
        const secret = secretInput.value.trim();

        // Validate the input to ensure it is exactly 62 digits between 0-5
        if (!/^[0-5]{62}$/.test(secret)) {
            alert('Please enter a valid SECRET: a string of 62 digits (0-5).');
            return;
        }

        // Convert the secret into a byte array
        const secretBytes = secret.split('').map(digit => parseInt(digit, 10));

        // Debugging: Log the converted secretBytes
        console.log(`Secret Bytes: ${secretBytes}`);

        // Convert byte array to a word array (required by CryptoJS)
        const secretWordArray = CryptoJS.lib.WordArray.create(secretBytes);

        // Calculate SHA512 of the secret
        const sha512Hash = CryptoJS.SHA512(secretWordArray);

        // Debugging: Log the full SHA512 hash
        console.log(`SHA512 Hash: ${sha512Hash.toString(CryptoJS.enc.Hex)}`);

        // Truncate the SHA512 hash to 256 bits (64 hex characters)
        const share1 = truncate256(sha512Hash);

        // Debugging: Log the truncated share1
        console.log(`Share 1 (Truncated): ${share1}`);

        // Convert the truncated hash back to a byte array
        const share1Bytes = CryptoJS.enc.Hex.parse(share1).words.flatMap(word => [
            (word >> 24) & 0xFF,
            (word >> 16) & 0xFF,
            (word >> 8) & 0xFF,
            word & 0xFF,
        ]);

        // Ensure the secret byte array is the same length as the truncated hash byte array
        const paddedSecretBytes = Array.from({length: share1Bytes.length}, (_, i) => secretBytes[i % secretBytes.length]);

        // XOR the padded secret bytes with share1 bytes to get share2
        const share2Bytes = paddedSecretBytes.map((byte, index) => byte ^ share1Bytes[index]);

        // Convert share2Bytes back to a hex string
        const share2 = share2Bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');

        // Debugging: Log share2
        console.log(`Share 2: ${share2}`);

        // Display the shares
        share1Output.textContent = share1;
        share2Output.textContent = share2;
    });

    // Rebuild Secret event
    rebuildButton.addEventListener('click', () => {
        const share1 = share1Input.value.trim();
        const share2 = share2Input.value.trim();

        // Validate the inputs to ensure they are each 64 hex characters
        if (share1.length !== 64 || share2.length !== 64) {
            alert('Please enter valid shares: 256 bits long (64 hex characters).');
            return;
        }

        // Convert the hex strings back to byte arrays
        const share1Bytes = CryptoJS.enc.Hex.parse(share1).words.flatMap(word => [
            (word >> 24) & 0xFF,
            (word >> 16) & 0xFF,
            (word >> 8) & 0xFF,
            word & 0xFF,
        ]);

        const share2Bytes = CryptoJS.enc.Hex.parse(share2).words.flatMap(word => [
            (word >> 24) & 0xFF,
            (word >> 16) & 0xFF,
            (word >> 8) & 0xFF,
            word & 0xFF,
        ]);

        // XOR the two byte arrays to reconstruct the original secret bytes
        const secretBytes = share1Bytes.map((byte, index) => byte ^ share2Bytes[index]);

        // Convert the byte array back to the original secret (digits 0-5)
        const secret = secretBytes.map(byte => byte.toString()).join('');

        // Debugging: Log the reconstructed secret
        console.log(`Reconstructed Secret: ${secret}`);

        // Display the reconstructed secret
        rebuiltSecretOutput.textContent = secret;
    });
});
