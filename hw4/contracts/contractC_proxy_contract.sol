pragma solidity ^0.8.17;

library StorageSlot {

    function readFromStorageSlot(bytes32 slot) internal view returns (address) {
        address value;
        assembly {
            value := sload(slot)
        }
        return value;
    }

    function writeToStorageSlot(bytes32 slot, address newValue) internal {
        assembly {
            sstore(slot, newValue)
        }
    }
}

contract SafeUpgradeableProxy {
    bytes32 private constant IMPLEMENTATION_SLOT = bytes32(uint(keccak256("eip1967.proxy.implementation")) - 1);
    bytes32 private constant OWNER_SLOT = bytes32(uint(keccak256("eip1967.proxy.owner")) - 1);
    
    constructor(address _owner, address _logic) {
        _reset_owner(_owner);
        _reset_logic(_logic);
    }

    function update_logic(address _logic) external onlyOwner {
        _reset_logic(_logic);
    }

    function get_logic() external view returns (address) {
        return _get_logic();
    }

    function get_owner() external view returns (address) {
        return _get_owner();
    }

    fallback(bytes calldata callData) external returns (bytes memory resultData)
    {
        // forward the unhandled call to the logic contract, executing it in
        // our own state context.
        address logic =_get_logic();
        bool success;
        (success, resultData) = logic.delegatecall(callData);
        
        if (!success) {
            // bubble up the revert if the call failed.
            assembly { revert(add(resultData, 0x20), mload(resultData)) }
        }
        // Otherwise, the raw resultData will be returned.
    }

    function _reset_owner(address _owner) private {
        require(_owner != address(0), "owner = zero address");
        StorageSlot.writeToStorageSlot(OWNER_SLOT, _owner);
    }
    function _get_owner() private view returns (address) {
        return StorageSlot.readFromStorageSlot(OWNER_SLOT);
    }

    function _reset_logic(address _logic) private {
        require(_logic.code.length > 0, "implementation is not contract");
        StorageSlot.writeToStorageSlot(IMPLEMENTATION_SLOT, _logic);
    }
    function _get_logic() private view returns (address) {
        return StorageSlot.readFromStorageSlot(IMPLEMENTATION_SLOT);
    }

    modifier onlyOwner() {
        require(msg.sender == _get_owner(), "Only owner can call this function");
        _;
    }
}


