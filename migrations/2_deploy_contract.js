var token = artifacts.require('./Token.sol');
var tokenSale = artifacts.require('./TokenSale');
var web3 = require('web3');
module.exports = function(deployer){
    deployer.deploy(token,1000000).then(function(){
        var tokenPrice = web3.utils.toWei('0.01','ether');
        return deployer.deploy(tokenSale,token.address,tokenPrice);
    });
}