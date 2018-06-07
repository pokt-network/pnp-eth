# pnp-eth
An Ethereum Plugin for the Pocket Node app.

## Install Plugin
To install the plugin, first install [Pocket Node](https://github.com/pokt-network/pocket-node) and then run the following command:

`pocket-node install pnp-eth`

## Configuration
To configure your plugin run the following command:

`pocket-node configure ETH /path/to/file.json`

The following object describes the format of the JSON file you need to use to configure this plugin.

***Notes:***
* The `eth_node` attribute must be a HTTP or HTTPS url.
* The default values are the ones shown below.

```
{
  "eth_node": "http://localhost:8545",
  "eth_network_id": "5777"
}
```

## Submitting requests to a Pocket Node using this plugin
Before diving into the specifications on how to submit requests to the Ethereum network with this plugin, please review the Pocket Node Client Developer documentation found [here](https://github.com/pokt-network/pocket-node/blob/master/CLIENT_DEVELOPERS.md).

### Submitting transactions
Transactions must be signed with the account private key and submitted in the `serialized_tx` param of the `/transactions` endpoint. The `tx_metadata` param can be left blank.

### Executing queries
To execute a query, please specify an object like the following as your `query` param in the request to the `/queries` endpoint of the Node:

***Notes:***
The `rpc_method` found below comes from the [Ethereum JSON RPC Specification](https://github.com/ethereum/wiki/wiki/JSON-RPC), please refer to it in order to craft your requests.

```
{
  rpc_method: 'eth_getBalance',
  rpc_params: [<array with params>]
}
```
