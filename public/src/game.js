import Web3 from '../node_modules/web3/dist/web3.min.js';
import abi from './abi/coinflip.js';

export default class Coinflip {
    constructor(contractAddress, account) {
        this.web3 = new Web3(Web3.givenProvider);
        this.contract = new this.web3.eth.Contract(abi, contractAddress);
        this.account = account;

        $('#deposit').on('click', this.deposit.bind(this));
        $('#play').on('click', this.play.bind(this));
        $('#profit').on('click', this.takeProfit.bind(this));

        this.web3.eth.subscribe("newBlockHeaders", this.updateBalances.bind(this));

        this.updateBalances();
    }

    play() {
      let me = this;
      $(".coin").addClass('rotate');
      $(".result").text('');
      this.contract.methods
          .play()
          .send({value: me.web3.utils.toWei($('input[name="bet"]').val()), from: me.account})
          .then(function(res){
              me.updateBalances();
              let won = res.events.Played.returnValues.won;

              if (won) {
                  $("#result").append('You won!<br/>');
                  $(".coin").removeClass('rotate');
                  $(".result").text('You won!').addClass('won').removeClass('lost');
              } else {
                  $("#result").append('You lost!<br/>');
                  $(".result").text('You lost!').addClass('lost').removeClass('won');
                  $(".coin").removeClass('rotate');
              }
          })
      ;
    }

    deposit() {
      this.contract.methods.deposit()
          .send({value: this.web3.utils.toWei($('input[name="bet"]').val()), from: this.account})
          .then(this.updateBalances.bind(this))
      ;
    }

    takeProfit() {
      let me = this;
      this.contract.methods.extractProfit(me.web3.utils.toWei($('input[name="bet"]').val(), "Ether"))
          .send({from: this.account})
          .then(function(res){
              me.updateBalances();
          })
      ;
    }

    updateBalances(){
        let me = this;
        this.web3.eth.getBalance(this.account).then(this.updatePlayerBalance.bind(this));
        this.web3.eth.getBalance(this.contract.options.address).then(this.updateGameBalance.bind(this));
    }

    updatePlayerBalance(res) {
      $("#balance").text(this.web3.utils.fromWei(res, "Ether"));
    }

    updateGameBalance(res) {
      $("#gameBalance").text(this.web3.utils.fromWei(res, "Ether"));
    }
}
