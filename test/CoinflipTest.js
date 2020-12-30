const Coinflip = artifacts.require("Coinflip");
const truffleAssert = require('truffle-assertions');

contract("Coinflip", accounts => {
    let instance;

    before(async function(){
        instance = await Coinflip.deployed();
    })

    it("Should be able to handle deposit.", async function(){
        let fiveEth = parseInt(web3.utils.toWei("5", "Ether"));
        let tx = await instance.deposit({value: fiveEth, from: accounts[0]});

        truffleAssert.eventEmitted(tx, 'Deposited', function(ev){
            return ev.amount == fiveEth && ev.depositedBy == accounts[0];
        });

        let contractBalance = await web3.eth.getBalance(instance.address);

        assert(parseInt(contractBalance) === fiveEth, 'Contract balance is not correct');
    });

    it("Should not accept play when contract balance is low", async function(){
        let tenEth = parseInt(web3.utils.toWei("10", "Ether"));
        await truffleAssert.fails(instance.play(
            {value: tenEth, from: accounts[1]}),
            truffleAssert.ErrorType.REVERT,
            "The contract does not hold enough balance to pay out a win."
        );
    })

    it("Should be able to play.", async function(){
        let startPlayerBalance = await web3.eth.getBalance(accounts[1]);
        let oneEth = web3.utils.toWei("1", "Ether");
        let tx = await instance.play({value: oneEth, from: accounts[1]});

        let won;
        truffleAssert.eventEmitted(tx, 'Played', function(ev){
            won = ev.won;
            return ev.player == accounts[1];
        });

        let contractBalance = await web3.eth.getBalance(instance.address);
        let playerBalance = await web3.eth.getBalance(accounts[1]);

        if (won) {
            truffleAssert.eventEmitted(tx, 'Won', function(ev){
                return ev.bet.toString() === oneEth && ev.player === accounts[1];
            });

            assert(contractBalance === web3.utils.toWei("4", "Ether"), 'Contract balance should be 4 ether');
            assert(parseInt(playerBalance) > parseInt(startPlayerBalance), "Player balance should have increased.");
        } else {
            truffleAssert.eventEmitted(tx, 'Lost', (ev) => {
                return ev.bet.toString() === oneEth && ev.player === accounts[1];
            });

            assert(contractBalance === web3.utils.toWei("6", "Ether"), 'Contract balance should be 6 ether');
            assert(parseInt(playerBalance) < parseInt(startPlayerBalance), "Player balance should have decreased");
        }
    });

    it("Should be able to extract profit", async function(){
        let instance = await Coinflip.new();
        let fiveEth = web3.utils.toWei("5", "Ether");
        await instance.deposit({value: fiveEth});
        let tx = await instance.extractProfit(fiveEth, {from: accounts[0]});

        truffleAssert.eventEmitted(tx, 'ProfitExtracted', (ev) => {
            return ev.amount.toString() === fiveEth;
        });

        let contractBalance = await web3.eth.getBalance(instance.address);
        assert(parseInt(contractBalance) === 0, "Balance should be 0 after extraction.");
    })

    it("Should not extract profits to non-owner.", async function(){
        await truffleAssert.fails(
            instance.extractProfit(1, {from: accounts[1]}),
            truffleAssert.ErrorType.Revert,
            "Only the owner can perform this."
        );
    })

    it("Should not extract more then the contract holds.", async function(){
        await truffleAssert.fails(
            instance.extractProfit(web3.utils.toWei("10", "Ether"), {from: accounts[0]}),
            truffleAssert.ErrorType.Revert,
            "You can not extract more then the contract holds."
        );
    })
});
