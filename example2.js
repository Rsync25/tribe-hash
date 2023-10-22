const { bech32m } = require('bech32');
Object.assign(global, { WebSocket: require('ws') });
Object.assign(global, { crypto: require('crypto') });

const testnet = {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  };

  
  (async function() {
    const ecc = await import('tiny-secp256k1');
    const BIP32Factory = (await import('bip32')).BIP32Factory;
    const signerModule = await import('@scure/btc-signer');
    const { hex } = await import ('@scure/base');
    const {schnorr } = await import( '@noble/curves/secp256k1');
 
    const bip32 = BIP32Factory(ecc)
    const node = bip32.fromBase58('tprv8ZgxMBicQKsPd7Uf69XL1XwhmjHopUGep8GuEiJDZmbQz6o58LninorQAfcKZWARbtRtfnLcJ5MQ2AtHcQJCCRUcMRvmDUjyEmNUWwx8UbK',  testnet)
    const toXOnly = (key) => (key.length === 33 ? key.slice(1, 33) : key);
  
    const pb = toXOnly(node.publicKey);
  
    const sm = signerModule;
    const p2trAddress = sm.p2tr(pb, undefined, testnet);
    const result = {
        ...p2trAddress,
        tapInternalKey: Buffer.from(p2trAddress.tapInternalKey),
        output: hex.encode(p2trAddress.script),
        script: Buffer.from(p2trAddress.script),
        pubkey: Buffer.from(pb, 'hex'),
    };

    console.log("Wallet address:", result.address)

    const pubFromAddress =  Buffer.from(bech32m.fromWords(bech32m.decode(result.address).words))
    // This one will be the pubkey on the bitpac, since we user's input is a taproot address.
    console.log("Address pubkey:", pubFromAddress.toString("hex"))
    

    const message = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex');
    const test = schnorr.sign(message, node.privateKey); // Sign with tprv
    const hexTest = Buffer.from(test).toString('hex')
    
    // How can I verify that the address generated pubkey is based off of the tprv?
    const isValid = schnorr.verify(hexTest, message, toXOnly(pubFromAddress));
    console.log("Is the pub key valid?", isValid); // false 
  })();
