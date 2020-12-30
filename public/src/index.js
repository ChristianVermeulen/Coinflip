import "./style.scss";
import Coinflip from './game.js';

$(document).ready(function(){
    window.ethereum.enable().then((accounts) => {
        let game = new Coinflip("0x59ef6B0B5B8E667256b791Ed19D2241BF19Ef8F4", accounts[0]);
    });
})
