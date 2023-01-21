import {
  useAddress,
  useMetamask,
  useCoinbaseWallet,
  useWalletConnect,
  useTokenBalance,
  useContract,
  getErc20,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";
import React, { useState } from "react";
import Image from 'next/image'
import axios from 'axios';
import NftPagination from "../components/nftPagination";
import INFTPaginationProps from "../interfaces/INFTPaginationProps";

import styles from "../styles/Home.module.css";

const tokenContractAddress = "0xf70A188D3ADF2d852f35fE139407287966c5c34f";
const stakingContractAddress = "0x17De3798cC0Cbe9eD0e90F1d8cF70B6dAC2690EA";

const PAGINATION_LIMIT = 24;

const Home: NextPage = () => {
  // Wallet Connection Hooks
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const connectWithCoinbaseWallet = useCoinbaseWallet();
  const connectWithWalletConnect = useWalletConnect();

  // Contract Hooks
  const tokenContract = useContract(tokenContractAddress);
  const erc20 = getErc20(tokenContract.contract)

  const { contract, isLoading } = useContract(stakingContractAddress);

  // Load Balance of Token
  const { data: tokenBalance } = useTokenBalance(erc20, address);

  ///////////////////////////////////////////////////////////////////////////
  // Custom contract functions
  ///////////////////////////////////////////////////////////////////////////
  const [claimableRewards, setClaimableRewards] = useState<any>();

  const [claimableRewardsTokenID, setClaimableRewardsTokenID] = useState<any>();

  const [selectedClaimList, setSelectedClaimList] = useState<string[]>([]);

  const [listNft, setListNft] = useState<string[]>([]);

  const [nftPaginationData, setNftPaginationData] = useState<INFTPaginationProps>({
    active: 0,
    pageSize: 0,
    total: 0,
    totalFetched: 0,
    nextCursor: null
  })

  const [isShown, setIsShown] = useState(true);

  ///////////////////////////////////////////////////////////////////////////
  // Write Functions
  ///////////////////////////////////////////////////////////////////////////
  async function availableRewards(id: any) {
    const cr = await contract?.call("availableRewards", id);
    setClaimableRewards(cr._hex);
  }

  async function batchClaimRewards(arr: any[]) {
    const batchClaim = await contract?.call("batchClaimRewards", arr);
    console.log(batchClaim, arr)

  }

  async function batchClaimRewardsList (e:React.ChangeEvent<HTMLInputElement>) {
    let checkedInput = e.target as HTMLInputElement;
    if (checkedInput.checked) {
      setSelectedClaimList(() => {
        let list : string[] = [];
        listNft.map((toy:any) => list.push(toy.name.replace('ToyPets_', '')));
        return list;
      });
    } else {
      setSelectedClaimList([]);
    }
  }

  async function claimRewards(id: any) {
    const claim = await contract?.call("claimRewards", id);
  }
  
  async function show() {
    const options = {
      method: 'GET',
      url: `https://deep-index.moralis.io/api/v2/${address}/nft`,
      params: {
        chain: 'eth',
        format: 'decimal',
        limit: PAGINATION_LIMIT,
        cursor: nftPaginationData.nextCursor,
        token_addresses: '0xD4D15B246aA6C84b5e4A0aC592E44c133db41A47'
      },
      headers: {accept: 'application/json', 'X-API-Key': 'Q4zKEBeWXo97V8JG45sXlmwoQmSv4nCoKPm9pbAR3qCjGnZK7mqYnb51SyYoqCh4'}
    };

    axios
      .request(options)
      .then(function (response) {
        for (let i = 0; i < response.data.total; i++) {
          if (response.data.result[i]) {
            const metadata = JSON.parse(response.data.result[i].metadata);
            listNft.push(metadata);
            setListNft([...listNft]);
          }
        }

        setNftPaginationData({
          active: response.data.page,
          pageSize: response.data.page_size,
          totalFetched: listNft.length,
          total: response.data.total,
          nextCursor: response.data.cursor,
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  }
  

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Claim your $TOYS</h1>
      <div className={styles.blueLeft}>
        <Image
          src="/blue.png"
          alt="blue left"
          layout="responsive"
          width={689}
          height={1007}
          quality={100}
    /></div>
    <div className={styles.yellowRight}>
        <Image
          src="/yellow.png"
          alt="yellow right"
          layout="responsive"
          width={689}
          height={1007}
          quality={100}
    /></div>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <div>
          <button className={styles.mainButton} onClick={connectWithMetamask}> Meta Mask</button>
          <button className={styles.mainButton} onClick={connectWithCoinbaseWallet}> Coinbase Wallet</button>
          <button className={styles.mainButton} onClick={connectWithWalletConnect}> Connect Wallet</button>
        </div>
      ) : (
        <>
          <div className={styles.tokenGrid}>
          <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable Rewards of TOY PETS# {!claimableRewardsTokenID ? "?" : Number(claimableRewardsTokenID)}</h3>
              <p className={styles.tokenValue}>
                <b className={styles.valueFont}>
                  {!claimableRewards
                  ? "?"
                  : Number(claimableRewards)}
                </b>{"  "}
                ${tokenBalance?.name}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Balance</h3>
              <p className={styles.tokenValue}>
                <b className={styles.valueFont}>{tokenBalance?.displayValue}</b> ${tokenBalance?.name}
              </p>
            </div>
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />

          <h2 className={styles.titleSelected}>Your ToyPets</h2>
          <button
              style={{display: isShown ? 'block' : 'none'}}
              className={`${styles.mainButton} ${styles.spacerTop}`}
              onClick={() => {
                show();
                setIsShown(false);
              }}
            >
              Show my ToyPets
            </button>
            {listNft.length>0 && (
              <div className={styles.boxSelected}>
                <input type="checkbox" id="cgv" name="cgv" onChange={batchClaimRewardsList} /> 
                <span>Claim All $TOYS from {listNft.length} ToyPets</span>
                {selectedClaimList.length > 0 && (<div>
                  <button
                    className={`${styles.mainButton} ${styles.spacerTop}`}
                    onClick={() => batchClaimRewards(selectedClaimList)}
                  >
                    Claim Selected $TOYS
                  </button>
                </div>)}
              </div>
            )}

          <div className={styles.nftBoxGrid}>
            {listNft?.map((toy: any) => (
              <div className={styles.nftBox}  key={toy.name}>
                <img className={styles.nftMedia} src={toy.image.replace('ipfs:/', 'https://ipfs.io/ipfs')}/>
                <h3 className={styles.tokenName}>{toy.name}</h3>
                <p className={styles.tokenValue}>
                </p>
                <div className={styles.divButton}>
                  <button
                    className={`${styles.mainButton} ${styles.spacerTop}`}
                    onClick={() => {availableRewards(toy.name.replace('ToyPets_', ''));
                    setClaimableRewardsTokenID(toy.name.replace('ToyPets_', ''));
                    }}
                  >
                    See your available $TOYS
                  </button>
                  <button
                    className={`${styles.mainButton} ${styles.spacerTop}`}
                    onClick={() => claimRewards(toy.name.replace('ToyPets_', ''))}
                  >
                    Claim $TOYS
                  </button>
                </div>
              </div>
            ))}
          </div>
          { !isShown && <NftPagination {...nftPaginationData} show={show} /> }

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h1 className={styles.h1}>Built by qdibs.eth</h1>
        </>
      )}
    </div>
  );
};

export default Home;
