// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        160,  20, 189, 212, 129, 188, 171, 124,  20, 179,  80,
         27, 166,  17, 179, 198, 234,  36, 113,  87,   0,  46,
        186, 250, 152, 137, 244,  15,  86, 127,  77,  97, 170,
         44,  57, 126, 115, 253,  11,  60,  90,  36, 135, 177,
        185, 231,  46, 155,  62, 164, 128, 225, 101,  79,  69,
        101, 154,  24,  58, 214, 219, 238, 149,  86
      ]            
);

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Generate new keypair for Sender wallet
    var from = Keypair.generate();

    // Check From Wallet balance after airdrop
    try {
        const walletBalance = await connection.getBalance(
            new PublicKey(from.publicKey)
        );
        console.log(`Sender Wallet balance (Before Airdrop): ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
        console.log(err);
    }

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // Check From Wallet balance after airdrop
    try {
        const walletBalance = await connection.getBalance(
            new PublicKey(from.publicKey)
        );
        console.log(`Sender Wallet balance (After Airdrop): ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
        console.log(err);
    }

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: LAMPORTS_PER_SOL / 100
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);


    // Check From Wallet balance after transaction
    try {
        const walletBalance = await connection.getBalance(
            new PublicKey(from.publicKey)
        );
        console.log(`Sender Wallet balance (After Transaction): ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
        console.log(err);
    }

    // Check To Wallet balance after transaction
    try {
        const walletBalance = await connection.getBalance(
            new PublicKey(to.publicKey)
        );
        console.log(`Receiver Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
        console.log(err);
    }
}

transferSol();
