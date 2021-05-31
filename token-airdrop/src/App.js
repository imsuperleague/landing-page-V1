import React from 'react'
import BscDapp from '@obsidians/bsc-dapp'
import logo from './logo.svg';
import abi from './coin.json'
import './App.css'

export default function App () {
  const dapp = React.useMemo(() => new BscDapp(), [])
  // const dapp = React.useMemo(() => new BscDapp({ extension: 'MetaMask' }), [])
  // const dapp = React.useMemo(() => new BscDapp({ extension: 'BinanceChainWallet' }), [])
  window.dapp = dapp

  const [enabled, setEnabled] = React.useState(dapp.isBrowserExtensionEnabled)
  const [account, setAccount] = React.useState(dapp.currentAddress)
  const [network, setNetwork] = React.useState()


  const [tokenContract, setTokenContract] = React.useState({
    contract_address: '0x4f9dec4651abe5c24f80c96890f45190d974650e',
    address: '0xa1e1847a8e79334bb2ee3645f0e1562a9d2a9f99',
    decimal: 18,
    txHash: ''
  })

  const [contractInfo2, setContractInfo2] = React.useState({
    address: '0x4f9dec4651abe5c24f80c96890f45190d974650e',
    recv_list: ['0x33530bb5d7b912e01eb7cc1a27d69dd078cee03a', '0xd0cda47a263859316febc1eb29a65517ab22926a'],
    amount: '10',
    txHash: ''
  })


  React.useEffect(() => dapp.onEnabled(account => {
    setEnabled(true)
    setAccount(account)
    updateNetwork(dapp.network)
  }), [])

  React.useEffect(() => dapp.onNetworkChanged(result => {
    updateNetwork(result)
  }), [])

  React.useEffect(() => dapp.onAccountChanged(account => {
    setAccount(account)
  }), [])

  const updateNetwork = (network = {}) => {
    if (network.isBscMainnet) {
      setNetwork('Mainnet')
    } else if (network.isBscTestnet) {
      setNetwork('Testnet')
    } else {
      setNetwork()
    }
  }

  const executeSetTokenContract = async () => {
    const { contract_address, address, decimal } = tokenContract
    const txParams = await dapp.executeContract({ address: contract_address, abi }, 'setTokenContract', [address, decimal])
    const txHash = await dapp.sendTransaction({
      from: account.address,
      value: dapp.parseEther('0'),
      ...txParams,
    })
    setTokenContract({ ...tokenContract, txHash })
  }

  const execute2 = async () => {
    const { address, recv_list, amount } = contractInfo2
    const txParams = await dapp.executeContract({ address, abi }, 'sendCoinsInBulk', [recv_list, amount])
    const txHash = await dapp.sendTransaction({
      from: account.address,
      value: dapp.parseEther('0'),
      ...txParams,
    })
    setContractInfo2({ ...contractInfo2, txHash })
  }

  let browserExtensionStatus
  let enableButton = null
  if (dapp.isBrowserExtensionInstalled) {
    browserExtensionStatus = `${dapp.browserExtension.name} Detected. ${enabled ? 'Enabled.' : 'Not enabled'}`
    if (!enabled) {
      enableButton = (
        <button onClick={() => dapp.enableBrowserExtension()}>
          Enable {dapp.browserExtension.name} & connect your wallet
        </button>
      )
    }
  } else {
    browserExtensionStatus = 'No Browser Extension detected'
  }

  let accountInfo = null
  if (enabled && account) {
    accountInfo = (
      <div>
        Current account: <small><code>{account.address}</code></small>
        <br/>
      </div>
    )
  }

  let networkInfo = null
  if (enabled) {
    if (network) {
      networkInfo = <p>Network: BSC {network}</p>
    } else {
      networkInfo = <p>Not connected to BSC Mainnet (<a target='_black' href='https://docs.binance.org/smart-chain/wallet/metamask.html'>Use BSC with Metamask</a>)</p>
    }
  }


  let setTokenContractForm = null
  if (enabled && network) {
    setTokenContractForm = <div>
      <h2>Token contract address</h2>
      AirDrop contract address:
      <input
         style={{ width: '300px' }}
         value={tokenContract.contract_address}
         onChange={(e) => setTokenContract({ ...tokenContract, contract_address: e.target.value })}
         placeholder="Airdrop Contract Address"
      />
      <br/>
      Which token:
      <input
         style={{ width: '300px' }}
         value={tokenContract.address}
         onChange={(e) => setTokenContract({ ...tokenContract, address: e.target.value })}
         placeholder="Token Contract Address"
      />
      <br/>
      Decimal:
       <input
         style={{ width: '300px' }}
         value={tokenContract.decimal}
         onChange={(e) => setTokenContract({ ...tokenContract, decimal: e.target.value })}
         placeholder="Decimal"
      />
      <br />
      <button onClick={() => executeSetTokenContract()}>Set Token Contract</button>
     
    </div>
  }

  let contractForm2 = null
  if (enabled && network) {
    contractForm2 = <div style={{ margin: '20px 0' }}>
      <h2>
      SendAirdropInBulk
      </h2>
      Contract address:
      <input style={{ width: '300px' }}
        value={contractInfo2.address}
        onChange={(e) => setContractInfo2({ ...contractInfo2, address: e.target.value })}
        placeholder="Contract Address"
      />
      <br />
      Receiver address list:
      <textarea  style={{ width: '600px'}}
        value={contractInfo2.recv_list}
        onChange={(e) => setContractInfo2({ ...contractInfo2, recv_list: e.target.value })}
        placeholder="Receiver"
      />
      <br />
      Amount:
      <input 
        value={contractInfo2.amount}
        onChange={(e) => setContractInfo2({ ...contractInfo2, amount: e.target.value })}
        placeholder="Amount"
      />
      <br />
      <button onClick={() => execute2()}>Approve Token</button>
     
    </div>
  }

  let pageHeader = null
  pageHeader = <div className="page-header">
    <p align="center">
      {enableButton}
    </p>
    <h2 align="center" id="timeline">BEP-20 Token AirDrop</h2>
  </div>

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{browserExtensionStatus}</p>
        {pageHeader}
        {accountInfo}
        {networkInfo}
        {setTokenContractForm}
        {contractForm2}
      </header>
    </div>
  );

}