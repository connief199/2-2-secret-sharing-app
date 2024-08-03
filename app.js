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

    // Helper function to convert base-6 string to hex
    function base6ToHex(base6String) {
        let hexString = '';
        for (let i = 0; i < base6String.length; i += 4) {
            const segment = base6String.slice(i, i + 4);
            let binary = '';
            for (const char of segment) {
                binary += parseInt(char, 10).toString(2).padStart(3, '0');
            }
            while (binary.length < 16) binary = '0' + binary; // Ensure each segment is 16 bits
            const hex = parseInt(binary, 2).toString(16).padStart(4, '0');
            hexString += hex;
        }
        return hexString;
    }

    // Helper function to XOR two hex strings
    function xorHex(hex1, hex2) {
        const bytes1 = CryptoJS.enc.Hex.parse(hex1);
        const bytes2 = CryptoJS.enc.Hex.parse(hex2);
        const result = CryptoJS.enc.Hex.stringify(CryptoJS.XOR(bytes1, bytes2));
        return result;
    }

    // Generate Shares event
    generateButton.addEventListener('click', () => {
        const secret = secretInput.value.trim();

        // Validate the input
        if (!/^[0-5]{62}$/.test(secret)) {
            alert('Please enter a valid SECRET: a string of 62 digits (0-5).');
            return;
        }

        // Convert the secret to hex
        const secretHex = base6ToHex(secret);

        // Calculate SHA512 of the secret and truncate to 128 bits (32 hex chars) for SHARE 1
        const sha512Hash = CryptoJS.SHA512(CryptoJS.enc.Hex.parse(secretHex));
        const share1Hex = sha512Hash.toString(CryptoJS.enc.Hex).slice(0, 32);

        // XOR the secret hex with SHARE 1 hex to get SHARE 2
        const share2Hex = xorHex(secretHex, share1Hex);

        // Display the shares
        share1Output.textContent = share1Hex;
        share2Output.textContent = share2Hex;
    });

    // Rebuild Secret event
    rebuildButton.addEventListener('click', () => {
        const share1 = share1Input.value.trim();
        const share2 = share2Input.value.trim();

        // Validate the inputs
        if (!/^[a-fA-F0-9]{32}$/.test(share1)) {
            alert('Please enter a valid SHARE 1: 128 bits long (32 hex characters).');
            return;
        }

        if (!/^[a-fA-F0-9]{32}$/.test(share2)) {
            alert('Please enter a valid SHARE 2: 128 bits long (32 hex characters).');
            return;
        }

        // XOR SHARE 1 hex with SHARE 2 hex to reconstruct the secret
        const secretHex = xorHex(share1, share2);

        // Convert the hex back to base-6
        const secret = hexToBase6(secretHex);

        // Display the reconstructed secret
        rebuiltSecretOutput.textContent = secret;
    });

    // Helper function to convert hex to base-6 string
    function hexToBase6(hexString) {
        let binaryString = '';
        for (let i = 0; i < hexString.length; i += 2) {
            const byte = parseInt(hexString.substr(i, 2), 16);
            binaryString += byte.toString(2).padStart(8, '0');
        }

        let base6String = '';
        for (let i = 0; i < binaryString.length; i += 3) {
            const segment = binaryString.slice(i, i + 3);
            const num = parseInt(segment, 2);
            base6String += num.toString(10);
        }
        return base6String;
    }
});
