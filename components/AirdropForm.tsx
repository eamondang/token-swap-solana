import {
  Box,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { FC, useState } from "react";
import * as Web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AirdropSchema } from "../models/Airdrop";
import {
  tokenAMint,
  tokenBMint,
  airdropPDA,
  airdropProgramId,
} from "../utils/constants";
import * as token from "@solana/spl-token";

export const Airdrop: FC = () => {
  const [amount, setAmount] = useState(0);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handletokenASubmit = (event: any) => {
    event.preventDefault();
    const airdrop = new AirdropSchema(amount);
    handletokenATransactionSubmit(airdrop);
  };

  const handletokenATransactionSubmit = async (airdrop: AirdropSchema) => {
    if (!publicKey) {
      alert("Please connect your wallet!");
      return;
    }
    const transaction = new Web3.Transaction();

    const userATA = await token.getAssociatedTokenAddress(
      tokenAMint,
      publicKey
    );
    let account = await connection.getAccountInfo(userATA);

    if (account == null) {
      const createATAIX = await token.createAssociatedTokenAccountInstruction(
        publicKey,
        userATA,
        publicKey,
        tokenAMint
      );
      transaction.add(createATAIX);
    }

    const buffer = airdrop.serialize();

    const airdropIX = new Web3.TransactionInstruction({
      keys: [
        {
          pubkey: publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: userATA,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: tokenAMint,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: airdropPDA,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: token.TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: buffer,
      programId: airdropProgramId,
    });

    transaction.add(airdropIX);

    try {
      let txid = await sendTransaction(transaction, connection);
      alert(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
      console.log(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
    } catch (e) {
      console.log(JSON.stringify(e));
      alert(JSON.stringify(e));
    }
  };

  const handletokenBSubmit = (event: any) => {
    event.preventDefault();
    const airdrop = new AirdropSchema(amount);
    handletokenBTransactionSubmit(airdrop);
  };

  const handletokenBTransactionSubmit = async (airdrop: AirdropSchema) => {
    if (!publicKey) {
      alert("Please connect your wallet!");
      return;
    }
    const transaction = new Web3.Transaction();

    const userATA = await token.getAssociatedTokenAddress(
      tokenBMint,
      publicKey
    );
    let account = await connection.getAccountInfo(userATA);

    if (account == null) {
      const createATAIX = await token.createAssociatedTokenAccountInstruction(
        publicKey,
        userATA,
        publicKey,
        tokenBMint
      );
      transaction.add(createATAIX);
    }

    const buffer = airdrop.serialize();

    const airdropIX = new Web3.TransactionInstruction({
      keys: [
        {
          pubkey: publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: userATA,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: tokenBMint,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: airdropPDA,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: token.TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: buffer,
      programId: airdropProgramId,
    });

    transaction.add(airdropIX);

    try {
      let txid = await sendTransaction(transaction, connection);
      alert(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
      console.log(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
    } catch (e) {
      console.log(JSON.stringify(e));
      alert(JSON.stringify(e));
    }
  };

  return (
    <Box
      p={4}
      display={{ md: "flex" }}
      maxWidth="32rem"
      margin={2}
      justifyContent="center"
    >
      <form style={{ margin: 2 }} onSubmit={handletokenASubmit}>
        <FormControl isRequired>
          <FormLabel color="gray.200">Token A</FormLabel>
          <NumberInput
            max={1000}
            min={1}
            onChange={(valueString) => setAmount(parseInt(valueString))}
          >
            <NumberInputField id="amount" color="gray.400" />
          </NumberInput>
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Airdrop Token A
        </Button>
      </form>

      <form style={{ margin: 2 }} onSubmit={handletokenBSubmit}>
        <FormControl isRequired>
          <FormLabel color="gray.200">Token B</FormLabel>
          <NumberInput
            max={1000}
            min={1}
            onChange={(valueString) => setAmount(parseInt(valueString))}
          >
            <NumberInputField id="amount" color="gray.400" />
          </NumberInput>
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Airdrop Token B
        </Button>
      </form>
    </Box>
  );
};
