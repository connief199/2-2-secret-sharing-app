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

    console.log(`Original Secret: ${secretStr}`); // Debugging line

    const secret = secretStr.split('').map(Number); // Convert to array of integers
    const share1 = generateShare1(secretStr);
    const share2 = xorArrays(secret, share1);

    console.log(`Generated Share 1: ${share1.join('')}`); // Debugging line
    console.log(`Generated Share 2: ${share2.join('')}`); // Debugging line

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
        alert('Please enter valid shares (62 integers from 0 to 5).');
        return;
    }

    console.log(`Input Share 1: ${share1Str}`); // Debugging line
    console.log(`Input Share 2: ${share2Str}`); // Debugging line

    const share1 = share1Str.split('').map(Number);
    const share2 = share2Str.split('').map(Number);
    const reconstructedSecret = xorArrays(share1, share2);

    console.log(`Reconstructed Secret: ${reconstructedSecret.join('')}`); // Debugging line

    displayReconstructedResult(reconstructedSecret);
}

/**
 * Generates Share 1 using a truncated SHA-512 hash of the secret.
 * @param {string} secretStr - The original secret as a string.
 * @returns {number[]} The first share as an array of numbers.
 */
function generateShare1(secretStr) {
    const sha512 = new jsSHA('SHA-512', 'TEXT');
    sha512.update(secretStr);
    const hash = sha512.getHash('HEX');

    // Convert hash to an array of numbers in the range 0-5
    const share1 = [];
    for (let i = 0; i < 62; i++) {
        // Take two hex characters at a time and convert them to a number
        const byteValue = parseInt(hash.substr(i * 2, 2), 16);
        share1.push(byteValue % 6); // Map to range 0-5
    }

    return share1;
}

/**
 * XORs two arrays of numbers element-wise.
 * @param {number[]} array1 - First array.
 * @param {number[]} array2 - Second array.
 * @returns {number[]} The result of the XOR operation as an array of numbers.
 */
function xorArrays(array1, array2) {
    return array1.map((num, index) => (num + array2[index]) % 6);
}

/**
 * Displays the generated shares results in the UI.
 * @param {number[]} share1 - The first share as an array of numbers.
 * @param {number[]} share2 - The second share as an array of numbers.
 */
function displayGeneratedResults(share1, share2) {
    document.getElementById('share1').textContent = `Share 1: ${share1.join('')}`;
    document.getElementById('share2').textContent = `Share 2: ${share2.join('')}`;
}

/**
 * Displays the reconstructed secret result in the UI.
 * @param {number[]} reconstructedSecret - The reconstructed secret as an array of numbers.
 */
function displayReconstructedResult(reconstructedSecret) {
    document.getElementById('reconstructed-secret').textContent = `Reconstructed Secret: ${reconstructedSecret.join('')}`;
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
    return /^[0-5]{62}$/.test(share);
}
