document.addEventListener('DOMContentLoaded', () => {
    const secretInput = document.getElementById('secret-input');
    const generateButton = document.getElementById('generate-button');
    const share1Output = document.getElementById('share1');
    const share2Output = document.getElementById('share2');
    const share1Input = document.getElementById('share1-input');
    const share2Input = document.getElementById('share2-input');
    const rebuildButton = document.getElementById('rebuild-button');
    const rebuiltSecretOutput = document.getElementById('rebuilt-secret');

    function truncate256(hash) {
        // Ensure we truncate to 256 bits (64 hex characters)
        return hash.toString(CryptoJS.enc.Hex).slice(0, 64);
    }

    function xorHexStrings(a, b) {
        // XOR two hex strings, ensuring they are of equal length
        let result = '';
        for (let i = 0; i < a.length; i += 2) {
            const byteA = parseInt(a.substr(i, 2), 16);
            const byteB = parseInt(b.substr(i, 2), 16);
            const xorByte = byteA ^ byteB;
            result += xorByte.toString(16).padStart(2, '0');
        }
        return result;
    }

    generateButton.addEventListener('click', () => {
        const secret = secretInput.value.trim();
        if (!/^[0-5]{62}$/.test(secret)) {
            alert('Please enter a valid SECRET: a string of 62 digits (0-5).');
            return;
        }

        // Convert secret into a hex string (each digit is encoded in a single hex digit)
        const secretHex = secret.split('').map(digit => parseInt(digit, 10).toString(16)).join('');

        // Calculate SHA512 of the secret
        const sha512Hash = CryptoJS.SHA512(secretHex);
        
        // Truncate SHA512 hash to 256 bits (64 characters)
        const share1 = truncate256(sha512Hash);

        // XOR the secretHex with share1 to get share2
        const share2 = xorHexStrings(secretHex, share1);

        share1Output.textContent = share1;
        share2Output.textContent = share2;
    });

    rebuildButton.addEventListener('click', () => {
        const share1 = share1Input.value.trim();
        const share2 = share2Input.value.trim();

        if (share1.length !== 64 || share2.length !== 64) {
            alert('Please enter valid shares: 256 bits long (64 hex characters).');
            return;
        }

        // XOR the two shares to get the original secret
        const secretHex = xorHexStrings(share1, share2);

        // Convert the hex string back to the original secret (digits 0-5)
        const secret = secretHex.match(/.{1}/g).map(hex => parseInt(hex, 16)).join('');

        rebuiltSecretOutput.textContent = secret;
    });
});
