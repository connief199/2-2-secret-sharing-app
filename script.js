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
        return hash.toString(CryptoJS.enc.Hex).slice(0, 64);
    }

    function xorHexStrings(a, b) {
        let result = '';
        for (let i = 0; i < a.length; i += 2) {
            result += (parseInt(a.substr(i, 2), 16) ^ parseInt(b.substr(i, 2), 16)).toString(16).padStart(2, '0');
        }
        return result;
    }

    generateButton.addEventListener('click', () => {
        const secret = secretInput.value;
        if (!/^[0-5]{62}$/.test(secret)) {
            alert('Please enter a valid SECRET: a string of 62 digits (0-5).');
            return;
        }

        const secretHex = secret.split('').map(digit => parseInt(digit, 10).toString(16).padStart(1, '0')).join('');
        const sha512 = CryptoJS.SHA512(secretHex);
        const share1 = truncate256(sha512);
        const share2 = xorHexStrings(secretHex, share1);

        share1Output.textContent = share1;
        share2Output.textContent = share2;
    });

    rebuildButton.addEventListener('click', () => {
        const share1 = share1Input.value;
        const share2 = share2Input.value;

        if (share1.length !== 64 || share2.length !== 64) {
            alert('Please enter valid shares: 256 bits long (64 hex characters).');
            return;
        }

        const secretHex = xorHexStrings(share1, share2);
        const secret = secretHex.match(/.{1,1}/g).map(hex => parseInt(hex, 16)).join('');
        rebuiltSecretOutput.textContent = secret;
    });
});
