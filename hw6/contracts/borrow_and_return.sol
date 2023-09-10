pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BorrowAndReturn {
    address public bankToken;
    constructor(address _bankToken) {
        bankToken = _bankToken;
    }

    function executeWithMoney(uint256 amount) external {
        // just return the bankToken loan
        IERC20(bankToken).transfer(msg.sender, amount); 
    }
}