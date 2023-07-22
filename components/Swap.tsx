import {
  Box,
  Select,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Text,
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import * as Web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  tokenAMint,
  tokenBMint,
  tokenSwapStateAccount,
  swapAuthority,
  pooltokenAAccount,
  pooltokenBAccount,
  poolMint,
  feeAccount,
} from "../utils/constants";

import { TokenSwap, TOKEN_SWAP_PROGRAM_ID } from "@solana/spl-token-swap";

import * as token from "@solana/spl-token";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const SwapToken: FC = () => {
  const [amount, setAmount] = useState(0);
  const [mint1, setMint1] = useState("");
  const [mint2, setMint2] = useState("");

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSwapSubmit = (event: any) => {
    event.preventDefault();
    handleTransactionSubmit();
  };

  const handleTransactionSubmit = async () => {
    if (!publicKey) {
      alert("Please connect your wallet!");
      return;
    }

    const tokenAMintInfo = await token.getMint(connection, tokenAMint);
    const tokenBMintInfo = await token.getMint(connection, tokenBMint);

    const tokenAATA = await token.getAssociatedTokenAddress(
      tokenAMint,
      publicKey
    );
    const tokenBATA = await token.getAssociatedTokenAddress(
      tokenBMint,
      publicKey
    );
    const tokenAccountPool = await token.getAssociatedTokenAddress(
      poolMint,
      publicKey
    );

    const transaction = new Web3.Transaction();

    let account = await connection.getAccountInfo(tokenAccountPool);

    if (account == null) {
      const createATAInstruction =
        token.createAssociatedTokenAccountInstruction(
          publicKey,
          tokenAccountPool,
          publicKey,
          poolMint
        );
      transaction.add(createATAInstruction);
    }

    if (mint1 === "option1" && mint1 !== mint2) {
      const instruction = TokenSwap.swapInstruction(
        tokenSwapStateAccount, // Token swap state account
        swapAuthority, // Token swap state account
        publicKey, // public key wallet
        tokenAATA, // Token A token account
        pooltokenAAccount, // Swap pool token A
        pooltokenBAccount, // Swap pool token B
        tokenBATA, // Token B token account
        poolMint, // Swap pool token mint
        feeAccount, // Token fee account
        null, // set hostFeeAccount is null
        TOKEN_SWAP_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        amount * 10 ** tokenAMintInfo.decimals,
        0
      );
      transaction.add(instruction);
    }
    if (mint1 === "option2" && mint1 !== mint2) {
      const instruction = TokenSwap.swapInstruction(
        tokenSwapStateAccount,
        swapAuthority,
        publicKey,
        tokenBATA,
        pooltokenBAccount,
        pooltokenAAccount,
        tokenAATA,
        poolMint,
        feeAccount,
        null,
        TOKEN_SWAP_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        amount * 10 ** tokenBMintInfo.decimals,
        0
      );
      transaction.add(instruction);
    }
    if (mint1 === mint2) {
      alert("Please choose another token!");
    } else {
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
      <form onSubmit={handleSwapSubmit}>
        <FormControl isRequired>
          <FormLabel color="gray.200">Swap Token</FormLabel>
          <div style={{ display: "felx" }}>
            <NumberInput
              max={1000}
              min={1}
              onChange={(valueString) => setAmount(parseInt(valueString))}
              style={{ margin: "20px 0" }}
            >
              <NumberInputField
                id="amount"
                color="gray.400"
                placeholder="Amount"
              />
            </NumberInput>
            <Select
              display={{ md: "flex" }}
              justifyContent="center"
              placeholder="Choose token"
              color="white"
              variant="outline"
              dropShadow="#282c34"
              onChange={(item) => setMint1(item.currentTarget.value)}
            >
              <option style={{ color: "#282c34" }} value="option1">
                Token A
              </option>
              <option style={{ color: "#282c34" }} value="option2">
                Token B
              </option>
            </Select>
            <Text className="text-swap">To receive</Text>

            <Select
              display={{ md: "flex" }}
              justifyContent="center"
              placeholder="Choose token"
              color="white"
              variant="outline"
              dropShadow="#282c34"
              onChange={(item) => setMint2(item.currentTarget.value)}
            >
              <option style={{ color: "#282c34" }} value="option1">
                Token A
              </option>
              <option style={{ color: "#282c34" }} value="option2">
                Token B
              </option>
            </Select>
          </div>
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Swap ⇅
        </Button>
      </form>
    </Box>
  );
};
