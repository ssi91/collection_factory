import {ethers} from "hardhat";

async function main() {
    const collectionAddress = "0x8C4a8314319A66A0721805CF844680408bC4BC1E";
    const nft = await ethers.getContractAt("NFT", collectionAddress);

    console.log(await nft.name());
    console.log(await nft.symbol());
    console.log(await nft.ownerOf(111));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
