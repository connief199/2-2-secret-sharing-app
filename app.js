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

    // Helper function to convert base-6 string to binary
    function base6ToBinary(base6String) {
        const binaryArray = [];
        for (let char of base6String) {
            let num = parseInt(char, 10);
            let binary = num.toString(2).padStart(3, '0'); // Each base-6 digit is converted to 3 binary bits
            binaryArray.push(...binary.split('').map(b => parseInt(b, 10)));
        }
        return binaryArray;
    }

    // Helper function to convert binary array to base-6 string
    function binaryToBase6(binaryArray) {
        let base6String = '';
        for (let i = 0; i < binaryArray.length; i += 3) {
            const bits = binaryArray.slice(i, i + 3);
            const num = parseInt(bits.join(''), 2);
            base6String += num.toString(10);
        }
        return base6String;
    }

    // Helper function to XOR two arrays of bits
    function xorArrays(arr1, arr2) {
        return arr1.map((bit, index) => bit ^ arr2[index]);
    }

    // Function to convert hex string to binary array
    function hexToBinaryArray(hexString) {
        const binaryArray = [];
        for (let i = 0; i < hexString.length; i += 2) {
            const byte = parseInt(hexString.substr(i, 2), 16);
            const bits = byte.toString(2).padStart(8, '0');
            binaryArray.push(...bits.split('').map(b => parseInt(b, 10)));
        }
        return binaryArray;
    }

    // Function to convert binary array to hex string
    function binaryArrayToHex(binaryArray) {
        let hexString = '';
        for (let i = 0; i < binaryArray.length; i += 8) {
            const byte = binaryArray.slice(i, i + 8).join('');
            hexString += parseInt(byte, 2).toString(16).padStart(2, '0');
        }
        return hexString;
    }

    // Generate Shares event
    generateButton.addEventListener('click', () => {
        const secret = secretInput.value.trim();

        // Validate the input to ensure it is exactly 62 digits between 0-5
        if (!/^[0-5]{62}$/.test(secret)) {
            alert('Please enter a valid SECRET: a string of 62 digits (0-5).');
            return;
        }

        // Convert the secret to a binary array
        const secretBinary = base6ToBinary(secret);

        // Calculate SHA512 of the secret and truncate it to 186 bits to get SHARE 1
        const sha512Hash = CryptoJS.SHA512(CryptoJS.enc.Hex.parse(secretBinary.join('')));
        const share1Binary = hexToBinaryArray(sha512Hash.toString(CryptoJS.enc.Hex)).slice(0, 186);

        // Convert SHARE 1 to a hex string
        const share1Hex = binaryArrayToHex(share1Binary);

        // XOR the secret binary with SHARE 1 binary to get SHARE 2
        const share2Binary = xorArrays(secretBinary, share1Binary);

        // Convert SHARE 2 to a hex string
        const share2Hex = binaryArrayToHex(share2Binary);

        // Display the shares
        share1Output.textContent = share1Hex;
        share2Output.textContent = share2Hex;
    });

    // Rebuild Secret event
    rebuildButton.addEventListener('click', () => {
        const share1 = share1Input.value.trim();
        const share2 = share2Input.value.trim();

        // Validate the inputs
        if (!/^[a-fA-F0-9]{48}$/.test(share1)) {
            alert('Please enter a valid SHARE 1: 186 bits long (48 hex characters).');
            return;
        }

        if (!/^[a-fA-F0-9]{48}$/.test(share2)) {
            alert('Please enter a valid SHARE 2: 186 bits long (48 hex characters).');
            return;
        }

        // Convert SHARE 1 from hex to binary array
        const share1Binary = hexToBinaryArray(share1).slice(0, 186);

        // Convert SHARE 2 from hex to binary array
        const share2Binary = hexToBinaryArray(share2).slice(0, 186);

        // XOR SHARE 1 binary with SHARE 2 binary to reconstruct the secret
        const secretBinary = xorArrays(share1Binary, share2Binary);

        // Convert the binary array back to the original secret base-6 string
        const reconstructedSecret = binaryToBase6(secretBinary);

        // Display the reconstructed secret
        rebuiltSecretOutput.textContent = reconstructedSecret;
    });
});
