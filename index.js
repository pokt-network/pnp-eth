var packageData = require('./package.json'),
    Web3 = require('web3'),
    ethAbiDecoder = require('ethereumjs-abi');

function parseOpts(opts) {
  return {
    ethNode: opts['eth_node'] || 'http://127.0.0.1:8545',
    networkId: opts['network_id'] || '5777'
  }
}

module.exports.getPluginDefinition = function() {
  return {
    network: 'ETH',
    version: packageData.version,
    package_name: 'pnp-eth'
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
      rpcResponse = web3.currentProvider.send({
        jsonrpc: '2.0',
        method: query.rpc_method,
        params: query.rpc_params
      });
      result = rpcResponse.result;
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
