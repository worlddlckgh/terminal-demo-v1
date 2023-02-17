// Next, React
import { FC, useEffect, useMemo } from 'react';
import { createTransferCheckedInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';

// Wallet
import { useWallet } from '@solana/wallet-adapter-react';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { notify } from 'utils/notifications';

// TODO: Fill up your own endpoint
const endpoint = '';
export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  const connection = useMemo(() => new Connection(endpoint), []);

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    if (wallet.publicKey) {
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  async function transferToWallet() {
    const usdcAta = getAssociatedTokenAddressSync(new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), wallet.publicKey)
    const tx = new Transaction().add(
      createTransferCheckedInstruction(
        usdcAta, // from (should be a token account)
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // mint
        usdcAta, // to (should be a token account)
        wallet.publicKey, // from's owner
        1000, // amount, if your deciamls is 8, send 10^8 for 1 token
        6 // decimals
      )
    );
    const txid = await wallet.sendTransaction(tx, connection);
    notify({
      type: 'success',
      message: `Payment sent!`,
      description: `Successfully purchased something.`,
      txid: txid
    });
  }

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div
          id="integrated-terminal"
          className='mt-4 mb-20 bg-white/10 rounded-md w-[400px]'
        />

        {/* How to add Fee */}
        <button
          className='rounded-md bg-blue-500 text-white px-4 py-2 hover:bg-blue-600'
          onClick={() =>
            (window as any).Jupiter.init({
              "displayMode": "integrated",
              "integratedTargetId": "integrated-terminal",
              "formProps": {
                "swapMode": "ExactOut"
              },
              onSuccess: () => {

              },
              passthroughWallet: wallet,
              endpoint,
              platformFeeAndAccounts: {
                feeBps: 20,
                feeAccounts: new Map([
                  ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', new PublicKey('2QDFyBkhaGLLM5wzLgWGbuQaDPi2w4MK45sBnGz2hR1v')]
                ])
              }
            })
          }
        >
          Launch Integrated
        </button>

        {/* How to Add payment after swap */}
        <button
          className='rounded-md bg-blue-500 text-white px-4 py-2 hover:bg-blue-600'
          onClick={() =>
            (window as any).Jupiter.init({
              "displayMode": "integrated",
              "integratedTargetId": "integrated-terminal",
              "formProps": {
                "initialInputMint": 'So11111111111111111111111111111111111111112',
                "initialOutputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "fixedOutputMint": true,
                "initialAmount": "100000",
                "fixedAmount": true,
                "swapMode": "ExactOut"
              },
              onSuccess: () => {
                transferToWallet();
              },
              passthroughWallet: wallet,
              endpoint,
            })
          }
        >
          Payment after swap
        </button>
      </div>
    </div>
  );
};
