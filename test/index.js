/*
 * How to run tests:
 * You need to fill in ethNode, testRpcPort, networkId, senderPk,
 * with the right information from your local node.
 */


var assert = require('assert'),
    ethPnp = require('../index.js'),
    packageData = require('../package.json'),
    EthereumTx = require('ethereumjs-tx'),
    Web3 = require('web3'),
    accounts = [],
    ethNode = 'http://localhost:8545',
    testRpcPort = 8545,
    networkId = 5777,
    web3 = null,
    ethPnpOpts = {
      eth_node: ethNode,
      network_id: networkId
    };

before(function(done) {
  web3 = new Web3(new Web3.providers.HttpProvider(ethNode));
  web3.eth.getAccounts(function(error, web3Accounts) {
    accounts = web3Accounts;
    done();
  });
});

describe('Plugin Configuration', function() {
  it('should parse the necessary attributes', function() {
    var opts = {eth_node: 'http://localhost:9545', network_id: '4'},
        parsedOpts = ethPnp.parseOpts(opts);

    assert.equal(opts.eth_node, parsedOpts.ethNode);
    assert.equal(opts.network_id, parsedOpts.networkId);
  });

  it('should have defaults', function() {
    var parsedOpts = ethPnp.parseOpts({});

    assert.equal(parsedOpts.ethNode, ethPnp.DEFAULT_ETH_NODE);
    assert.equal(parsedOpts.networkId, ethPnp.DEFAULT_NETWORK_ID);
  });
});

describe('#getPluginDefinition()', function(){
  it('should have network, version and package name', function() {
    var pluginDefinition = ethPnp.getPluginDefinition();

    assert.equal(ethPnp.NETWORK_NAME, pluginDefinition.network);
    assert.equal(packageData.name, pluginDefinition.package_name);
    assert.equal(packageData.version, pluginDefinition.version);
  });
});

describe('#submitTransaction()', function() {

  it('should submit a valid transaction', function() {
    // TO-DO: FIND a better way to get the private key
    var senderAddress = accounts[0],
        receiverAddress = accounts[1],
        senderNonce = web3.eth.getTransactionCount(senderAddress),
        senderPk = Buffer.from('49190b5ee82f5f4e9eb4b013f955312d40da5d6e9a50e815a2d31cf1a4db2315', 'hex'),
        txParams = {
          nonce: '0x' + senderNonce.toString(16),
          gasPrice: '0x1',
          gasLimit: '0x3B9AC9FF',
          to: receiverAddress,
          value: '0xDE0B6B3A7640000',
          data: null,
          chainId: networkId
        };

    const tx = new EthereumTx(txParams);
    tx.sign(senderPk);
    const serializedTx = tx.serialize().toString('hex');

    ethPnp.submitTransaction(serializedTx, {}, ethPnpOpts).then(function(pocketTxResponse) {
      assert.equal(pocketTxResponse.error, false);
      assert.equal(pocketTxResponse.errorMsg, null);
    }, function() {
      console.error(arguments);
    });
  });

  it('should return error response for an invalid transaction', function() {
    // TO-DO: FIND a better way to get the private key
    var senderAddress = accounts[0],
        receiverAddress = accounts[1],
        senderPk = Buffer.from('49190b5ee82f5f4e9eb4b013f955312d40da5d6e9a50e815a2d31cf1a4db2315', 'hex'),
        txParams = {
          nonce: '0x64',
          gasPrice: '0x1',
          gasLimit: '0x3B9AC9FF',
          to: receiverAddress,
          value: '0xDE0B6B3A7640000',
          data: null,
          chainId: networkId
        };

    const tx = new EthereumTx(txParams);
    tx.sign(senderPk);
    const serializedTx = tx.serialize().toString('hex');

    ethPnp.submitTransaction(serializedTx, {}, ethPnpOpts).then(function(pocketTxResponse) {
      assert.equal(pocketTxResponse.error, true);
    }, function() {
      console.error(arguments);
    });
  });
});

describe('#executeQuery()', function() {
  it('should execute a query', async function() {
    var account = accounts[0],
        query = {
          rpc_method: 'eth_getBalance',
          rpc_params: [account, 'latest']
        },
        queryResponse = await ethPnp.executeQuery(query, null, ethPnpOpts),
        web3Balance = web3.eth.getBalance(account);
    assert.equal(queryResponse.result, '0x' + web3Balance.toString(16));
  });

  it('should return error response for an invalid query', async function() {
    var query = {
      rpc_method: 'web3_getBalance',
      rpc_params: [accounts[0], 'latest']
    };
    var queryResponse = await ethPnp.executeQuery(query, null, ethPnpOpts);
    assert.equal(queryResponse.result, null);
    assert.equal(queryResponse.error, true);
  });
});
