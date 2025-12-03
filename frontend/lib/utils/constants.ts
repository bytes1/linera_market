import { BUILD_ENV as AIRKIT_BUILD_ENV } from "@mocanetwork/airkit";
import { type Address, type Chain, defineChain } from "viem";
import { baseSepolia, soneiumMinato } from "viem/chains";

export const mocaTestnet: Chain & {
  contracts: { multicall3: { address: `0x${string}`; blockCreated: number } };
} = defineChain({
  id: 5151,
  name: "Moca Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Moca Network",
    symbol: "MOCA",
  },
  rpcUrls: {
    default: {
      http: ["https://devnet-rpc.mocachain.org"],
      webSocket: ["wss://devnet-rpc.mocachain.org"],
    },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://devnet-scan.mocachain.org" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3837540,
    },
  },
} as const);

export const BUILD_ENV = AIRKIT_BUILD_ENV.SANDBOX;

const ERC20_ADDRESSES: { [chainId: number]: Address } = {
  [baseSepolia.id]: "0xa807429271f7001ED6e5eB40e2029B7ecbA9445f",
  [soneiumMinato.id]: "0x15a2e33bf32563C796b5f85e77236e20C6D1b956",
  [mocaTestnet.id]: "0xF025335C838738ba426ded3ABc8Ce36B871F5c0C",
};

const ERC721_ADDRESSES: { [chainId: number]: Address } = {
  [baseSepolia.id]: "0xc9061eEC6abEB13DC7815e47FFfe1b9a40A8088b",
  [soneiumMinato.id]: "0x51aeA0a26D84eCa3ADE38078b6eFDa5e04702607",
  [mocaTestnet.id]: "0x6c513255C62D9036aFd14dA3633C4f2e4239adD1",
};

const SPECIFIED_TOKEN_ADDRESSES: { [chainId: number]: Address } = {
  [baseSepolia.id]: "0xE73559ce9FD6dde324210A4D250610F41728029d",
  [soneiumMinato.id]: "0xE73559ce9FD6dde324210A4D250610F41728029d",
  [mocaTestnet.id]: "0xE73559ce9FD6dde324210A4D250610F41728029d",
};

export const MOCK_ERC20_CONTRACT = (chainId: number) => {
  const erc20Address = ERC20_ADDRESSES[chainId];

  if (!erc20Address) {
    throw new Error(`No erc20 address found for chainId: ${chainId}`);
  }

  return {
    address: erc20Address,
    abi: [
      "function balanceOf(address account) view returns (uint256)",
      "function symbol() view returns (string)",
      "function mint(address to, uint256 amount)",
      "function transfer(address to, uint256 value)",
      "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)",
      "error ERC20InvalidSender(address sender)",
      "error ERC20InvalidReceiver(address receiver)",
      "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
      "error ERC20InvalidApprover(address approver)",
      "error ERC20InvalidSpender(address spender)",
    ],
  };
};

export const MOCK_ERC721_CONTRACT = (chainId: number) => {
  const erc721Address = ERC721_ADDRESSES[chainId];

  if (!erc721Address) {
    throw new Error(`No erc721 address found for chainId: ${chainId}`);
  }

  return {
    address: erc721Address,
    abi: [
      "function balanceOf(address account) view returns (uint256)",
      "function safeMint(address to)",
      "function transferFrom(address from, address to, uint256 tokenId)",
      "error ERC721InvalidOwner(address owner)",
      "error ERC721NonexistentToken(uint256 tokenId)",
      "error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner)",
      "error ERC721InvalidSender(address sender)",
      "error ERC721InvalidReceiver(address receiver)",
      "error ERC721InsufficientApproval(address operator, uint256 tokenId)",
      "error ERC721InvalidApprover(address approver)",
      "error ERC721InvalidOperator(address operator)",
    ],
  };
};

export const SPECIFIED_TOKEN_ADDRESS = (chainId: number) => {
  const specifiedTokenAddress = SPECIFIED_TOKEN_ADDRESSES[chainId];

  if (!specifiedTokenAddress) {
    throw new Error(`No specified token address found for chainId: ${chainId}`);
  }

  return specifiedTokenAddress;
};

// PREDICTION MARKET CONSTANTS
export const REAL_MARKET_FACTORY_ADDRESS =
  "0xd25929931c0A761D8Ce7cE6fa6b6262223F828ac" as Address;
export const COLLATERAL_TOKEN_ADDRESS =
  "0xE73559ce9FD6dde324210A4D250610F41728029d" as Address;

// --- WARNING: Do not commit this file to a public repository ---
// In a production environment, these should be loaded securely from environment variables.

export const partnerId = "8a222988-f7f8-42d3-9b39-543d93d6fb16";

export const privateKey = `-----BEGIN PRIVATE KEY-----
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
XhLHThWNFhrfDfcVsodUBVoT2dHuPOU=
-----END PRIVATE KEY-----` as string;

export const kid = "6386cb4d-c0de-4629-a412-8dcf6f50f805";

export const jwtAlgorithm = "RS256";

export const REDIRECT_URL = "https://truemarket1.vercel.app/credential"; //
