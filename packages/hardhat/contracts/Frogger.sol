pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Frogger is ERC20 {
    constructor() ERC20("Frogger", "FROG") {
        _mint(msg.sender, 1000 ether); // mints 1000 Frogger!
    }
}
