import {ethers} from "hardhat";
import {Factory} from "../typechain-types";
import {expect} from "chai";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

describe("Factory", function () {
    let Factory;
    let factory: Factory;

    let accounts: SignerWithAddress[];

    const collectionName = "MyNFT"
    const collectionSymbol = "MNFT"

    beforeEach(async function () {
        Factory = await ethers.getContractFactory("Factory");
        factory = await Factory.deploy();

        accounts = await ethers.getSigners();
    });

    it("Should create a new collection and mint a new token", async function () {
        const tx = await factory.createCollection(collectionName, collectionSymbol);
        const lockTxInfo = await tx.wait()
        // @ts-ignore
        const args: { collection: string } = lockTxInfo.events.filter(event => event.event === 'CollectionCreated')[0].args;

        const nft = await ethers.getContractAt("NFT", args.collection)

        const collections = await factory.getCollections();
        expect(collections.toString()).to.be.equal([args.collection].toString())

        const name = await nft.name()
        const symbol = await nft.symbol()

        expect(name).to.be.equal(collectionName)
        expect(symbol).to.be.equal(collectionSymbol)

        // mint a token
        const tokenId = 1;

        await factory.mintToken(args.collection, accounts[1].address, tokenId)

        // TODO: Add a comment to explain a so complex test
        const tokenOwner = await nft.ownerOf(tokenId);
        expect(tokenOwner).to.be.equal(accounts[1].address)
    });

    it("Should revert token minting", async function () {
        await expect(factory.mintToken(accounts[2].address, accounts[1].address, 1)).to.be.revertedWith(
            "mintToken: This collection was not created by this factory."
        );
    });
});
