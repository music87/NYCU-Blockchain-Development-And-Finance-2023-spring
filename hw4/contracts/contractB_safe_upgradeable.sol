pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Similar to contractA, but an implementation contract that can be initialized by the initialization function by the owner.
// The owner can also upgrade the implementation contract.

contract SafeUpgradeable {
    using SafeMath for uint256;

    address public owner; // The contract should have an owner.
    mapping(address => mapping(address => uint256)) public balance;
    mapping(address => mapping(address => uint256)) public fees;
    // 0.1% fee
    uint256 public constant FEE_PERCENT_NUMERATOR = 1; 
    uint256 public constant FEE_PERCENT_DENOMINATOR = 1000;
    bool isInitialized;
    // change constructor to initialization function
    // original version:
    // constructor(address _owner) {
    //     owner = _owner;
    // }
    // new version:
    function initialize(address _owner) external {
        //require(address(this).code.length == 0, 'not in constructor');
        require(!isInitialized, 'already initialized');
        isInitialized = true;
        owner = _owner;
    }

    function deposit(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Invalid amount");
        uint256 fee = amount.mul(FEE_PERCENT_NUMERATOR).div(FEE_PERCENT_DENOMINATOR); // Calculate the fee
        ERC20(token).transferFrom(msg.sender, address(this), amount);
        
        balance[msg.sender][token] = SafeMath.add(balance[msg.sender][token], amount); // Deposit the amount
        balance[msg.sender][token] = SafeMath.sub(balance[msg.sender][token], fee); // Deduct the fee
        fees[msg.sender][token] = SafeMath.add(fees[msg.sender][token], fee); // Accumulate the fee
    }

    function withdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(balance[msg.sender][token] >= amount, "Not enough funds");
        balance[msg.sender][token] = SafeMath.sub(balance[msg.sender][token], amount);
        ERC20(token).transfer(msg.sender, amount);
    }

    function takefee(address token) external onlyOwner {
        require(fees[msg.sender][token] > 0, "No fees to take");

        ERC20(token).transfer(owner, fees[msg.sender][token]);
        fees[msg.sender][token] = 0;
    }

    function get_balance(address token) external view onlyOwner returns (uint256) {
        return balance[msg.sender][token];
    }

    function get_fee(address token) external view onlyOwner returns (uint256) {
        return fees[msg.sender][token];
    }

    function get_owner() external view returns (address) {
        return owner;
    }

     modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

}