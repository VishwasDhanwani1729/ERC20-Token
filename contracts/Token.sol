pragma solidity ^0.5.12;
/*
    find out about keywords - indexed, success, view
*/
contract Token {
    uint256 public totalSupply;
    string public tokenName='ERC20 Token';
    string public symbol='ERC20';
    string public standard='032 034 066';

    mapping(address=>uint256) public balanceOf;
    mapping(address=>mapping(address=>uint256)) public allowance;

    event Transfered(
        address indexed from,
        address indexed to,
        uint256 value
    );
    event Approval(
        address indexed from,
        address indexed to,
        uint256 value
    );
    
    constructor(uint256 initialSupply) public{
        balanceOf[msg.sender]=initialSupply;
        totalSupply=initialSupply;
    }
    function transfer(address to, uint256 value) public returns(bool success){
        require(balanceOf[msg.sender]>=value);
        balanceOf[msg.sender]-=value;
        balanceOf[to]+=value;

        emit Transfered(msg.sender,to,value);
        return true;
    }

    function approval(address sender,uint256 value) public returns(bool success){
        allowance[msg.sender][sender]=value;        
        emit Approval(msg.sender,sender,value);
        return true;
    }

    function transferFrom(address from,address to,uint256 value) public returns(bool success){
        require(balanceOf[from]>=value);
        require(allowance[from][msg.sender]>=value);
        balanceOf[from]-=value;
        balanceOf[to]+=value;
        allowance[from][msg.sender]-=value;
        emit Transfered(from, to, value);
        return true;
    }
}
