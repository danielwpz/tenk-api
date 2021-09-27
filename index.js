import * as nearAPI from 'near-api-js'

const networkConfig = {
  mainnet: {
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://wallet.mainnet.near.org",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://explorer.mainnet.near.org",
  },
  testnet: {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  }
}

const contractIdMap = {
  mainnet: 'foo.near',
  testnet: 'tenk2.neariscool.testnet'
}

/**
 * @typedef {object} NFT
 * @property {string} id - token id
 * @property {string} owner_id - owner id
 */

export default {
  /**
   * @private
   * @type {nearAPI.Near}
   */
  _near: null,

  /**
   * @private
   * @type {nearAPI.providers.JsonRpcProvider}
   */
  _provider: null,

  /**
   * @private
   * @type {nearAPI.WalletConnection}
   */
  _wallet: null,

  /**
   * @private
   * @type {nearAPI.Contract}
   */
  _contract: null,
  _contractId: null,

  /**
   * init MUST be called before you can use this object
   * @param {string} network network id, mainnet or testnet
   */
  async init (network = 'testnet', contractId) {
    this._contractId = contractId || contractIdMap[network]
    if (!this._contractId) {
      throw new Error('bad network name')
    }

    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore()
    const config = networkConfig[network]
    config.keyStore = keyStore

    this._near = await nearAPI.connect(config)
    this._provider = new nearAPI.providers.JsonRpcProvider(networkConfig[network].nodeUrl)
    this._wallet = new nearAPI.WalletConnection(this._near)

    this._contract = new nearAPI.Contract(
      this._wallet.account(),
      this._contractId,
      {
        viewMethods: ['unit_price', 'total_supply', 'remaining_count', 'nft_tokens', 'nft_tokens_for_owner'],
        changeMethods: ['nft_mint']
      }
    ) 
  },

  /**
   * Check whether a user has signed in or not
   * @returns {boolean}
   */
  isSignedIn () {
    return this._wallet.isSignedIn()
  },

  /**
   * Request user to sign in through near wallet.     
   * Will redirect user to wallet
   * @returns {Promise<void>}
   */
  async signIn () {
    return this._wallet.requestSignIn(
      this._contractId,
      '秃力富NFT'
    )
  },

  /**
   * @private
   * @param {string} methodName 
   * @param {object} args 
   */
  async viewMethod (methodName, args) {
    // TODO encode args
    const argsEncoded = 'e30='
    const rawResult = await this._provider.query({
      request_type: "call_function",
      account_id: this._contractId,
      method_name: methodName,
      args_base64: argsEncoded,
      finality: "optimistic"
    })
    
    const res = JSON.parse(Buffer.from(rawResult.result).toString())
    return res
  },

  /**
   * Get the current user's account id
   * @returns {string | null}
   */
  getAccountId () {
    return this._wallet.getAccountId()
  },

  /**
   * Get total supply number of NFTs
   * @returns {Promise<number>}
   */
  async getTotalSupply () {
    return this.viewMethod('total_supply')
  },

  /**
   * Get the number of NFTs that are still mintable
   * @returns {Promise<number>}
   */
  async getRemainingCount () {
    return this.viewMethod('remaining_count')
  },

  /**
   * How much NEAR does minting one NFT cost
   * @returns {Promise<string>}
   */
  async getUnitPrice () {
    return this.viewMethod('unit_price')
  },

  /**
   * Do purchase, will redirect user to wallet
   */
  async purchase (callbackUrl) {
    const unitPrice = await this.getUnitPrice()
    return this._contract.nft_mint({
      args: {},
      amount: nearAPI.utils.format.parseNearAmount(unitPrice),
      callbackUrl
    })
  },

  /**
   * Return NFTs that are bought by the current user
   * @returns {Promise<NFT[]>}
   */
  async getMyCollections () {
    const accountId = this.getAccountId()
    if (!accountId) {
      throw new Error('please login first')
    }

    return this._contract.nft_tokens_for_owner({
      account_id: accountId
    })
  },

  /**
   * 
   * @param {number} from offset index to query from
   * @returns {Promise<NFT[]>}
   */
  async getNFTs (from) {
    return this._contract.nft_tokens({
      args: {
        from_index: from
      }
    })
  },

  /**
   * 当成功调用purchase后，钱包会跳转回当前页面，获取到参数中的transaction hash，调用此方法得到返回值
   * @param {string} txnHash 
   * @returns {Promise<object>}
   */
  async getSuccessResult () {
    const urlSearchParams = new URLSearchParams(window.location.search)
    const txnHash = urlSearchParams.get('transactionHashes')
    const result = await this._provider.txStatus(txnHash, this.getAccountId())
    const encodedReturnVal = result.receipts_outcome[0].outcome.status.SuccessValue
    return JSON.parse(atob(encodedReturnVal))
  }
}
