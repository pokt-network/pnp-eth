var packageData = require('../package.json'),
    Web3 = require('web3'),
    ethAbiDecoder = require('ethereumjs-abi');

const DEFAULT_ETH_NODE = 'http://127.0.0.1:8545',
      DEFAULT_NETWORK_ID = '5777',
      NETWORK_NAME = 'ETH';

module.exports.DEFAULT_ETH_NODE = DEFAULT_ETH_NODE;
module.exports.DEFAULT_NETWORK_ID = DEFAULT_NETWORK_ID;
module.exports.NETWORK_NAME = NETWORK_NAME;

function parseOpts(opts) {
  return {
    ethNode: opts['eth_node'] || DEFAULT_ETH_NODE,
    networkId: opts['network_id'] || DEFAULT_NETWORK_ID
  }
}

module.exports.parseOpts = parseOpts;

module.exports.getPluginDefinition = function() {
  return {
    network: NETWORK_NAME,
    version: packageData.version,
    package_name: packageData.name
  }
}

module.exports.submitTransaction = async function(serializedTx, txMetadata, opts) {
  var parsedOpts = parseOpts(opts),
      ethNode = parsedOpts.ethNode,
      networkId = parsedOpts.networkId,
      web3 = new Web3(new Web3.providers.HttpProvider(ethNode)),
      serializedTx = serializedTx.startsWith('0x') ? serializedTx : ('0x' + serializedTx),
      txHash = null,
      error = false,
      errorMsg = null;

  try {
    txHash = await web3.eth.sendRawTransaction(serializedTx);
  } catch (e) {
    console.error(e);
    txHash = null;
    error = true;
    errorMsg = e;
  }

  return {
    hash: txHash,
    metadata: {},
    error: error,
    errorMsg: errorMsg
  };
}

module.exports.executeQuery = async function(query, decodeOpts, opts) {
  var parsedOpts = parseOpts(opts),
      ethNode = parsedOpts.ethNode,
      networkId = parsedOpts.networkId,
      web3 = new Web3(new Web3.providers.HttpProvider(ethNode)),
      result = null,
      decoded = false,
      error = false,
      errorMsg = null,
      rpcResponse = {};

  if (typeof query !== 'object') {
    error = true;
    errorMsg = 'Invalid query, must be an Object';
  } else {
    try {
      // TODO: Figure out if dynamic ID would be useful
      rpcResponse = web3.currentProvider.send({
        id: 1,
        jsonrpc: '2.0',
        method: query.rpc_method,
        params: query.rpc_params
      });
      if (rpcResponse.error) {
        result = null;
        error = true;
        errorMsg = rpcResponse.error.message;
      } else {
        result = rpcResponse.result;
      }
    } catch (e) {
      console.error(e);
      result = null;
      error = true;
      errorMsg = e;
    }

    if (query.rpc_method === 'eth_call' && rpcResponse && decodeOpts && Array.isArray(decodeOpts.return_types)) {
      try {
        result = ethAbiDecoder.rawDecode(decodeOpts.return_types, [rpcResponse.result]);
        decoded = true;
      } catch (e) {
        console.error(e);
        decoded = false;
      }
    }
  }

  return {
    result: result || null,
    decoded: decoded,
    error: error,
    errorMsg: errorMsg
  };
}
