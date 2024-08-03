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

    // Helper function to convert base-6 string to binary string
    function base6ToBinary(base6String) {
        let binaryString = '';
        for (let i = 0; i < base6String.length; i++) {
            const num = parseInt(base6String[i], 6);
            binaryString += num.toString(2).padStart(3, '0');
        }
        return binaryString;
    }

    // Helper function to convert binary string to hex
    function binaryToHex(binaryString) {
        let hexString = '';
        for (let i = 0; i < binaryString.length; i += 4) {
            const segment = binaryString.slice(i, i + 4);
            const hex = parseInt(segment, 2).toString(16);
            hexString += hex;
        }
        return hexString;
    }

    // Helper function to convert hex to binary string
    function hexToBinary(hexString) {
        let binaryString = '';
        for (let i = 0; i < hexString.length; i++) {
            const hex = parseInt(hexString[i], 16);
            binaryString += hex.toString(2).padStart(4, '0');
        }
        return binaryString;
    }

    // Helper function to XOR two binary strings
    function xorBinary(binary1, binary2) {
        const maxLength = Math.max(binary1.length, binary2.length);
        let result = '';
        for (let i = 0; i < maxLength; i++) {
            const bit1 = binary1[i] || '0';
            const bit2 = binary2[i] || '0';
            result += (bit1 === bit2 ? '0' : '1');
        }
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

        // Convert the secret to binary
        const secretBinary = base6ToBinary(secret);

        // Calculate SHA512 of the secret in binary and truncate to 128 bits (32 hex chars) for SHARE 1
        const sha512Hash = CryptoJS.SHA512(CryptoJS.enc.Hex.parse(binaryToHex(secretBinary)));
        const share1Hex = sha512Hash.toString(CryptoJS.enc.Hex).slice(0, 32);
        const share1Binary = hexToBinary(share1Hex);

        // XOR the secret binary with SHARE 1 binary to get SHARE 2 in binary
        const share2Binary = xorBinary(secretBinary, share1Binary);

        // Convert SHARE 2 to hex
        const share2Hex = binaryToHex(share2Binary);

        // Display the shares
        share1Output.textContent = share1Hex;
        share2Output.textContent = share2Hex;
    });

    // Rebuild Secret event
    rebuildButton.addEventListener('click', () => {
        const share1Hex = share1Input.value.trim();
        const share2Hex = share2Input.value.trim();

        // Validate the inputs
        if (!/^[a-fA-F0-9]{32}$/.test(share1Hex)) {
            alert('Please enter a valid SHARE 1: 128 bits long (32 hex characters).');
            return;
        }

        if (!/^[a-fA-F0-9]{32}$/.test(share2Hex)) {
            alert('Please enter a valid SHARE 2: 128 bits long (32 hex characters).');
            return;
        }

        // Convert hex shares to binary
        const share1Binary = hexToBinary(share1Hex);
        const share2Binary = hexToBinary(share2Hex);

        // XOR SHARE 1 binary with SHARE 2 binary to reconstruct the secret in binary
        const secretBinary = xorBinary(share1Binary, share2Binary);

        // Convert the binary back to base-6
        const secret = binaryToBase6(secretBinary);

        // Display the reconstructed secret
        rebuiltSecretOutput.textContent = secret;
    });

    // Helper function to convert binary to base-6 string
    function binaryToBase6(binaryString) {
        let base6String = '';
        for (let i = 0; i < binaryString.length; i += 3) {
            const segment = binaryString.slice(i, i + 3);
            const num = parseInt(segment, 2);
            base6String += num.toString(6);
        }
        return base6String;
    }
});
