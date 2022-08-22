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

const PROGRAM_ID = 'C2ofeG1JyBFDnKmgfq1KcgA7qPigeMC6g4znmrvnoLKh';
const programUserAccountPubKey_SEED = 'info_game_player';

interface I_GameConstructor {
  route: number;
  counter: number;
  age: number;
}

/**
* Đây là một kiểu Cấu trúc data để mỗi lần gọi
thì encode gởi đi, lên sol decode lại theo cấu trúc này và sử lý. (Schema Score)
*/
class InfoGameClass {
  route: number;
  counter: number;
  age: number;
  constructor(fields: I_GameConstructor) {
    this.route = fields.route;
    this.counter = fields.counter;
    this.age = fields.age;
  }
}

/**
* Đây là schema của borsh map từ schema [InfoGameClass]
Đây là cái chính, để borsh biến thành binary.
*/
const InfoGameSchema = new Map([
  [InfoGameClass, {
    kind: 'struct', fields: [
      ['route', 'u8'],
      ['counter', 'u32'],
      ['age', 'u32'],
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
  const [thisAccInfo, setThisAccInfo] = useState<InfoGameClass>();

  // List Account game Info Uses
  const [listAccountInfoGame, setListAccountInfoGame] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
 * The expected size of each greeting account.
 */
  const SCORE_SIZE = useMemo(() => {
    return borsh.serialize(
      InfoGameSchema,
      new InfoGameClass({ counter: 1, route: 0, age: 0 }),
    ).length;
  }, []);

  // lấy địa chỉ tài khoản program user account public key
  useEffect(() => {
    getAndCheckAndCreateNewProgramUserAccountPubKey();
    getListPlayer();
    // eslint-disable-next-line
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
        setThisAccInfo(infoClass);
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
      setThisAccInfo(infoClass);
      getListPlayer();
    }
  }

  const getProgramAccUI = () => {
    var content: any = null;
    if (programUserAccountPubKey && wallet.publicKey && isProgramUserAccountPubKeyCreated && !isLoading)
      content = (
        <>
          Program User Account:&nbsp;
          <a rel="noreferrer" href={`https://explorer.solana.com/address/${programUserAccPubKeyBase58}?cluster=devnet`} target='_blank'>{programUserAccPubKeyBase58}</a>
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
    const defaultClassReturn = new InfoGameClass({
      counter: 0,
      route: 0,
      age: 0,
    });
    if (isLoading || !programUserAccountPubKey || !wallet.publicKey) return defaultClassReturn;
    const proAccInfo = await connection.getAccountInfo(programUserAccountPubKey);
    if (proAccInfo === null) return defaultClassReturn;
    return decodeScoreFromBuffer(proAccInfo);
  }

  const decodeScoreFromBuffer = (bufferData: web3.AccountInfo<Buffer>) => {
    const scoreClass = borsh.deserialize(
      InfoGameSchema, InfoGameClass, bufferData.data,
    );
    return scoreClass;
  }

  const plusOneScoreNow = async () => {
    const data = Buffer.from(borsh.serialize(InfoGameSchema, new InfoGameClass({
      route: 0,
      counter: 1,
      age: 0,
    })));
    await handleUpdateDataInSolana(data);
  }

  const minusOneScoreNow = async () => {
    const data = Buffer.from(borsh.serialize(InfoGameSchema, new InfoGameClass({
      route: 0,
      counter: 2,
      age: 0,
    })));
    await handleUpdateDataInSolana(data);
  }

  const updateAge = async (newAge: number) => {
    const data = Buffer.from(borsh.serialize(InfoGameSchema, new InfoGameClass({
      route: 1,
      counter: 0,
      age: newAge,
    })));
    await handleUpdateDataInSolana(data);
  }

  const handleUpdateDataInSolana = async (data: Buffer) => {
    if (isLoading || !wallet.publicKey || !isProgramUserAccountPubKeyCreated || !programUserAccountPubKey) return;
    const transaction = new web3.Transaction()
      .add(new web3.TransactionInstruction({
        keys: [{ pubkey: programUserAccountPubKey, isSigner: false, isWritable: true }],
        programId: programId,
        data: data,
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
    setThisAccInfo(infoClass);
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
        <a rel="noreferrer" href={`https://solscan.io/account/${programIdBase58}?cluster=devnet`} target='_blank'>View on solscan.io</a>
        &nbsp;&nbsp;
        <a rel="noreferrer" href={`https://explorer.solana.com/address/${programIdBase58}?cluster=devnet`} target='_blank'>View on explorer.solana</a>
      </p>
      {wallet.publicKey &&
        <p className='fw-bold'>
          <span className='text-success'>PubKey:&nbsp;
          <a rel="noreferrer" href={`https://explorer.solana.com/address/${walletPubKeyBase58}?cluster=devnet`} target='_blank'>{walletPubKeyBase58}</a>
          </span>
        </p>
      }
      {getProgramAccUI()}

      {isProgramUserAccountPubKeyCreated &&
        <TableListPlayer
          data={listAccountInfoGame}
        />}

      {isProgramUserAccountPubKeyCreated && thisAccInfo &&
        <MyGameInfo
          score={thisAccInfo.counter}
          age={thisAccInfo.age}
          fun_plusScoreNow={() => plusOneScoreNow()}
          fun_minusScoreNow={() => minusOneScoreNow()}
          fun_updateAge={(newAge: number) => updateAge(newAge)}
          isLoading={isLoading}
        />}
    </div>
  );
}

export default HomePage;