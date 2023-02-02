// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "./nft.sol";

contract Factory {

    NFT[] public collections;
    mapping(address => bool) private _createdCollections;

    event CollectionCreated(address collection, string name, string symbol);
    event TokenMinted(address collection, address recipient, uint256 tokenId, string tokenUri);

    function createCollection(string memory name_, string memory symbol_) external returns (address) {
        NFT collection = new NFT(name_, symbol_);
        collections.push(collection);
        _createdCollections[address(collection)] = true;

        emit CollectionCreated(address(collection), name_, symbol_);
        return address(collection);
    }

    // @dev despite the fact the NFT contract is restricted to mint by onlyOwner,
    // @dev this function allows to mint collection's token on demonstration purpose
    function mintToken(NFT collection, address to, uint256 tokenId) external {
        require(_createdCollections[address(collection)], "mintToken: This collection was not created by this factory.");
        collection.mint(to, tokenId);
        emit TokenMinted(address(collection), to, tokenId, collection.tokenURI(tokenId));
    }

    function getCollections() external view returns (NFT[] memory) {
        NFT[] memory colls = new NFT[](collections.length);
        for (uint256 i = 0; i < collections.length; i++) {
            colls[i] = collections[i];
        }
        return colls;
    }

}
