var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Wallet, ethers } from "ethers";
/**
 * A signer implementation that holds the private key in memory.
 *
 * ⚠️ WARNING: This class is intended **only for testing or development** purposes.
 * It stores the private key directly in memory, which makes it unsuitable for
 * production environments due to security risks.
 *
 * The `PrivateKey` signer uses an in-memory `ethers.Wallet` to sign messages following
 * the EIP-191 scheme. It verifies that the provided owner matches the wallet
 * address before signing.
 *
 * Supports key creation from both a raw private key and a mnemonic phrase.
 */
export default class PrivateKey {
    constructor(privateKeyHex) {
        this.wallet = new Wallet(privateKeyHex);
    }
    static createRandom() {
        const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
        return PrivateKey.fromMnemonic(mnemonic);
    }
    static fromMnemonic(mnemonic) {
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        return new PrivateKey(wallet.privateKey);
    }
    address() {
        return this.wallet.address;
    }
    sign(owner, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof owner !== "string" ||
                !ethers.isAddress(owner) ||
                this.wallet.address.toLowerCase() !== owner.toLowerCase()) {
                throw new Error("Invalid owner address");
            }
            // ethers expects a string or Bytes for EIP-191
            const signature = yield this.wallet.signMessage(value);
            return signature;
        });
    }
    getPublicKey(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof owner !== "string" ||
                !ethers.isAddress(owner) ||
                this.wallet.address.toLowerCase() !== owner.toLowerCase()) {
                throw new Error("Invalid owner address");
            }
            return this.wallet.signingKey.publicKey;
        });
    }
    containsKey(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            // The owner for Linera's EIP-191 wallet is the wallet address.
            if (typeof owner !== "string" || !ethers.isAddress(owner)) {
                throw new Error("Invalid owner address");
            }
            if (this.wallet.address.toLowerCase() !== owner.toLowerCase()) {
                return false; // The wallet does not contain the key for this owner
            }
            return true;
        });
    }
}
