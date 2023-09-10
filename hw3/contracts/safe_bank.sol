pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Create a simple safe contract that allows everyone to store funds in the contract.

contract SafeBank is Ownable {
    using SafeMath for uint256;
    mapping(address => mapping(address => uint256)) public balance;

    function deposit(address token, uint256 amount) external {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Invalid amount");
        ERC20(token).transferFrom(msg.sender, address(this), amount);
        balance[msg.sender][token] = SafeMath.add(balance[msg.sender][token], amount);
    }

    function withdraw(address token, uint256 amount) external {
        require(token != address(0), "Invalid token address");
        require(balance[msg.sender][token] >= amount, "Not enough funds");
        balance[msg.sender][token] = SafeMath.sub(balance[msg.sender][token], amount);
        ERC20(token).transfer(msg.sender, amount);
    }

    function get_balance(address token) public view returns (uint256) {
        return balance[msg.sender][token];
    }
}