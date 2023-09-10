pragma solidity ^0.8.17;
import "./contractA_safe_bank.sol";
import "./contractB_safe_upgradeable.sol";
import "./contractC_proxy_contract.sol";

contract SafeFactory {
    // Stores the address of the Safe Implementation in a storage.
    bytes32 private constant IMPLEMENTATION_SLOT = bytes32(uint(keccak256("eip1967.proxy.implementation")) - 1);
    address public owner;
    SafeBank public safe_contract;
    SafeUpgradeable public proxified_safe_upgradeable_contract;
    SafeUpgradeableProxy public proxy;

    // Deploy SafeUpgradeable contract and store its address in storage
    constructor() {
        owner = msg.sender;
        SafeUpgradeable safe_upgradeable_contract = new SafeUpgradeable();
        _reset_logic(address(safe_upgradeable_contract));
    }

    function get_logic() external view returns (address) {
        return _get_logic();
    }

    // The Safe implementation address can only be updated by the owner of the Factory contract.
    function updateImplementation(address new_logic) external onlyOwner {
        _reset_logic(new_logic);
        _deploySafeProxy(msg.sender);
    }
    
    // Deploys a proxy, points the proxy to the current Safe Implementation. Initializes the proxy so that the message sender is the owner of the new Safe.
    function deploySafeProxy() external {
        _deploySafeProxy(msg.sender);
    }
    function _deploySafeProxy(address _owner) private {
        proxy = new SafeUpgradeableProxy(_owner, address(_get_logic()));
        proxified_safe_upgradeable_contract = SafeUpgradeable(address(proxy));
        proxified_safe_upgradeable_contract.initialize(_owner);
    }

    // Deploys the original Safe contract. Note that you might need to modify the Safe contract so that the original caller of the deploySafe contract will be the owner of the deployed "Safe” contract.
    function deploySafe() external {
        safe_contract = new SafeBank(msg.sender);
    }

    function get_owner_of_deploySafeProxy() external view returns (address) {
        return proxified_safe_upgradeable_contract.get_owner();
    }   

    function get_owner_of_deploySafe() external view returns (address) {
        return safe_contract.get_owner();
    }

    function _reset_logic(address _logic) private {
        require(_logic.code.length > 0, "implementation is not contract");
        StorageSlot.writeToStorageSlot(IMPLEMENTATION_SLOT, _logic);
    }

    function _get_logic() private view returns (address) {
        return StorageSlot.readFromStorageSlot(IMPLEMENTATION_SLOT);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}