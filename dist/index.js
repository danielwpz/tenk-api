(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('near-api-js')) :
  typeof define === 'function' && define.amd ? define(['near-api-js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.api = factory(global.nearAPI));
}(this, (function (nearAPI) { 'use strict';

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () {
              return e[k];
            }
          });
        }
      });
    }
    n['default'] = e;
    return Object.freeze(n);
  }

  var nearAPI__namespace = /*#__PURE__*/_interopNamespace(nearAPI);

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
  };

  const contractIdMap = {
    mainnet: 'foo.near',
    testnet: 'tenk1.neariscool.testnet'
  };

  /**
   * @typedef {object} NFT
   * @property {string} id - token id
   * @property {string} owner_id - owner id
   */

  var index = {
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
    async init (network = 'testnet') {
      this._contractId = contractIdMap[network];
      if (!this._contractId) {
        throw new Error('bad network name')
      }

      const keyStore = new nearAPI__namespace.keyStores.BrowserLocalStorageKeyStore();
      const config = networkConfig[network];
      config.keyStore = keyStore;

      this._near = await nearAPI__namespace.connect(config);
      this._provider = new nearAPI__namespace.providers.JsonRpcProvider(networkConfig[network].nodeUrl);
      this._wallet = new nearAPI__namespace.WalletConnection(this._near);

      this._contract = new nearAPI__namespace.Contract(
        this._wallet.account(),
        this._contractId,
        {
          viewMethods: [],
          changeMethods: []
        }
      ); 
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
      const argsEncoded = 'e30=';
      const rawResult = await this._provider.query({
        request_type: "call_function",
        account_id: this._contractId,
        method_name: methodName,
        args_base64: argsEncoded,
        finality: "optimistic"
      });
      
      const res = JSON.parse(Buffer.from(rawResult.result).toString());
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
    async purchase () {

    },

    /**
     * Return NFTs that are bought by the current user
     * @returns {Promise<NFT[]>}
     */
    async getMyCollections () {

    },

    /**
     * 
     * @param {number} from offset index to query from
     * @returns {Promise<NFT[]>}
     */
    async getNFTs (from) {

    }
  };

  return index;

})));
