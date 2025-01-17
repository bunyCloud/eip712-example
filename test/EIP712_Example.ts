import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers , network} from "hardhat";
//import { signTypedData } from "../helpers/EIP712";


export type SolidityTypesAsString = "address"
    | "bytes" | "bytes1" | "bytes2" | "bytes3" | "bytes4" | "bytes5" | "bytes6" | "bytes7" | "bytes8" | "bytes9"
    | "bytes10" | "bytes11" | "bytes12" | "bytes13" | "bytes14" | "bytes15" | "bytes16" | "bytes17" | "bytes18" | "bytes19"
    | "bytes20" | "bytes21" | "bytes22" | "bytes23" | "bytes24" | "bytes25" | "bytes26" | "bytes27" | "bytes28" | "bytes29"
    | "bytes30" | "bytes31" | "bytes32"
    | "string"
    | "uint8"
    | "uint256"



export type EIP712TypeDefinition = {
    [key: string]: {
        name: string
        type: SolidityTypesAsString
    }[]
}

export type EIP712Domain = {
    name: string
    version: string
    verifyingContract: string,
    chainId: number,    
}

export type HardhatSignerType = Awaited<Promise<PromiseLike<ReturnType<typeof ethers.getSigner>>>>


async function signTypedData (domain:EIP712Domain, types:EIP712TypeDefinition, values:Object, signer:HardhatSignerType) {
  try {      
      const signature = await signer._signTypedData(domain, types, values)
      return signature
  } catch (error) {
      console.log("[signTypedData]::error ",error )
      return ""            
  }
}



describe("EIP712_Example", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();    
    const EIP712_Example = await ethers.getContractFactory("EIP712_Example");
    
    // Create an EIP712 domainSeparator 
    // https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator
    const domainName = "TicketGenerator"  // the user readable name of signing domain, i.e. the name of the DApp or the protocol.
    const signatureVersion = "1" // the current major version of the signing domain. Signatures from different versions are not compatible.
    const chainId = network.config.chainId as number // the EIP-155 chain id. The user-agent should refuse signing if it does not match the currently active chain.
    // The typeHash is designed to turn into a compile time constant in Solidity. For example:
    // bytes32 constant MAIL_TYPEHASH = keccak256("Mail(address from,address to,string contents)");
    // https://eips.ethereum.org/EIPS/eip-712#rationale-for-typehash
    const typeHash = "Ticket(string eventName,uint256 price)"
    const argumentTypeHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(typeHash)); // convert to byteslike, then hash it 
    console.log(argumentTypeHash)

    // https://eips.ethereum.org/EIPS/eip-712#specification-of-the-eth_signtypeddata-json-rpc
    const types: EIP712TypeDefinition = {
      Ticket: [
          { name: "eventName", type: "string" },
          { name: "price", type: "uint256" },
      ]
    }  
    // get an instance of the contract
    const contract = await EIP712_Example.deploy(domainName,signatureVersion,argumentTypeHash);

    const verifyingContract = contract.address // the address of the contract that will verify the signature. The user-agent may do contract specific phishing prevention.

    const domain:EIP712Domain = {
      name: domainName,
      version: signatureVersion,
      chainId: chainId, 
      verifyingContract: verifyingContract 
    }    
    
    return { contract, owner, otherAccount, domain,types };
  }

  describe("Signing data", function () {

    it("Should verify that a ticket has been signed by the proper address", async function () {
      const { contract,domain,types, owner  } = await loadFixture(deployFixture);
      const ticket = {
        eventName:"EthDenver",
        price: ethers.constants.WeiPerEther,
      }            
      
      const signature = await signTypedData(domain,types,ticket, owner);
      
      expect(await contract.getSigner(ticket.eventName, ticket.price,signature)).to.equal(owner.address);
    });
   
  });
});
