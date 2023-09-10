pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleErc20Token is ERC20 {
    constructor(string memory name,
                string memory symbol,
                uint256 init_supply) 
                ERC20(name, symbol) {
        _mint(msg.sender, init_supply);
    }
}


