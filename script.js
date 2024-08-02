document.getElementById('generate-shares').addEventListener('click', generateShares);
document.getElementById('reconstruct-secret').addEventListener('click', reconstructSecret);

/**
 * Function to generate shares from a given secret.
 */
function generateShares() {
    const secretStr = document.getElementById('secret').value.trim();

    if (!isValidSecret(secretStr)) {
        alert('Please enter a valid secret (62 integers from 0 to 5).');
        return;
    }

    const secret = secretStr.split('').map(Number); // Convert to array of integers
    const share1 = generateShare1(secret);
    const share2 = xorArrays(secret, share1);

    displayGeneratedResults(secret, share1, share2);
}

/**
 * Function to reconstruct the secret from two shares.
 */
function reconstructSecret() {
    const share1Str = document.getElementById('share1-input').value.trim();
    const share2Str = document.getElementById('share2-input').value.trim();

    if (!isValidSecret(share1Str) || !isValidSecret(share2Str)) {
        alert('Please enter valid shares (62 integers from 0 to 5).');
        return;
    }

    const share1 = share1Str.split('').map(Number);
    const share2 = share2Str.split('').map(Number);
    const reconstructedSecret = xorArrays(share1, share2);

    displayReconstructedResult(reconstructedSecret);
}

/**
 * Generates Share 1 using a truncated SHA-512 hash of the secret.
 * @param {number[]} secret - The original secret as an array of numbers.
 * @returns {number[]} The first share as an array of numbers.
 */
function generateShare1(secret) {
    const sha512 = new jsSHA('SHA-512', 'UINT8ARRAY');
    sha512.update(new Uint8Array(secret));
    const hash = new Uint8Array(sha512.getHash('UINT8ARRAY'));

    // Map the hash values to the range 0-5
    return Array.from(hash.slice(0, 62)).map(byte => byte % 6);
}

/**
 * XORs two arrays of numbers element-wise.
 * @param {number[]} array1 - First array.
 * @param {number[]} array2 - Second array.
 * @returns {number[]} The result of XOR operation as an array of numbers.
 */
function xorArrays(array1, array2) {
    return array1.map((num, index) => (num + array2[index]) % 6);
}

/**
 * Displays the generated shares results in the UI.
 * @param {number[]} secret - The original secret as an array of numbers.
 * @param {number[]} share1 - The first share as an array of numbers.
 * @param {number[]} share2 - The second share as an array of numbers.
 */
function displayGeneratedResults(secret, share1, share2) {
    document.getElementById('original-secret').textContent = `Original Secret: ${secret.join('')}`;
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
 * Validates whether a given string is a valid secret of the specified format.
 * @param {string} secret - The secret string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidSecret(secret) {
    return /^[0-5]{62}$/.test(secret);
}
