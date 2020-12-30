// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "./Ownable.sol";


contract Coinflip is Ownable {
    uint private balance;

    event Deposited (
        uint amount,
        address depositedBy
    );

    event Played (
        address indexed player,
        bool won
    );

    event Won (
        uint bet,
        address indexed player
    );

    event Lost (
        uint bet,
        address indexed player
    );

    event ProfitExtracted(
        uint amount
    );

    /// Fill the contract with some balance
    function deposit() public payable {
        require(msg.value > 0, "Deposit at least more then 0.");

        uint oldBalance = balance;
        balance += msg.value;

        assert(balance == oldBalance + msg.value);

        emit Deposited(msg.value, msg.sender);
    }

    /// Allow the owner to extract profit from the game
    function extractProfit(uint amount) public onlyOwner {
        require(balance >= amount, "You can not extract more then the contract holds.");
        uint oldBalance = balance;
        balance -= amount;

        address payable recipient = payable(msg.sender);
        recipient.transfer(amount);

        assert(balance == oldBalance - amount);
        emit ProfitExtracted(amount);
    }

    /// Play the game
    function play() public payable {
        require(balance >= msg.value, "The contract does not hold enough balance to pay out a win.");
        uint bet = msg.value;
        bool won = flip() == 1;

        emit Played(msg.sender, won);

        if (won == false) {
            handleLoss(bet);
        } else {
            handleWin(bet, msg.sender);
        }
    }

    function handleLoss(uint bet) private {
        uint oldBalance = balance;
        balance += bet;
        assert(balance == oldBalance + bet);

        emit Lost(bet, msg.sender);
    }

    function handleWin(uint bet, address player) private {
        uint oldBalance = balance;
        balance -= bet;
        assert(balance == oldBalance - bet);

        address payable recipient = payable(player);
        recipient.transfer(bet * 2);

        emit Won(bet, msg.sender);
    }

    // Determine a win with pseudorandomness for now
    function flip() private view returns(uint) {
        return block.timestamp % 2;
    }
}
