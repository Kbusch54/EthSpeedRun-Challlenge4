// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title DEX Template
 * @author stevepham.eth and m00npapi.eth
 * @notice Empty DEX.sol that just outlines what features could be part of the challenge (up to you!)
 * @dev We want to create an automatic market where our contract will hold reserves of both ETH and 🎈 Balloons. These reserves will provide liquidity that allows anyone to swap between the assets.
 * NOTE: functions outlined here are what work with the front end of this branch/repo. Also return variable names that may need to be specified exactly may be referenced (if you are confused, see solutions folder in this repo and/or cross reference with front-end code).
 */
contract DEX {
    /* ========== GLOBAL VARIABLES ========== */

    using SafeMath for uint256; //outlines use of SafeMath for uint256 variables
    IERC20 token; //instantiates the imported contract

    
    mapping(address =>uint256)totalLiquidityPerTok;

    mapping(address => mapping(address=>uint256))public userLiquidityTok;

    mapping (address => uint256)public balancesPerTok;

    mapping(address => bool)public approvedTokens;


    /* ========== EVENTS ========== */

    /**
     * @notice Emitted when ethToToken() swap transacted
     */

    event EthToTokenSwap(address swapper,address tokenAddress, uint tokenSwap, uint ethSwapped,string swapPair);

    /**
     * @notice Emitted when tokenToEth() swap transacted
     */
    event TokenToEthSwap(address swapper,uint ethSwapped,address tokenAddress, uint tokensSwapped,string swapPair);

    /**
     * @notice Emitted when liquidity provided to DEX and mints LPTs.
     */
    event LiquidityProvided(address liquidator,address tokenAddress, uint liquidityMinted, uint value, uint tokensDeposited);

    /**
     * @notice Emitted when liquidity removed from DEX and decreases LPT count within DEX.
     */
    event LiquidityRemoved(address liquidator, uint amount, uint ethAmount,address tokenAddress, uint tokenAmount);
    

    /* ========== CONSTRUCTOR ========== */

    constructor() public {
         //specifies the token address that will hook into the interface and be used through the variable 'token'
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @notice initializes amount of tokens that will be transferred to the DEX itself from the erc20 contract mintee (and only them based on how Balloons.sol is written). Loads contract up with both ETH and Balloons.
     * @param tokens amount to be transferred to DEX
     * @return totalLiquidity is the number of LPTs minting as a result of deposits made to DEX contract
     * NOTE: since ratio is 1:1, this is fine to initialize the totalLiquidity (wrt to balloons) as equal to eth balance of contract.
     */
    function init(uint256 tokens,address _tokenAddress) public payable returns (uint256) {
        require(totalLiquidityPerTok[_tokenAddress] == 0, "DEX: init this token - already has liquidity");
        require(approvedTokens[_tokenAddress]==false,"Token already approved");
        totalLiquidityPerTok[_tokenAddress] = msg.value;
        userLiquidityTok[_tokenAddress][msg.sender] =  totalLiquidityPerTok[_tokenAddress];
        balancesPerTok[_tokenAddress]=msg.value;
        require(IERC20(_tokenAddress).transferFrom(msg.sender, address(this), tokens), "DEX: init - transfer did not transact");
        approvedTokens[_tokenAddress] = true;
        return totalLiquidityPerTok[_tokenAddress];
    }

    /**
     * @notice returns yOutput, or yDelta for xInput (or xDelta)
     * @dev Follow along with the [original tutorial](https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90) Price section for an understanding of the DEX's pricing model and for a price function to add to your contract. You may need to update the Solidity syntax (e.g. use + instead of .add, * instead of .mul, etc). Deploy when you are done.
     */
    function price(
        uint256 xInput,
        uint256 xReserves,
        uint256 yReserves
    ) public pure returns (uint256 yOutput) {
        uint256 xInputWithFee = xInput.mul(997);
        uint256 numerator = xInputWithFee.mul(yReserves);
        uint256 denominator = (xReserves.mul(1000)).add(xInputWithFee);
        return (numerator / denominator);
    }

    function getUserLiquidityTok(address _userAdd, address _tokenAddress)public view returns(uint256){
       return userLiquidityTok[_tokenAddress][_userAdd];

    }
     function getBalancesPerTok(address _addr)public view returns(uint256){
        return balancesPerTok[_addr];
    }
    function getTotalLiquidityPerTok(address _tokenAddress)public view returns(uint256){
        return totalLiquidityPerTok[_tokenAddress];

    }
   

    /**
     * @notice returns liquidity for a user. Note this is not needed typically due to the `liquidity()` mapping variable being public and having a getter as a result. This is left though as it is used within the front end code (App.jsx).
     * if you are using a mapping liquidity, then you can use `return liquidity[lp]` to get the liquidity for a user.
     *
     */
    function getLiquidity(address lp ,address _tokenAddress) public view returns (uint256) {
        return userLiquidityTok[_tokenAddress][lp];
        
    }

    /**
     * @notice sends Ether to DEX in exchange for $TOK
     */
    function ethToToken(address _tokenAddress) public payable returns (uint256 tokenOutput) {
        require(approvedTokens[_tokenAddress] ==true,"Token has not been added to dex");
        require(msg.value >0,"Eth value must be above zero for swap");
        uint ethAmt = msg.value;
        uint ethReserve = balancesPerTok[_tokenAddress];
        uint256 tokenReserve = IERC20(_tokenAddress).balanceOf(address(this));
        uint tokensToSend = price(ethAmt, ethReserve, tokenReserve);

       require(IERC20(_tokenAddress).transfer(msg.sender, tokensToSend),"EthToken swap reverted");
       balancesPerTok[_tokenAddress]+=ethAmt;
        emit EthToTokenSwap(msg.sender,_tokenAddress, tokensToSend, msg.value,"Eth to Balloons");
        return tokensToSend;
    }

    /**
     * @notice sends $BAL tokens to DEX in exchange for Ether
     */
    function tokenToEth(uint256 tokenInput,address _tokenAddress) public returns (uint256 ethOutput) {
        require(tokenInput > 0, "cannot swap 0 tokens");
        require(approvedTokens[_tokenAddress] ==true,"Token has not been added to dex");
        uint256 tokenReserve = IERC20(_tokenAddress).balanceOf(address(this));
        uint256 ethToSend = price(tokenInput, tokenReserve, balancesPerTok[_tokenAddress]);

        require(IERC20(_tokenAddress).transferFrom(msg.sender, address(this), tokenInput),"tokenToEth: reverted swap.");
        (bool successs ,) = msg.sender.call{value: ethToSend}("");
        require(successs,"Failed to send eth");
        balancesPerTok[_tokenAddress]-=ethToSend;
        emit TokenToEthSwap(msg.sender, ethToSend, _tokenAddress,tokenInput,"Balloons to ETH" );
        return ethToSend;
    }


    /**
     * @notice allows deposits of $BAL and $ETH to liquidity pool
     * NOTE: parameter is the msg.value sent with this function call. That amount is used to determine the amount of $BAL needed as well and taken from the depositor.
     * NOTE: user has to make sure to give DEX approval to spend their tokens on their behalf by calling approve function prior to this function call.
     * NOTE: Equal parts of both assets will be removed from the user's wallet with respect to the price outlined by the AMM.
     */
    function deposit(address _tokenAddress) public payable returns (uint256 tokensDeposited) {
        require(approvedTokens[_tokenAddress] ==true,"Token has not been added to dex");
        uint ethReserve = balancesPerTok[_tokenAddress];
        uint tokenReserve = IERC20(_tokenAddress).balanceOf(address(this));


        tokensDeposited = (msg.value.mul(tokenReserve) / ethReserve).add(1);
        uint liquidityMinted = msg.value.mul(totalLiquidityPerTok[_tokenAddress]) / ethReserve;


        userLiquidityTok[_tokenAddress][msg.sender] = userLiquidityTok[_tokenAddress][msg.sender].add(liquidityMinted);
        balancesPerTok[_tokenAddress]+=msg.value;
        totalLiquidityPerTok[_tokenAddress] = totalLiquidityPerTok[_tokenAddress].add(liquidityMinted);   
        require(IERC20(_tokenAddress).transferFrom(msg.sender, address(this), tokensDeposited));
        emit LiquidityProvided(msg.sender,_tokenAddress, liquidityMinted, msg.value, tokensDeposited);
        return tokensDeposited; 

    }

    /**
     * @notice allows withdrawal of $BAL and $ETH from liquidity pool
     * NOTE: with this current code, the msg caller could end up getting very little back if the liquidity is super low in the pool. I guess they could see that with the UI.
     */
    function withdraw(uint256 amount,address _tokenAddress) public returns (uint256 eth_amount, uint256 token_amount) {
        require(approvedTokens[_tokenAddress] ==true,"Token has not been added to dex");
        require(userLiquidityTok[_tokenAddress][msg.sender] >= amount, "withdraw: sender does not have enough liquidity to withdraw.");
        uint256 ethReserve = balancesPerTok[_tokenAddress];
        uint256 tokenReserve = IERC20(_tokenAddress).balanceOf(address(this));
        uint256 ethWithdrawn;
        uint256 totalLiquidity = totalLiquidityPerTok[_tokenAddress];
        uint256 liquidity = userLiquidityTok[_tokenAddress][msg.sender];

        ethWithdrawn = amount.mul(ethReserve) / totalLiquidityPerTok[_tokenAddress];

        uint256 tokenAmount = amount.mul(tokenReserve) / totalLiquidityPerTok[_tokenAddress];
        userLiquidityTok[_tokenAddress][msg.sender] = liquidity.sub(amount);
        totalLiquidityPerTok[_tokenAddress] = totalLiquidity.sub(amount);
        (bool sent, ) = payable(msg.sender).call{ value: ethWithdrawn }("");
        require(sent, "withdraw(): revert in transferring eth to you!");
        require(IERC20(_tokenAddress).transfer(msg.sender, tokenAmount));
        emit LiquidityRemoved(msg.sender, amount, ethWithdrawn,_tokenAddress, tokenAmount);
        return (ethWithdrawn, tokenAmount);
    }
}
