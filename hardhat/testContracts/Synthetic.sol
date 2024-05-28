// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {MintableToken} from "./MintableToken.sol";
import {OracleLib, AggregatorV3Interface} from "./OracleLib.sol";


contract Synthetic is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;
    AggregatorV3Interface internal dataFeed;

    // State variables to store the last request ID, response, and error
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint64 subscriptionId;
    address public fetchData = address(this);
    // Custom error type
    error UnexpectedRequestID(bytes32 requestId);

    // Event to log responses
    event Response(
        bytes32 indexed requestId,
        string character,
        bytes response,
        bytes err
    );


    address router = 0xC22a79eBA640940ABB6dF0f7982cc119578E11De;

    // JavaScript source code
    string source =
        "const ticker = args[0];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://chainlink-wine.vercel.app/api/alpha/${ticker}`"
        "});"
        "if (apiResponse.error) {"
        "throw Error('Request failed');"
        "}"
        "const { data } = apiResponse;"
        "return Functions.encodeString(data);";

    //Callback gas limit
    uint32 gasLimit = 300000;

    bytes32 donID =
        0x66756e2d706f6c79676f6e2d616d6f792d310000000000000000000000000000;

    // State variable to store the returned character information
    string public price;

    mapping(address => uint256) public depositedAmount;
    mapping(address => MintableToken) public syntheticTokens;
    // uint256 public constant DEPOSIT_AMOUNT = 1 ether;
    uint256 lastStockPrice;


      constructor(uint64 _subId) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        subscriptionId = _subId;
            dataFeed = AggregatorV3Interface(
            0xF0d50568e3A7e8259E16663972b11910F89BD8e7
        );
      }

 function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }


         function sendRequest(
        string[] calldata args
    ) internal onlyOwner returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source); // Initialize the request with JS code
        if (args.length > 0) req.setArgs(args); // Set the arguments for the request

        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        return s_lastRequestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }
        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        price = string(response);
        s_lastError = err;

        // Emit an event to log the response
        emit Response(requestId, price, s_lastResponse, s_lastError);
    }

    

    function bytesToUint(bytes32 _bytes) internal pure returns (uint256) {
        return uint256(_bytes);
    }

function depositAndMint(
    // uint256 amountToMint,
    string memory _name,
    string memory _symbol,
    string[] calldata _stock
) external payable {
    //fetch stock price
    bytes32 stockPriceBytes32 = sendRequest(_stock);
    uint256 stockPrice = bytesToUint(stockPriceBytes32);
    lastStockPrice = stockPrice;

    //fetch the price of eth in usd???? using chainlink price feeds
    int ethPriceInUsd = getChainlinkDataFeedLatestAnswer();
    require(msg.value > 0, "Insufficient deposit amount");
    depositedAmount[msg.sender] += msg.value;
    uint256 mintableEthAmount = depositedAmount[msg.sender] / 2; // 50% of deposited amount
    uint256 usdAmountForMinting = uint256(ethPriceInUsd) / mintableEthAmount;
    uint256 TotalMintabelTokens = usdAmountForMinting / stockPrice;

    MintableToken newToken = new MintableToken(
        _name,
        _symbol,
        TotalMintabelTokens
    );
    syntheticTokens[msg.sender] = newToken;
    newToken.mint(msg.sender, TotalMintabelTokens);

    //store minted tokens to address mapping
    //emit an event for total minted tokens to address
}

    // function redeemAndBurn(uint256 amountToBurn) external {
    //     require(
    //         syntheticTokens[msg.sender].balanceOf(msg.sender) >= amountToBurn,
    //         "Insufficient token balance"
    //     );
    //     syntheticTokens[msg.sender].burn(msg.sender, amountToBurn);
    //     uint256 redeemAmount = (amountToBurn * DEPOSIT_AMOUNT) /
    //         syntheticTokens[msg.sender].totalSupply();
    //     depositedAmount[msg.sender] -= redeemAmount;
    //     payable(msg.sender).transfer(redeemAmount);
    // }
}
