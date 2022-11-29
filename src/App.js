import React, { useState } from "react";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { Provider, Signer } from "@reef-defi/evm-provider";
import { WsProvider } from "@polkadot/rpc-provider";
import { Contract } from "ethers";
import TokenA from "./contracts/TokenA.json";
import TokenB from "./contracts/TokenB.json";
import LiquidityPool from "./contracts/LiquidityPool.json";
import Uik from "@reef-defi/ui-kit";
import {faRightLeft,faArrowsRotate} from "@fortawesome/free-solid-svg-icons";


const TokenAAbi = TokenA.abi;
const TokenAAddress = TokenA.address;
const TokenBAbi = TokenB.abi;
const TokenBAddress = TokenB.address;
const LiquidityPoolAbi = LiquidityPool.abi;
const LiquidityPoolAddress = LiquidityPool.address;

const URL = "wss://rpc-testnet.reefscan.com/ws";

function App() {
	const [signer, setSigner] = useState();
	const [isWalletConnected, setWalletConnected] = useState(false);
	const [accountAddress, setAccountAddress] = useState();
	const [tokenA, setTokenA] = useState(0);
	const [tokenB, setTokenB] = useState(0);
	const [reserve1, setReserve1] = useState(0);
	const [reserve2, setReserve2] = useState(0);
	const [swapper, setSwapper] = useState(0);
	const [isOpen, setOpen] = useState(false)
	const [isOpen2, setOpen2] = useState(false)

	const checkExtension = async () => {
		let allInjected = await web3Enable("Reef");

		if (allInjected.length === 0) {
			return false;
		}

		let injected;
		if (allInjected[0] && allInjected[0].signer) {
			injected = allInjected[0].signer;
		}

		const evmProvider = new Provider({
			provider: new WsProvider(URL),
		});

		evmProvider.api.on("ready", async () => {
			const allAccounts = await web3Accounts();

			allAccounts[0] &&
				allAccounts[0].address &&
				setWalletConnected(true);

			console.log(allAccounts);

			const wallet = new Signer(
				evmProvider,
				allAccounts[0].address,
				injected
			);

			let temp = await wallet.getAddress();
			setAccountAddress(temp);

			// Claim default account
			if (!(await wallet.isClaimed())) {
				console.log(
					"No claimed EVM account found -> claimed default EVM account: ",
					await wallet.getAddress()
				);
				await wallet.claimDefaultAccount();
			}

			setSigner(wallet);
		});
	};

	const checkSigner = async () => {
		if (!signer) {
			await checkExtension();
		}
		return true;
	};

	const mintAnB = async () => {
		await checkSigner();
		const tokenAContract = new Contract(
			TokenAAddress,
			TokenAAbi,
			signer
		);
		const tokenBContract = new Contract(
			TokenBAddress,
			TokenBAbi,
			signer
		);
		let result = await tokenAContract.mint(accountAddress,100);
		console.log(result);
		result = await tokenBContract.mint(accountAddress,100);
		console.log(result);
		await tokenAContract.approve(LiquidityPoolAddress,1000000000000);
		await tokenBContract.approve(LiquidityPoolAddress,1000000000000);
	};

	const getAnB = async () => {
		await checkSigner();
		const tokenAContract = new Contract(
			TokenAAddress,
			TokenAAbi,
			signer
		);
		const tokenBContract = new Contract(
			TokenBAddress,
			TokenBAbi,
			signer
		);
		let result = await tokenAContract.balanceOf(accountAddress);
		console.log(result.toNumber());
		result = await tokenBContract.balanceOf(accountAddress);
		console.log(result.toNumber());
	};
	const getLiquidityContract = async () => {
		await checkSigner();
		const LiquidityPool = new Contract(
			LiquidityPoolAddress,
			LiquidityPoolAbi,
			signer
		);
		
		let result = await LiquidityPool;
		console.log(result);
	};
	const getTokenAnBLiquidity = async () => {
		await checkSigner();
		const LiquidityPool = new Contract(
			LiquidityPoolAddress,
			LiquidityPoolAbi,
			signer
		);
		
		let result = await LiquidityPool.reserve1();
		setReserve1(result.toNumber());
		result = await LiquidityPool.reserve2();
		setReserve2(result.toNumber());

	};
	const addLiquidity = async () => {
		await checkSigner();
		const LiquidityPool = new Contract(
			LiquidityPoolAddress,
			LiquidityPoolAbi,
			signer
		);
		

		let result = await LiquidityPool.addLiquidity(tokenA,tokenB);
		console.log(result);
	};
	const swapTo = async (address) => {
		await checkSigner();
		const LiquidityPool = new Contract(
			LiquidityPoolAddress,
			LiquidityPoolAbi,
			signer
		);
		
			try {
			
				let result = await LiquidityPool.swapTokens(address,swapper);
				getTokenAnBLiquidity();
				console.log(result);
			} catch (error) {
				alert("You can't swap tokens more than you own!")
			}
	};



	return (
		<Uik.Container className="main">
			<Uik.Container vertical>
				<Uik.Container>
				<Uik.Text text="Liquidity" type="headline" />
					 <Uik.Text text="Pool" type="headline" />
				</Uik.Container>
				{isWalletConnected ? (
					<Uik.Container vertical className="container">
						<Uik.Modal
    title='Title'
    isOpen={isOpen}
    onClose={() => setOpen(false)}
    onOpened={() => {}}
    onClosed={() => {}}
    footer={
      <>
        <Uik.Button text='Close' onClick={() => setOpen(false)}/>
        <Uik.Button text='Confirm' fill onClick={() => setOpen(false)}/>
      </>
    }
  >
    <Uik.Text>Place modal content here ...</Uik.Text>
  </Uik.Modal>

						<Uik.Card >
						
						<Uik.Container vertical>
<Uik.Container>
						<Uik.Container><Uik.ReefAmount value={reserve1} /><Uik.Text text='TKA' type='light'/></Uik.Container>
						<Uik.Container><Uik.ReefAmount value={reserve2} /><Uik.Text text='TKB' type='light'/></Uik.Container>
						<Uik.Button
							
							onClick={getTokenAnBLiquidity}
							icon={faArrowsRotate} size='large'
						/>
</Uik.Container>
							<br />
							
						<Uik.Slider 
  value={swapper}
  onChange={e => setSwapper(e)}
  tooltip={swapper + ' REEFs'}
  helpers={[
    { position: 0, text: "0%" },
    { position: 25 },
    { position: 50, text: "50" },
    { position: 75, },
    { position: 100, text: "100%" },
  ]}
/>
<br />
<Uik.Container>
						<Uik.ActionButton text="TKA 👉 TKB" icon={faRightLeft} onClick={()=>swapTo(TokenBAddress)}/>
						<Uik.ActionButton text="TKB 👉 TKA" icon={faRightLeft} onClick={()=>swapTo(TokenAAddress)}/>
</Uik.Container>
						</Uik.Container>
						</Uik.Card>
						<Uik.Button
							text="Add Liquidity"
							onClick={addLiquidity}
						/>
						
						<Uik.Button
							text="Get liquidity contract"
							onClick={getLiquidityContract}
						/>
						<Uik.Button
							text="Mint A & B"
							onClick={mintAnB}
						/>
						<Uik.Button
							text="Get A & B"
							onClick={getAnB}
						/>

					</Uik.Container>
				) : (
					<>
						<Uik.Button
							text="Connect Wallet"
							onClick={checkExtension}
						/>
					</>
				)}
			</Uik.Container>
		</Uik.Container>
	);
}

export default App;
