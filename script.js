document.getElementById('generate-shares').addEventListener('click', generateShares);
document.getElementById('rebuild-secret').addEventListener('click', rebuildSecret);

/**
 * Function to generate shares from a given secret.
 */
function generateShares() {
    const secretStr = document.getElementById('secret').value.trim();

    // Validate the secret
    if (!isValidSecret(secretStr)) {
        alert('Please enter a valid secret (62 integers from 0 to 5).');
        return;
    }

    const secret = secretStr.split('').map(Number); // Convert to array of integers
    const share1 = generateShare1(secretStr);
    const share2 = xorArrays(secret, share1);

    displayGeneratedResults(share1, share2);
}

/**
 * Function to reconstruct the secret from two shares.
 */
function rebuildSecret() {
    const share1Str = document.getElementById('share1-input').value.trim();
    const share2Str = document.getElementById('share2-input').value.trim();

    // Validate the shares
    if (!isValidShare(share1Str) || !isValidShare(share2Str)) {
        alert('Please enter valid shares (256 bits, 64 hexadecimal characters).');
        return;
    }

    const share1 = hexToArray(share1Str);
    const share2 = hexToArray(share2Str);
    const reconstructedSecret = xorArrays(share1, share2);

    displayReconstructedResult(reconstructedSecret);
}

/**
 * Generates Share 1 using a truncated SHA-512 hash of the secret.
 * @param {string} secretStr - The original secret as a string.
 * @returns {number[]} The first share as an array of numbers (256 bits).
 */
function generateShare1(secretStr) {
    const sha512 = new jsSHA('SHA-512', 'TEXT');
    sha512.update(secretStr);
    const hash = sha512.getHash('HEX');

    // Take the first 64 hex characters (256 bits) and convert to array of numbers in range 0-5
    return hexToArray(hash.substr(0, 64));
}

/**
 * XORs two arrays of numbers element-wise.
 * @param {number[]} array1 - First array.
 * @param {number[]} array2 - Second array.
 * @returns {number[]} The result of the XOR operation as an array of numbers.
 */
function xorArrays(array1, array2) {
    return array1.map((num, index) => (num ^ array2[index]) % 6);
}

/**
 * Converts a hexadecimal string to an array of numbers in range 0-5.
 * @param {string} hex - The hexadecimal string.
 * @returns {number[]} The resulting array of numbers.
 */
function hexToArray(hex) {
    const array = [];
    for (let i = 0; i < hex.length; i += 2) {
        // Convert two hex characters to a decimal number
        const byteValue = parseInt(hex.substr(i, 2), 16);
        array.push(byteValue % 6); // Map to range 0-5
    }
    return array;
}

/**
 * Displays the generated shares results in the UI.
 * @param {number[]} share1 - The first share as an array of numbers.
 * @param {number[]} share2 - The second share as an array of numbers.
 */
function displayGeneratedResults(share1, share2) {
    document.getElementById('share1').textContent = `Share 1: ${arrayToHex(share1)}`;
    document.getElementById('share2').textContent = `Share 2: ${arrayToHex(share2)}`;
}

/**
 * Displays the reconstructed secret result in the UI.
 * @param {number[]} reconstructedSecret - The reconstructed secret as an array of numbers.
 */
function displayReconstructedResult(reconstructedSecret) {
    document.getElementById('reconstructed-secret').textContent = `Reconstructed Secret: ${reconstructedSecret.join('')}`;
}

/**
 * Converts an array of numbers in range 0-5 to a hexadecimal string.
 * @param {number[]} array - The array of numbers.
 * @returns {string} The resulting hexadecimal string.
 */
function arrayToHex(array) {
    return array.map(num => num.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates whether a given string is a valid secret.
 * @param {string} secret - The secret string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidSecret(secret) {
    return /^[0-5]{62}$/.test(secret);
}

/**
 * Validates whether a given string is a valid share.
 * @param {string} share - The share string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidShare(share) {
    return /^[0-9a-fA-F]{64}$/.test(share); // 256 bits as 64 hexadecimal characters
}
