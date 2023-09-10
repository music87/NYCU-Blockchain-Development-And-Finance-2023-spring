pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Develop an ERC20 token
contract SimpleErc20Token is ERC20, Ownable {
    constructor(string memory name,
                string memory symbol,
                uint256 init_supply) 
                ERC20(name, symbol) {
        
        _mint(msg.sender, init_supply * 10 ** decimals());
    }
    // 18 decimals.
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
    // Minting and burning capability with onlyOwner access control.
    function mint(address account, uint256 amount) onlyOwner public {
        _mint(account, amount);
    }
    function burn(address account, uint256 amount) onlyOwner public {
        _burn(account, amount);
    }

    // Ability to transfer ownership
    function transferOwnership(address new_owner) public onlyOwner virtual override {
        require(new_owner != address(0));
        _transferOwnership(new_owner);
    }

}


