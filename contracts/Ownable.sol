// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;


contract Ownable {
    address private owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
}
