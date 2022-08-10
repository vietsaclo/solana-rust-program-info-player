import React, { useEffect, useMemo, useState } from "react";
import { Button } from 'antd';
import TableListPlayer from "../components/TableListPlayer";

/**
 * Phần import cho solana
 */
import * as web3 from '@solana/web3.js';
import * as borsh from 'borsh';
import { Buffer } from "buffer";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import MyGameInfo from "./MyGameInfo";

const PROGRAM_ID = 'Fndna14bf4mMHyfrye66jJWBrPYpWRWg3r2jtTxbekbx';
const programUserAccountPubKey_SEED = 'info_game_player';

/**
* Đây là một kiểu Cấu trúc data để mỗi lần gọi
thì encode gởi đi, lên sol decode lại theo cấu trúc này và sử lý. (Schema Score)
*/
class InfoGameClass {
  counter = 0;
  constructor(fields: { counter: number } | undefined = undefined) {
    if (fields)
      this.counter = fields.counter;
    else
      this.counter = 0;
  }
}

/**
* Đây là schema của borsh map từ schema [InfoGameClass]
Đây là cái chính, để borsh biến thành binary.
*/
const InfoGameSchema = new Map([
  [InfoGameClass, {
    kind: 'struct', fields: [
      ['counter', 'u32']
    ]
  }],
]);

// program-id
let programId: web3.PublicKey = new web3.PublicKey(PROGRAM_ID);

const HomePage: React.FC = () => {
  // Connection default
  const connection = useConnection().connection;
  const wallet = useWallet();

  /**
 * Đây là public key owner bởi program-id | tài khoản để lưu trữ data
 * của mỗi user/player.
 */
  const [programUserAccountPubKey, setProgramUserAccountPubKey] = useState<web3.PublicKey>();
  const [isProgramUserAccountPubKeyCreated, setIsProgramUserAccountPubKeyCreated] = useState<boolean>(false);

  // Score for each user
  const [score, setScore] = useState<number>(0);

  // List Account game Info Uses
  const [listAccountInfoGame, setListAccountInfoGame] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
 * The expected size of each greeting account.
 */
  const SCORE_SIZE = useMemo(() => {
    return borsh.serialize(
      InfoGameSchema,
      new InfoGameClass({ counter: 1 }),
    ).length;
  }, []);

  // lấy địa chỉ tài khoản program user account public key
  useEffect(() => {
    getAndCheckAndCreateNewProgramUserAccountPubKey();
    getListPlayer();
  }, [wallet.publicKey]);

  const getAndCheckAndCreateNewProgramUserAccountPubKey = async () => {
    if (wallet.publicKey) {
      setIsLoading(true);
      const programAcc = await web3.PublicKey.createWithSeed(
        wallet.publicKey,
        programUserAccountPubKey_SEED,
        programId
      );
      setProgramUserAccountPubKey(programAcc);
      // check Program Use Account Public Key Owner By ProgramId Exists ?
      const getProgramAccInfo = await connection.getAccountInfo(programAcc);
      // Create for user new Program Account ?
      if (getProgramAccInfo === null) {
        setIsProgramUserAccountPubKeyCreated(false);
        setIsLoading(false);
      } else {
        setIsProgramUserAccountPubKeyCreated(true);
        setIsLoading(false);
        const infoClass = decodeScoreFromBuffer(getProgramAccInfo);
        setScore(infoClass.counter);
      }
    }
  }

  const handleCreateNewProgramUserAccPubKey = async () => {
    if (isLoading || !programUserAccountPubKey || !wallet.publicKey) return;
    setIsLoading(true);

    const lamports = await connection.getMinimumBalanceForRentExemption(
      SCORE_SIZE,
    );
    console.log('Creating account', programUserAccountPubKey.toBase58(), 'to say hello to',
      lamports, wallet.publicKey, programUserAccountPubKey, programUserAccountPubKey_SEED, SCORE_SIZE, programId
    );

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.createAccountWithSeed({
        fromPubkey: wallet.publicKey,
        basePubkey: wallet.publicKey,
        seed: programUserAccountPubKey_SEED,
        newAccountPubkey: programUserAccountPubKey,
        lamports,
        space: SCORE_SIZE,
        programId,
      }),
    );
    const result = await wallet.sendTransaction(transaction, connection);
    const lastBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: lastBlockHash.blockhash,
      lastValidBlockHeight: lastBlockHash.lastValidBlockHeight,
      signature: result,
    });

    setIsLoading(false);
    // created success ?
    if (result) {
      setIsProgramUserAccountPubKeyCreated(true);
      const infoClass = await getInfoGameClassFromSolana();
      setScore(infoClass.counter);
      getListPlayer();
    }
  }

  const getProgramAccUI = () => {
    var content: any = null;
    if (programUserAccountPubKey && wallet.publicKey && isProgramUserAccountPubKeyCreated && !isLoading)
      content = (
        <>
          Program User Account:&nbsp;
          <a href={`https://explorer.solana.com/address/${programUserAccPubKeyBase58}?cluster=devnet`} target='_blank'>{programUserAccPubKeyBase58}</a>
        </>
      );
    else
      content = (
        <>
          Program User Account Not Exits:&nbsp;&nbsp;
          <Button type='primary'
            onClick={() => handleCreateNewProgramUserAccPubKey()}
          >
            Create Program User Account Here!
          </Button>
        </>
      );
    return (
      <p className='fw-bold'>
        <span className='text-success'>
          {content}
        </span>
      </p>
    );
  }

  const programIdBase58 = useMemo(() => {
    return programId.toBase58();
  }, []);
  const walletPubKeyBase58 = useMemo(() => {
    if (!wallet.publicKey) return null;
    return wallet.publicKey.toBase58();
  }, [wallet.publicKey]);
  const programUserAccPubKeyBase58 = useMemo(() => {
    if (!programUserAccountPubKey) return null;
    return programUserAccountPubKey.toBase58();
  }, [programUserAccountPubKey]);

  const getInfoGameClassFromSolana = async (): Promise<InfoGameClass> => {
    if (isLoading || !programUserAccountPubKey || !wallet.publicKey) return new InfoGameClass();
    const proAccInfo = await connection.getAccountInfo(programUserAccountPubKey);
    if (proAccInfo === null) return new InfoGameClass();
    return decodeScoreFromBuffer(proAccInfo);
  }

  const decodeScoreFromBuffer = (bufferData: web3.AccountInfo<Buffer>) => {
    const scoreClass = borsh.deserialize(
      InfoGameSchema, InfoGameClass, bufferData.data,
    );
    return scoreClass;
  }

  const plusOneScoreNow = async () => {
    if (isLoading || !wallet.publicKey || !isProgramUserAccountPubKeyCreated || !programUserAccountPubKey) return;
    const transaction = new web3.Transaction()
      .add(new web3.TransactionInstruction({
        keys: [{ pubkey: programUserAccountPubKey, isSigner: false, isWritable: true }],
        programId: programId,
        data: Buffer.from(borsh.serialize(InfoGameSchema, new InfoGameClass({ counter: 1 }))),
      }));
    const resultTransaction = await wallet.sendTransaction(transaction, connection);
    setIsLoading(true);
    const lastBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: lastBlockHash.blockhash,
      lastValidBlockHeight: lastBlockHash.lastValidBlockHeight,
      signature: resultTransaction,
    });
    const infoClass = await getInfoGameClassFromSolana();
    setScore(infoClass.counter);
    setIsLoading(false);
    getListPlayer();
  }

  const getListPlayer = async () => {
    if (!wallet.publicKey) return;
    const listAccInfo = await connection.getProgramAccounts(programId);
    if (!listAccInfo) return;
    const newList = listAccInfo.map((v, k) => {
      const infoDecode = decodeScoreFromBuffer(v.account);
      return {
        key: k,
        name: 'Comming Soon',
        age: 'Comming Soon',
        address: 'Comming Soon',
        score: infoDecode.counter,
        account: v.pubkey.toBase58(),
      }
    });
    setListAccountInfoGame(newList);
  }

  return (
    <div className="container mt-2 mb-5">
      <p className='fw-bold'>
        <span className='text-danger'>Program ID: {programIdBase58}</span>
        <br />
        <a href={`https://solscan.io/account/${programIdBase58}?cluster=devnet`} target='_blank'>View on solscan.io</a>
        &nbsp;&nbsp;
        <a href={`https://explorer.solana.com/address/${programIdBase58}?cluster=devnet`} target='_blank'>View on explorer.solana</a>
      </p>
      {wallet.publicKey &&
        <p className='fw-bold'>
          <span className='text-success'>PubKey:&nbsp;
          <a href={`https://explorer.solana.com/address/${walletPubKeyBase58}?cluster=devnet`} target='_blank'>{walletPubKeyBase58}</a>
          </span>
        </p>
      }
      {getProgramAccUI()}

      {isProgramUserAccountPubKeyCreated &&
        <TableListPlayer
          data={listAccountInfoGame}
        />}

      {isProgramUserAccountPubKeyCreated &&
        <MyGameInfo
          score={score}
          fun_plusScoreNow={() => plusOneScoreNow()}
          isLoading={isLoading}
        />}
    </div>
  );
}

export default HomePage;