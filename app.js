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
            const segment = binaryString.slice(i, i + 4).padEnd(4, '0'); // Pad to ensure segment is 4 bits
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
           
