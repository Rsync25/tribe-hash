#include <bitcoin/random.cpp>
#inclued <bitcoin/private.cpp>

// Function to import a private key from a Bitcoin wallet
bool importPrivateKey(const std::string& walletFilePath, const std::string& password, bc::ec_secret& private_key) {
    try {
        bc::wallet::satoshi_private secret(walletFilePath, password);
        private_key = secret.secret();
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Error importing private key: " << e.what() << std::endl;
        return false;
    }
}

// Function to recognize a message hash, public key, and signature
bool recognizeMessage(const std::string& message, const std::string& signatureHex, bc::ec_secret& private_key) {
    try {
        bc::ec_signature signature;
        bc::data_chunk signature_data;
        bc::decode_base16(signature_data, signatureHex);
        bc::extend_data(signature_data, bc::base16_literal("01")); // Append SIGHASH_ALL (0x01) to the signature
        bc::decode_signature(signature, signature_data);

        // Verify the signature
        bc::data_chunk message_data(message.begin(), message.end());
        bc::wallet::verify_signature(signature, private_key, message_data);
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Error recognizing message: " << e.what() << std::endl;
        return false;
    }
}

int main() {
    // Set the path to your wallet file and its password
    std::string walletFilePath = "path/to/your/wallet.dat";
    std::string password = "123";

    // Import the private key
    bc::ec_secret private_key;
    if (!importPrivateKey(walletFilePath, password, private_key)) {
        return 1;
    }

    // Define the message and signature to verify
    std::string message = "Hello, Bitcoin!";
    std::string signatureHex = "signature_hex_here";

    // Recognize the message, public key, and signature
    if (recognizeMessage(message, signatureHex, private_key)) {
        std::cout << "Signature is valid!" << std::endl;
    } else {
        std::cout << "Signature is not valid." << std::endl;
    }

    return 0;
}
