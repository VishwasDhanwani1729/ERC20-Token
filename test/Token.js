let token = artifacts.require('./Token');
contract('Token',function(accounts){
    it('contract created with correct token name',function(){
        return token.deployed().then(function(instance){
            tokenInstance = instance;
            // console.log(tokenInstance);
            return tokenInstance.tokenName();
        }).then(function(name){
            assert.equal(name,'ERC20 Token','correct token name');
            return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol,'ERC20','correct symbol');
            return tokenInstance.standard();
        }).then(function(standard){
            assert.equal(standard,'032 034 066','correct standard');    
        });
    });

    it('sets the total supply upon deployment',function(){
        return token.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            // console.log(totalSupply.toNumber());
            assert.equal(totalSupply.toNumber(),1000000,'totalSupply is set');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            // console.log(balance.toNumber());
            assert.equal(balance.toNumber(),1000000,'it allocates initial supply t admin account')
        });
    });

    it('transfer token ownership',function(){
        return token.deployed().then(function(inst){
            instance = inst;
            return instance.transfer.call(accounts[1],77777777777777777777);
        }).then(assert.fail).catch(function(error){
            // console.log(error.message);
            assert(error.message.indexOf('overflow')>=0,'error message must contain overflow');
            return instance.transfer(accounts[1],250000,{from:accounts[0]});
        }).then(function(receipt){
            // console.log(receipt.logs[0].args);
            assert.equal(receipt.logs.length,1,'only 1 event is triggered');
            assert.equal(receipt.logs[0].event,'Transfered','transfered event called');
            assert.equal(receipt.logs[0].args.from,accounts[0],'token send from');
            assert.equal(receipt.logs[0].args.to,accounts[1],'token send to');
            assert.equal(receipt.logs[0].args.value,250000,'value send');
            
            return instance.balanceOf(accounts[1]);
        }).then(function(balance){
            // console.log(accounts[1]);
            // console.log(balance);
            // assert
            assert.equal(balance.toNumber(),250000,'add the amount to the receiving acc.');
            return instance.balanceOf(accounts[0]);
        }).then(function(balance){
            assert.equal(balance.toNumber(),750000,'deduct the amount from the sender acc.');
            // console.log(accounts);
            // console.log(balance);
            // // console.log(instance.balanceOf(accounts[0]).toNumber());
        });
    });

    it('approves delegate transfers',function(){
        return token.deployed().then(function(ins){
            instance = ins;
            return instance.approval.call(accounts[1],100);
        }).then(function(success){
            assert(success,'returns true');
            return instance.approval(accounts[1],100,{from:accounts[0]});
        }).then(function(receipt){
            // console.log(receipt);
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Approval','approval event called');
            assert.equal(receipt.logs[0].args.from,accounts[0],'aprroval send from');
            assert.equal(receipt.logs[0].args.to,accounts[1],'approval send to');
            assert.equal(receipt.logs[0].args.value,100,'logs the transfer ammount');
            return instance.allowance(accounts[0],accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(),100,'allowance value');
        });
    });

    it('handles delegate token transfers',function(){
        return token.deployed().then(function(ins){
            instance =ins;
            return instance.transfer(accounts[2],100,{from:accounts[0]});
        }).then(function(receipt){
            return instance.approval(accounts[4],10,{from:accounts[2]});
        }).then(function(receipt){
            return instance.transferFrom(accounts[2],accounts[3],7777,{from:accounts[4]});
        }).then(assert.fail).catch(function(error){
            console.log(error.message);
            assert(error.message.indexOf('revert')>=0,'cannot transfer value larger than balance');
            return instance.transferFrom.call(accounts[2],accounts[3],10,{from:accounts[4]});
        }).then(function(success){
            assert(success);
            return instance.transferFrom(accounts[2],accounts[3],10,{from:accounts[4]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,'only 1 event is triggered');
            assert.equal(receipt.logs[0].event,'Transfered','transfered event called');
            assert.equal(receipt.logs[0].args.from,accounts[2],'token send from');
            assert.equal(receipt.logs[0].args.to,accounts[3],'token send to');
            assert.equal(receipt.logs[0].args.value,10,'value send');
            return instance.balanceOf(accounts[2]);
        }).then(function(balance){
            assert.equal(balance,90,'deduct the amount from the spending account');
            return instance.balanceOf(accounts[3]);
        }).then(function(balance){
            assert.equal(balance,10,'add the amount to the receiving account');
            return instance.allowance(accounts[2],accounts[4]);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(),0,'deduct the amount from the spending account');
        });
    });
});