let token = artifacts.require('./Token');
let tokenSale = artifacts.require('./TokenSale');
// let web3 = require('web3');
contract('TokenSale',function(accounts){
    var tokenPrice = web3.utils.toWei('0.01','ether');
    it('initialize the contract correctly',function(){
        return tokenSale.deployed().then(function(inst){
            instance = inst;
            return instance.address;
        }).then(function(address){
            // console.log(address);
            assert.notEqual(address,'0x0','has contract address');
            return instance.tokenContract();
        }).then(function(address){
            // console.log(address);
            assert.notEqual(address,'0x0','has token contract address');
            return instance.tokenPrice();
        }).then(function(price){
            // console.log(price);
            assert.equal(price,tokenPrice,'token price');
        });
    });

    it('facilitates token buying',function(){
        return token.deployed().then(function(inst){
            tokenInstance = inst;
            return tokenSale.deployed();
        }).then(function(instance){
            sale=instance;
            return tokenInstance.transfer(sale.address,750000,{from:accounts[0]});
        }).then(function(receipt){
            noOfTokens=10;
            return sale.buyTokens(noOfTokens,{from:accounts[1],value:noOfTokens*web3.utils.toWei('0.01','ether')});
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,'sale event triggered');
            assert.equal(receipt.logs[0].event,'Sell','Sell event triggered');
            assert.equal(receipt.logs[0].args.buyer,accounts[1],'account-1');
            assert.equal(receipt.logs[0].args.amount,noOfTokens,'no of tokens');
            return sale.tokenSold();
        }).then(function(amt){
            assert.equal(amt.toNumber(),noOfTokens,'increment the no of tokens sold');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            assert.equal(balance,noOfTokens,'account1 balance');
            return tokenInstance.balanceOf(sale.address);
        }).then(function(balance){
            assert.equal(balance,750000-noOfTokens);
            return sale.buyTokens(noOfTokens,{from:accounts[1],value:1});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert')>=0,'msg value must equal no of tokens');
            return sale.buyTokens(80000,{from:accounts[1],value:noOfTokens*web3.utils.toWei('0.01','ether')});
        }).then(assert.fail).catch(function(err){
            assert(err.message.indexOf('revert')>=0,'cannnot purchase more tokens than available');
        });
    });

    it('end token sale',function(){
        return token.deployed().then(function(inst){
            tokenInstance = inst;
            return tokenSale.deployed();
        }).then(function(sinst){
            sale = sinst;
            return sale.endSale({from:accounts[1],value:10000});
        }).then(assert.fail).catch(function(err){
            assert(err.message.indexOf('revert')>=0,'must be admin acc.');
            return sale.endSale({from:accounts[0],value:10000});
        }).then(function(receipt){
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            // console.log(balance);
            assert.equal(balance.toNumber(),999990,'returns all unsold tokens to admin');   //999990???
            web3.eth.getBalance(sale.address, function(error, result) {
            //    console.log('@',result); 
               assert.equal(result,0,'token sale balance must be 0');
            });
            balance = web3.eth.getBalance(sale.address);
        });
    });
});