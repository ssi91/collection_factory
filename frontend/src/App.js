import {useEffect, useState} from 'react';
import './App.css';
import {ethers} from 'ethers';

import contract from './contracts/Factory.json'

const {factoryAddress} = require('./config.json');

function App() {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [collections, setCollections] = useState([]);
    const [collectionName, setCollectionName] = useState("");
    const [collectionSymbol, setCollectionSymbol] = useState("");
    const [tokenIds, setTokenIds] = useState([]);

    const checkWalletIsConnected = async () => {
        const {ethereum} = window;
        if (!ethereum) {
            console.log("Make sure you have Metamask installed");
        } else {
            console.log("Wallet exists! We're ready to go!")
        }

        const accounts = await ethereum.request({method: 'eth_accounts'});
        if (accounts.length !== 0) {
            console.log("Found an authorized account: ", accounts[0]);
            setCurrentAccount(accounts[0]);
        } else {
            console.log("No authorized account found");
        }
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const factory = new ethers.Contract(factoryAddress, contract.abi, signer);
        let currentCollections = await factory.getCollections();
        setCollections(currentCollections);
        setTokenIds(new Array(collections.length));
    }

    const connectWalletHandler = async () => {
        const {ethereum} = window;
        if (!ethereum) {
            console.log("Make sure you have Metamask installed");
        }

        try {
            const accounts = await ethereum.request({method: 'eth_requestAccounts'});
            console.log('Found an account! Address: ', accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (e) {
            console.log(e);
        }
    }

    const mintNftHandler = async (i) => {
        const tokenId = tokenIds[i];
        if (tokenId === undefined || tokenId === '') {
            console.log("Token Id field mustn't be empty");
            return;
        }
        const collectionAddress = collections[i];

        const {ethereum} = window; // TODO: check if exists
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const factory = new ethers.Contract(factoryAddress, contract.abi, signer);
        await factory.mintToken(collectionAddress, currentAccount, tokenId);
    }

    const createCollection = async () => {
        const {ethereum} = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const factory = new ethers.Contract(factoryAddress, contract.abi, signer);

            if (collectionName === '' || collectionSymbol === '') {
                console.log("Collection Name and Symbol fields must not be empty")
                return;
            }

            console.log(collectionName, collectionSymbol)
            const tx = await factory.createCollection(collectionName, collectionSymbol);

            console.log("Mining... Please wait");
            const txInfo = await tx.wait();
            const args = txInfo.events.filter(event => event.event === 'CollectionCreated')[0].args;
            console.log(args.collection);

            let currentCollections = await factory.getCollections();
            setCollections(currentCollections);
        } else {
            console.log("Ethereum object is not exist")
        }
    }

    const collectionsList = () => {
        const collsList = collections.map((addr, i) =>
            <div className='forms-container'>
                <form>
                    {addr}
                    <input
                        className={'token-id-input collection collection-' + i}
                        placeholder='Token ID'
                        onChange={(e) => {
                            tokenIds[i] = e.target.value
                        }}
                    />
                    <button
                        className='cta-button mint-nft-button'
                        onClick={(e) => mintNftHandler(i)}
                        type='button'
                    >
                        Mint Token
                    </button>
                </form>
            </div>
        )
        return (
            <div>
                {collsList}
            </div>
        );
    }
    const createCollectionButton = () => {
        return (
            <form>
                <div>
                    <input
                        className='collection collection-name'
                        placeholder='Collection Name'
                        onChange={(e) => setCollectionName(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        className='collection collection-symbol'
                        placeholder='Collection Symbol'
                        onChange={(e) => setCollectionSymbol(e.target.value)}
                    />
                </div>
                <button type='button' onClick={createCollection} className='cta-button create-collection-button'>
                    Create Collection
                </button>
            </form>
        )
    }

    const connectWalletButton = () => {
        return (
            <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
                Connect Wallet
            </button>
        )
    }

    const contractForms = () => {
        return (
            <div>
                {createCollectionButton()}
                <br/>
                {collectionsList()}
            </div>
        )
    }

    useEffect(() => {
        checkWalletIsConnected();
    }, [])

    return (
        <div className='main-app'>
            <div>
                {
                    currentAccount ?
                        contractForms() :
                        connectWalletButton()
                }
            </div>
        </div>
    )
}

export default App;
