pragma solidity ^0.5.12;
import "./Token.sol";
contract TokenSale{
    address admin;
    Token public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;
    event Sell(address buyer, uint256 amount);

    constructor(Token _tokenContract,uint256 _tokenPrice) public{
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x,uint y) internal pure returns(uint z){
        require(y==0 || (z=x*y)/y==x);
    }

    function buyTokens(uint256 noOfTokens) public payable{
        require(msg.value==multiply(noOfTokens,tokenPrice));
        require(tokenContract.balanceOf(address(this))>=noOfTokens);
        require(tokenContract.transfer(msg.sender, noOfTokens));    //on Token.sol balanceOf is like no of tokens for that balance
        tokenSold += noOfTokens;
        emit Sell(msg.sender,noOfTokens);
    }
    function endSale() public payable {
        require(msg.sender==admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        address payable add = address(uint160(admin));
        selfdestruct(add);
    }
}