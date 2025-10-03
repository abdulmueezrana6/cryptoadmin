import * as bip39 from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english";
import { HDKey } from "@scure/bip32";
import { ethers } from "ethers";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import { AptosAccount } from "aptos";
import { Ed25519Keypair as SuiKeypair } from "@mysten/sui.js/keypairs/ed25519";
import * as secp from "@noble/secp256k1";
import { keccak_256 } from "js-sha3";
import { bytesToHex } from "@noble/hashes/utils";
import bs58 from "bs58";

//
// 👉 Helper: hex string → Uint8Array
//
function hexToBytes(hex) {
  if (hex.startsWith("0x")) hex = hex.slice(2);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

//
// 👉 Helper: privateKey → Tron address (browser-friendly)
//
function privateKeyToTronAddress(privateKeyHex) {
  const privKey = hexToBytes(privateKeyHex);

  // 1. Public key uncompressed (slice(1) bỏ prefix 0x04)
  const pubKey = secp.getPublicKey(privKey, false).slice(1);

  // 2. keccak256
  const hash = new Uint8Array(keccak_256.arrayBuffer(pubKey));

  // 3. Lấy 20 byte cuối + prefix 0x41
  const tronAddr = new Uint8Array(21);
  tronAddr[0] = 0x41;
  tronAddr.set(hash.slice(-20), 1);

  // 4. Base58 encode (không dùng Buffer)
  return bs58.encode(tronAddr);
}

//
// 👉 Main: deriveAddresses
//
export function deriveAddresses(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic, english)) {
    throw new Error("Invalid secret phrase");
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);

  //
  // ---- EVM (ETH, BSC, Polygon...)
  //
  const evmNode = root.derive("m/44'/60'/0'/0/0");
  if (!evmNode.privateKey) throw new Error("EVM node has no private key");
  const evmPrivateKey = "0x" + bytesToHex(evmNode.privateKey);
  const evmWallet = new ethers.Wallet(evmPrivateKey);
  const evmAddress = evmWallet.address;

  //
  // ---- Solana
  //
  const solNode = root.derive("m/44'/501'/0'/0'");
  if (!solNode.privateKey) throw new Error("Solana node has no private key");
  const solanaKeypair = SolanaKeypair.fromSeed(solNode.privateKey.slice(0, 32));
  const solanaAddress = solanaKeypair.publicKey.toBase58();

  //
  // ---- Aptos
  //
  const aptosNode = root.derive("m/44'/637'/0'/0'/0'");
  if (!aptosNode.privateKey) throw new Error("Aptos node has no private key");
  const aptosAccount = new AptosAccount(aptosNode.privateKey);
  const aptosAddress = aptosAccount.address().toString();
  //
  // ---- Sui
  //
  const suiNode = root.derive("m/44'/784'/0'/0'/0'");
  if (!suiNode.privateKey) throw new Error("Sui node has no private key");
  const suiSeed = suiNode.privateKey.slice(0, 32);
  const suiKeypair = SuiKeypair.fromSecretKey(suiSeed);
  const suiAddress = suiKeypair.getPublicKey().toSuiAddress();

  //
  // ---- Tron
  //
  const tronNode = root.derive("m/44'/195'/0'/0/0");
  if (!tronNode.privateKey) throw new Error("Tron node has no private key");
  const tronPrivateKey = bytesToHex(tronNode.privateKey);
  const tronAddress = privateKeyToTronAddress(tronPrivateKey);

  //
  // 👉 Return all addresses
  //
  return {
    evm: evmAddress,
    solana: solanaAddress,
    aptos: aptosAddress,
    sui: suiAddress,
    tron: tronAddress,
  };
}
