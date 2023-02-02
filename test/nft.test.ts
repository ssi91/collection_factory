import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {ethers} from "hardhat";
import {NFT} from "../typechain-types";
import {address} from "hardhat/internal/core/config/config-validation";
import {expect} from "chai";

describe("NFT", function () {
    let NFTFactory;
    let nft: NFT;
    let accounts: SignerWithAddress[];

    beforeEach(async function () {
        NFTFactory = await ethers.getContractFactory("NFT");
        nft = await NFTFactory.deploy("MyNFT", "MNFT");

        accounts = await ethers.getSigners();
    });

    it("Should mint", async function () {
        const tokenId = 1;
        await nft.mint(accounts[1].address, tokenId);

        const owner = await nft.ownerOf(tokenId);
        expect(owner).to.be.equal(accounts[1].address)
    });

    it("Should revert on attempt to mint from a non owner address", async function () {
        const tokenId = 1;
        await expect(nft.connect(accounts[1]).mint(accounts[1].address, tokenId)).to.be.reverted;
    });
});
