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
* The `eth_node` attribute must be a HTTP url.
* The default values are the ones shown below.

```
{
  "eth_node": "http://localhost:8545",
  "eth_network_id": "5777"
}
```
