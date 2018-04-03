var packageData = require('./package.json'),
    Web3 = require('web3');

function parseOpts(opts) {
  return {
    ethNode: opts['eth_node'] || 'http://localhost:8545',
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

module.exports.submitTransaction = async function(serializedTx, opts) {
  var parsedOpts = parseOpts(opts),
      ethNode = parsedOpts.ethNode,
      networkId = parsedOpts.networkId,
      web3 = new Web3(new Web3.providers.HttpProvider(ethNode)),
      serializedTx = serializedTx.startsWith('0x') ? serializedTx : ('0x' + serializedTx),
      txHash = null,
      error = null;

  try {
    txHash = await web3.eth.sendRawTransaction(serializedTx);
  } catch (e) {
    console.error(e);
    txHash = null;
    error = 'Failed to submit transaction';
  }

  return {
    hash: txHash,
    metadata: {},
    error: error
  };
}

module.exports.verifyTransaction = async function(txHash, opts) {
  var parsedOpts = parseOpts(opts),
      web3 = new Web3(new Web3.providers.HttpProvider(ethNode)),
      txReceipt = null,
      txVerifiable = false,
      result = false;

  try {
    txReceipt = await web3.eth.getTransactionReceipt(txHash);
    txVerifiable = txReceipt ? true : false;
    result = txVerifiable && txReceipt.status === '0x1' ? true : false;
  } catch (e) {
    console.error(e);
    txVerifiable = false;
    result = false;
  }

  return {
    tx_verifiable: txVerifiable,
    result: result
  };
}
